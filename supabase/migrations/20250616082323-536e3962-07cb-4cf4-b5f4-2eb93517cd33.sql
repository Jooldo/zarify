
-- Fix the create_first_manufacturing_order_step function to include step_order
CREATE OR REPLACE FUNCTION public.create_first_manufacturing_order_step()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    first_step_record RECORD;
BEGIN
    -- Get the first manufacturing step (step_order = 1)
    SELECT id, step_order 
    INTO first_step_record
    FROM manufacturing_steps 
    WHERE merchant_id = NEW.merchant_id 
      AND is_active = true 
      AND step_order = 1
    ORDER BY step_order
    LIMIT 1;
    
    -- Create only the first step if it exists
    IF first_step_record.id IS NOT NULL THEN
        INSERT INTO manufacturing_order_steps (
            manufacturing_order_id,
            manufacturing_step_id,
            step_order,
            status,
            merchant_id
        ) VALUES (
            NEW.id,
            first_step_record.id,
            first_step_record.step_order,
            'pending',
            NEW.merchant_id
        );
    END IF;
    
    RETURN NEW;
END;
$function$
