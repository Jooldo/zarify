
-- Drop and recreate the get_next_manufacturing_order_number function with better race condition handling
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
    
    -- Loop to handle race conditions with random backoff
    LOOP
        attempt_count := attempt_count + 1;
        
        -- Get the highest order number for this merchant with SELECT FOR UPDATE to prevent race conditions
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
        WHERE merchant_id = current_merchant_id
        FOR UPDATE;
        
        -- Create the order number
        new_order_number := 'MO' || LPAD(next_num::TEXT, 6, '0');
        
        -- Try to insert a dummy record to test uniqueness
        BEGIN
            INSERT INTO manufacturing_orders (
                order_number, 
                product_name, 
                quantity_required, 
                priority, 
                merchant_id, 
                status
            ) VALUES (
                new_order_number, 
                '__TEMP_TEST__', 
                1, 
                'low', 
                current_merchant_id, 
                'pending'
            );
            
            -- If successful, delete the test record and return the number
            DELETE FROM manufacturing_orders 
            WHERE order_number = new_order_number 
            AND product_name = '__TEMP_TEST__';
            
            RETURN new_order_number;
            
        EXCEPTION WHEN unique_violation THEN
            -- If we get a unique violation, try again with next number
            CONTINUE;
        END;
        
        -- If we've tried too many times, exit with error
        IF attempt_count >= max_attempts THEN
            RAISE EXCEPTION 'Unable to generate unique order number after % attempts', max_attempts;
        END IF;
        
        -- Random delay to reduce race condition likelihood
        PERFORM pg_sleep(random() * 0.1 + 0.01);
    END LOOP;
END;
$function$;
