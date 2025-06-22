
-- Fix the get_next_rework_order_number function to properly increment rework numbers
DROP FUNCTION IF EXISTS public.get_next_rework_order_number(text);

CREATE OR REPLACE FUNCTION public.get_next_rework_order_number(base_order_number text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    next_rework_num INTEGER;
    current_merchant_id UUID;
    new_order_number TEXT;
    attempt_count INTEGER := 0;
    max_attempts INTEGER := 10;
BEGIN
    SELECT get_user_merchant_id() INTO current_merchant_id;
    
    -- Loop to handle race conditions with advisory locking
    LOOP
        attempt_count := attempt_count + 1;
        
        -- Use advisory lock to prevent concurrent access
        PERFORM pg_advisory_lock(hashtext(current_merchant_id::text || '_rework_' || base_order_number));
        
        BEGIN
            -- Get the highest rework number for this base order
            -- Look for patterns like MO000001-R1, MO000001-R2, etc.
            SELECT COALESCE(
                MAX(
                    CASE 
                        WHEN order_number ~ ('^' || base_order_number || '-R[0-9]+$')
                        THEN CAST(SUBSTRING(order_number FROM LENGTH(base_order_number || '-R') + 1) AS INTEGER)
                        ELSE 0
                    END
                ), 0
            ) + 1
            INTO next_rework_num
            FROM manufacturing_orders 
            WHERE merchant_id = current_merchant_id
            AND order_number ~ ('^' || base_order_number || '-R[0-9]+$');
            
            -- Create the rework order number with proper suffix
            new_order_number := base_order_number || '-R' || next_rework_num::TEXT;
            
            -- Check if this exact order number already exists
            IF NOT EXISTS (
                SELECT 1 FROM manufacturing_orders 
                WHERE order_number = new_order_number 
                AND merchant_id = current_merchant_id
            ) THEN
                -- Release the advisory lock before returning
                PERFORM pg_advisory_unlock(hashtext(current_merchant_id::text || '_rework_' || base_order_number));
                RETURN new_order_number;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            -- Release lock on any error
            PERFORM pg_advisory_unlock(hashtext(current_merchant_id::text || '_rework_' || base_order_number));
            RAISE;
        END;
        
        -- Release the advisory lock before next attempt
        PERFORM pg_advisory_unlock(hashtext(current_merchant_id::text || '_rework_' || base_order_number));
        
        -- If we've tried too many times, exit with error
        IF attempt_count >= max_attempts THEN
            RAISE EXCEPTION 'Unable to generate unique rework order number after % attempts', max_attempts;
        END IF;
        
        -- Small delay to reduce race condition likelihood
        PERFORM pg_sleep(random() * 0.1 + 0.05);
    END LOOP;
END;
$function$;
