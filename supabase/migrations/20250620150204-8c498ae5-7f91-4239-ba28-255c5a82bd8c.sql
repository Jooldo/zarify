
-- Fix the manufacturing order status update function with better logic
CREATE OR REPLACE FUNCTION public.update_manufacturing_order_status()
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
BEGIN
    -- Get the order ID from the step
    IF TG_OP = 'DELETE' THEN
        order_id := OLD.manufacturing_order_id;
    ELSE
        order_id := NEW.manufacturing_order_id;
    END IF;
    
    -- Get current order status and merchant_id
    SELECT status, merchant_id INTO current_status, order_merchant_id
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
    -- Only mark as completed if:
    -- 1. We have created all the required steps (total_order_steps = total_manufacturing_steps)
    -- 2. ALL created steps are completed (completed_steps = total_order_steps)
    -- 3. We have at least one step
    IF total_order_steps = total_manufacturing_steps 
       AND completed_steps = total_order_steps 
       AND total_order_steps > 0 THEN
        new_status := 'completed';
    ELSIF in_progress_steps > 0 OR completed_steps > 0 THEN
        new_status := 'in_progress';
    ELSE
        new_status := 'pending';
    END IF;
    
    -- Enhanced debug logging to help troubleshoot
    RAISE LOG 'Order %, Merchant: %, Total manufacturing steps: %, Total order steps: %, Completed steps: %, In progress: %, New status: %', 
        order_id, order_merchant_id, total_manufacturing_steps, total_order_steps, completed_steps, in_progress_steps, new_status;
    
    -- Update the manufacturing order status only if not tagged_in
    UPDATE manufacturing_orders 
    SET status = new_status, updated_at = now()
    WHERE id = order_id AND status != 'tagged_in';
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$function$;
