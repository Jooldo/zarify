
-- Add manufacturing_quantity column to manufacturing_orders table
ALTER TABLE public.manufacturing_orders 
ADD COLUMN manufacturing_quantity INTEGER;

-- Update the status check constraint to include 'tagged_in'
ALTER TABLE public.manufacturing_orders 
DROP CONSTRAINT IF EXISTS manufacturing_orders_status_check;

ALTER TABLE public.manufacturing_orders 
ADD CONSTRAINT manufacturing_orders_status_check 
CHECK (status IN ('pending', 'in_progress', 'completed', 'qc_failed', 'cancelled', 'tagged_in'));

-- Update the trigger function to handle the new status logic
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
    IF completed_steps = total_steps AND total_steps > 0 THEN
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
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$function$;
