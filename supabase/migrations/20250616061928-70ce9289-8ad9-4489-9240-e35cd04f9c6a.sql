
-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS trigger_create_manufacturing_order_steps ON manufacturing_orders;
DROP FUNCTION IF EXISTS create_manufacturing_order_steps();

-- Create new function to create only the first step
CREATE OR REPLACE FUNCTION create_first_manufacturing_order_step()
RETURNS TRIGGER AS $$
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
            status,
            merchant_id
        ) VALUES (
            NEW.id,
            first_step_record.id,
            'pending',
            NEW.merchant_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger for first step only
CREATE TRIGGER trigger_create_first_manufacturing_order_step
    AFTER INSERT ON manufacturing_orders
    FOR EACH ROW
    EXECUTE FUNCTION create_first_manufacturing_order_step();

-- Create function to create the next step when current step is completed
CREATE OR REPLACE FUNCTION create_next_manufacturing_step(
    p_manufacturing_order_id UUID,
    p_current_step_order INTEGER
)
RETURNS UUID AS $$
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
            status,
            merchant_id
        ) VALUES (
            p_manufacturing_order_id,
            next_step_record.id,
            'pending',
            order_merchant_id
        ) RETURNING id INTO new_step_id;
        
        RETURN new_step_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
