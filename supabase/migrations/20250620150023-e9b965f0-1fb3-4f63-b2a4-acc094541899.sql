
-- Fix the manufacturing order status update function
CREATE OR REPLACE FUNCTION public.update_manufacturing_order_status()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    order_id UUID;
    total_steps INTEGER;
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
    
    -- Get current order status
    SELECT status INTO current_status
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
    
    -- Count total steps for this order
    SELECT COUNT(*) INTO total_steps
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
    -- Only mark as completed if ALL steps are completed AND we have at least one step
    IF completed_steps = total_steps AND total_steps > 0 AND completed_steps > 0 THEN
        new_status := 'completed';
    ELSIF in_progress_steps > 0 OR completed_steps > 0 THEN
        new_status := 'in_progress';
    ELSE
        new_status := 'pending';
    END IF;
    
    -- Debug logging to help troubleshoot
    RAISE LOG 'Order %, Total steps: %, Completed steps: %, In progress: %, New status: %', 
        order_id, total_steps, completed_steps, in_progress_steps, new_status;
    
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
