
-- Add columns to manufacturing_orders table for rework functionality
ALTER TABLE manufacturing_orders 
ADD COLUMN parent_order_id UUID REFERENCES manufacturing_orders(id),
ADD COLUMN rework_reason TEXT,
ADD COLUMN rework_source_step_id UUID REFERENCES manufacturing_order_steps(id),
ADD COLUMN rework_quantity INTEGER;

-- Add index for performance on parent-child relationships
CREATE INDEX idx_manufacturing_orders_parent_id ON manufacturing_orders(parent_order_id);

-- Create function to check if an order and all its child rework orders are completed
CREATE OR REPLACE FUNCTION check_order_completion_status(p_order_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    parent_status TEXT;
    child_count INTEGER;
    completed_child_count INTEGER;
BEGIN
    -- Get the current status of the order
    SELECT status INTO parent_status
    FROM manufacturing_orders
    WHERE id = p_order_id;
    
    -- Count total child rework orders
    SELECT COUNT(*) INTO child_count
    FROM manufacturing_orders
    WHERE parent_order_id = p_order_id;
    
    -- Count completed child rework orders
    SELECT COUNT(*) INTO completed_child_count
    FROM manufacturing_orders
    WHERE parent_order_id = p_order_id AND status = 'completed';
    
    -- If parent is completed and all children are completed (or no children), return completed
    IF parent_status = 'completed' AND child_count = completed_child_count THEN
        RETURN 'completed';
    -- If parent is completed but has pending children, return pending_rework
    ELSIF parent_status = 'completed' AND child_count > completed_child_count THEN
        RETURN 'pending_rework';
    ELSE
        RETURN parent_status;
    END IF;
END;
$$;

-- Update the existing manufacturing order status update function to handle rework
CREATE OR REPLACE FUNCTION update_manufacturing_order_status()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    order_id UUID;
    order_merchant_id UUID;
    total_manufacturing_steps INTEGER;
    total_order_steps INTEGER;
    completed_steps INTEGER;
    in_progress_steps INTEGER;
    current_status TEXT;
    new_status TEXT;
    parent_order_id_var UUID;
BEGIN
    -- Get the order ID from the step
    IF TG_OP = 'DELETE' THEN
        order_id := OLD.manufacturing_order_id;
    ELSE
        order_id := NEW.manufacturing_order_id;
    END IF;
    
    -- Get current order status, merchant_id, and parent_order_id
    SELECT status, merchant_id, parent_order_id 
    INTO current_status, order_merchant_id, parent_order_id_var
    FROM manufacturing_orders
    WHERE id = order_id;
    
    -- If already tagged_in, don't change status
    IF current_status = 'tagged_in' THEN
        IF TG_OP = 'DELETE' THEN
            RETURN OLD;
        ELSE
            RETURN NEW;
        END IF;
    END IF;
    
    -- Count total manufacturing steps that should exist for this merchant
    SELECT COUNT(*) INTO total_manufacturing_steps
    FROM manufacturing_steps
    WHERE merchant_id = order_merchant_id AND is_active = true;
    
    -- Count total order steps that have been created for this order
    SELECT COUNT(*) INTO total_order_steps
    FROM manufacturing_order_steps
    WHERE manufacturing_order_id = order_id;
    
    -- Count completed steps
    SELECT COUNT(*) INTO completed_steps
    FROM manufacturing_order_steps
    WHERE manufacturing_order_id = order_id AND status = 'completed';
    
    -- Count in-progress steps
    SELECT COUNT(*) INTO in_progress_steps
    FROM manufacturing_order_steps
    WHERE manufacturing_order_id = order_id AND status = 'in_progress';
    
    -- Determine new status based on step statuses
    IF total_order_steps = total_manufacturing_steps 
       AND completed_steps = total_order_steps 
       AND total_order_steps > 0 THEN
        new_status := 'completed';
    ELSIF in_progress_steps > 0 OR completed_steps > 0 THEN
        new_status := 'in_progress';
    ELSE
        new_status := 'pending';
    END IF;
    
    -- Update the manufacturing order status only if not tagged_in
    UPDATE manufacturing_orders 
    SET status = new_status, updated_at = now()
    WHERE id = order_id AND status != 'tagged_in';
    
    -- If this order has a parent and just completed, check parent status
    IF new_status = 'completed' AND parent_order_id_var IS NOT NULL THEN
        -- Update parent order status based on completion check
        UPDATE manufacturing_orders
        SET status = check_order_completion_status(parent_order_id_var)
        WHERE id = parent_order_id_var;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$function$;
