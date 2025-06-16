
-- Add step_order column to manufacturing_order_steps table
ALTER TABLE public.manufacturing_order_steps 
ADD COLUMN step_order INTEGER;

-- Update existing records to populate step_order from manufacturing_steps
UPDATE public.manufacturing_order_steps 
SET step_order = ms.step_order
FROM public.manufacturing_steps ms
WHERE manufacturing_order_steps.manufacturing_step_id = ms.id;

-- Make step_order NOT NULL after populating existing data
ALTER TABLE public.manufacturing_order_steps 
ALTER COLUMN step_order SET NOT NULL;

-- Add index for performance on step_order queries
CREATE INDEX idx_manufacturing_order_steps_step_order ON public.manufacturing_order_steps(manufacturing_order_id, step_order);

-- Update the trigger function to populate step_order when creating new order steps
CREATE OR REPLACE FUNCTION public.create_next_manufacturing_step(p_manufacturing_order_id uuid, p_current_step_order integer)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    next_step_record RECORD;
    new_step_id UUID;
    order_merchant_id UUID;
BEGIN
    -- Get the merchant_id from the manufacturing order
    SELECT merchant_id INTO order_merchant_id
    FROM manufacturing_orders
    WHERE id = p_manufacturing_order_id;
    
    -- Get the next manufacturing step
    SELECT id, step_order 
    INTO next_step_record
    FROM manufacturing_steps 
    WHERE merchant_id = order_merchant_id
      AND is_active = true 
      AND step_order = p_current_step_order + 1
    ORDER BY step_order
    LIMIT 1;
    
    -- Create the next step if it exists
    IF next_step_record.id IS NOT NULL THEN
        INSERT INTO manufacturing_order_steps (
            manufacturing_order_id,
            manufacturing_step_id,
            step_order,
            status,
            merchant_id
        ) VALUES (
            p_manufacturing_order_id,
            next_step_record.id,
            next_step_record.step_order,
            'pending',
            order_merchant_id
        ) RETURNING id INTO new_step_id;
        
        RETURN new_step_id;
    END IF;
    
    RETURN NULL;
END;
$function$;

-- Update the trigger function for creating manufacturing order steps
CREATE OR REPLACE FUNCTION create_manufacturing_order_steps()
RETURNS TRIGGER AS $$
DECLARE
    step_record RECORD;
BEGIN
    -- Create order steps for all active manufacturing steps
    FOR step_record IN 
        SELECT id, step_order 
        FROM manufacturing_steps 
        WHERE merchant_id = NEW.merchant_id 
          AND is_active = true 
        ORDER BY step_order
    LOOP
        INSERT INTO manufacturing_order_steps (
            manufacturing_order_id,
            manufacturing_step_id,
            step_order,
            status,
            merchant_id
        ) VALUES (
            NEW.id,
            step_record.id,
            step_record.step_order,
            CASE WHEN step_record.step_order = 1 THEN 'pending' ELSE 'pending' END,
            NEW.merchant_id
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
