
-- Update the reserve_raw_materials_for_manufacturing_order function to immediately deduct from current_stock
CREATE OR REPLACE FUNCTION public.reserve_raw_materials_for_manufacturing_order(p_manufacturing_order_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
            RAISE EXCEPTION 'Insufficient stock for material %: required %, available %', 
                material_record.material_name, required_quantity, material_record.current_stock;
        END IF;
        
        -- Immediately deduct from current_stock when reserving
        UPDATE raw_materials 
        SET current_stock = current_stock - required_quantity
        WHERE id = material_record.raw_material_id;
        
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
$function$;

-- Update the consume_reserved_materials function since deduction already happened during reservation
CREATE OR REPLACE FUNCTION public.consume_reserved_materials(p_manufacturing_order_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Just update reservation status to consumed since materials were already deducted during reservation
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
$function$;

-- Update the release_reserved_materials function to add back to current_stock
CREATE OR REPLACE FUNCTION public.release_reserved_materials(p_manufacturing_order_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Add back the reserved quantities to current_stock
    UPDATE raw_materials 
    SET current_stock = current_stock + reservations.quantity_reserved
    FROM (
        SELECT raw_material_id, quantity_reserved
        FROM manufacturing_material_reservations
        WHERE manufacturing_order_id = p_manufacturing_order_id
          AND status IN ('reserved', 'in_progress')
    ) reservations
    WHERE raw_materials.id = reservations.raw_material_id;
    
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
$function$;
