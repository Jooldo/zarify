
-- Add in_manufacturing column to raw_materials table
ALTER TABLE raw_materials 
ADD COLUMN in_manufacturing integer DEFAULT 0;

-- Create manufacturing_material_reservations table to track reservations
CREATE TABLE manufacturing_material_reservations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manufacturing_order_id uuid NOT NULL,
  raw_material_id uuid NOT NULL,
  quantity_reserved numeric NOT NULL,
  quantity_consumed numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'reserved',
  merchant_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fk_manufacturing_order FOREIGN KEY (manufacturing_order_id) REFERENCES manufacturing_orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_raw_material FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id) ON DELETE CASCADE,
  CONSTRAINT fk_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX idx_manufacturing_material_reservations_order_id 
ON manufacturing_material_reservations(manufacturing_order_id);

CREATE INDEX idx_manufacturing_material_reservations_material_id 
ON manufacturing_material_reservations(raw_material_id);

CREATE INDEX idx_manufacturing_material_reservations_merchant_id 
ON manufacturing_material_reservations(merchant_id);

-- Create function to calculate and update raw material in_manufacturing quantities
CREATE OR REPLACE FUNCTION update_raw_material_manufacturing_quantities()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update in_manufacturing quantities for all raw materials
    UPDATE raw_materials 
    SET in_manufacturing = COALESCE(reserved_totals.total_reserved, 0)
    FROM (
        SELECT 
            raw_material_id,
            SUM(quantity_reserved - quantity_consumed) as total_reserved
        FROM manufacturing_material_reservations
        WHERE status IN ('reserved', 'in_progress')
        GROUP BY raw_material_id
    ) reserved_totals
    WHERE raw_materials.id = reserved_totals.raw_material_id;
    
    -- Set in_manufacturing to 0 for materials with no reservations
    UPDATE raw_materials 
    SET in_manufacturing = 0
    WHERE id NOT IN (
        SELECT DISTINCT raw_material_id 
        FROM manufacturing_material_reservations 
        WHERE status IN ('reserved', 'in_progress')
    );
END;
$$;

-- Create function to reserve raw materials for a manufacturing order
CREATE OR REPLACE FUNCTION reserve_raw_materials_for_manufacturing_order(p_manufacturing_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    order_record RECORD;
    material_record RECORD;
    required_quantity numeric;
BEGIN
    -- Get manufacturing order details
    SELECT mo.*, pc.id as product_config_id
    INTO order_record
    FROM manufacturing_orders mo
    LEFT JOIN product_configs pc ON mo.product_config_id = pc.id
    WHERE mo.id = p_manufacturing_order_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Manufacturing order not found';
    END IF;
    
    -- Reserve materials for each required raw material
    FOR material_record IN
        SELECT 
            pcm.raw_material_id,
            pcm.quantity_required,
            rm.name as material_name,
            rm.current_stock
        FROM product_config_materials pcm
        JOIN raw_materials rm ON pcm.raw_material_id = rm.id
        WHERE pcm.product_config_id = order_record.product_config_id
          AND pcm.merchant_id = order_record.merchant_id
    LOOP
        required_quantity := material_record.quantity_required * order_record.quantity_required;
        
        -- Check if we have enough stock (current_stock should be >= required for reservation)
        IF material_record.current_stock < required_quantity THEN
            RAISE NOTICE 'Insufficient stock for material %: required %, available %', 
                material_record.material_name, required_quantity, material_record.current_stock;
        END IF;
        
        -- Create reservation record
        INSERT INTO manufacturing_material_reservations (
            manufacturing_order_id,
            raw_material_id,
            quantity_reserved,
            merchant_id,
            status
        ) VALUES (
            p_manufacturing_order_id,
            material_record.raw_material_id,
            required_quantity,
            order_record.merchant_id,
            'reserved'
        );
    END LOOP;
    
    -- Update in_manufacturing quantities
    PERFORM update_raw_material_manufacturing_quantities();
END;
$$;

-- Create function to consume reserved materials when manufacturing starts
CREATE OR REPLACE FUNCTION consume_reserved_materials(p_manufacturing_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update reservations to consumed status and deduct from current_stock
    UPDATE raw_materials 
    SET current_stock = current_stock - reservations.quantity_reserved
    FROM (
        SELECT raw_material_id, quantity_reserved
        FROM manufacturing_material_reservations
        WHERE manufacturing_order_id = p_manufacturing_order_id
          AND status = 'reserved'
    ) reservations
    WHERE raw_materials.id = reservations.raw_material_id;
    
    -- Update reservation status to consumed
    UPDATE manufacturing_material_reservations
    SET 
        status = 'consumed',
        quantity_consumed = quantity_reserved,
        updated_at = now()
    WHERE manufacturing_order_id = p_manufacturing_order_id
      AND status = 'reserved';
    
    -- Update in_manufacturing quantities
    PERFORM update_raw_material_manufacturing_quantities();
END;
$$;

-- Create function to release reserved materials when order is cancelled
CREATE OR REPLACE FUNCTION release_reserved_materials(p_manufacturing_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update reservation status to cancelled
    UPDATE manufacturing_material_reservations
    SET 
        status = 'cancelled',
        updated_at = now()
    WHERE manufacturing_order_id = p_manufacturing_order_id
      AND status IN ('reserved', 'in_progress');
    
    -- Update in_manufacturing quantities
    PERFORM update_raw_material_manufacturing_quantities();
END;
$$;

-- Create trigger function to handle manufacturing order status changes
CREATE OR REPLACE FUNCTION handle_manufacturing_order_material_reservations()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- When order is created, reserve materials
    IF TG_OP = 'INSERT' THEN
        PERFORM reserve_raw_materials_for_manufacturing_order(NEW.id);
        RETURN NEW;
    END IF;
    
    -- When order status changes
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        -- When order starts (pending -> in_progress), consume materials
        IF OLD.status = 'pending' AND NEW.status = 'in_progress' THEN
            PERFORM consume_reserved_materials(NEW.id);
        END IF;
        
        -- When order is cancelled, release materials
        IF NEW.status = 'cancelled' THEN
            PERFORM release_reserved_materials(NEW.id);
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- When order is deleted, release materials
    IF TG_OP = 'DELETE' THEN
        PERFORM release_reserved_materials(OLD.id);
        RETURN OLD;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for manufacturing orders
CREATE TRIGGER manufacturing_order_material_reservations_trigger
    AFTER INSERT OR UPDATE OF status OR DELETE ON manufacturing_orders
    FOR EACH ROW
    EXECUTE FUNCTION handle_manufacturing_order_material_reservations();

-- Add updated_at trigger for manufacturing_material_reservations
CREATE TRIGGER update_manufacturing_material_reservations_updated_at
    BEFORE UPDATE ON manufacturing_material_reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
