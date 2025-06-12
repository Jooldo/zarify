
-- Drop and recreate the get_next_manufacturing_order_number function with proper race condition handling
DROP FUNCTION IF EXISTS public.get_next_manufacturing_order_number();

CREATE OR REPLACE FUNCTION public.get_next_manufacturing_order_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    next_num INTEGER;
    current_merchant_id UUID;
    new_order_number TEXT;
    attempt_count INTEGER := 0;
    max_attempts INTEGER := 10;
BEGIN
    SELECT get_user_merchant_id() INTO current_merchant_id;
    
    -- Loop to handle race conditions
    LOOP
        attempt_count := attempt_count + 1;
        
        -- Get the highest order number for this merchant (without FOR UPDATE on aggregate)
        SELECT COALESCE(
            MAX(
                CASE 
                    WHEN order_number ~ '^MO[0-9]+$' 
                    THEN CAST(SUBSTRING(order_number FROM 3) AS INTEGER)
                    ELSE 0
                END
            ), 0
        ) + 1
        INTO next_num
        FROM manufacturing_orders 
        WHERE merchant_id = current_merchant_id;
        
        -- Create the order number
        new_order_number := 'MO' || LPAD(next_num::TEXT, 6, '0');
        
        -- Check if this order number already exists
        IF NOT EXISTS (
            SELECT 1 FROM manufacturing_orders 
            WHERE order_number = new_order_number 
            AND merchant_id = current_merchant_id
        ) THEN
            RETURN new_order_number;
        END IF;
        
        -- If we've tried too many times, exit with error
        IF attempt_count >= max_attempts THEN
            RAISE EXCEPTION 'Unable to generate unique order number after % attempts', max_attempts;
        END IF;
        
        -- Small random delay to reduce race condition likelihood
        PERFORM pg_sleep(random() * 0.01 + 0.001);
    END LOOP;
END;
$function$;
