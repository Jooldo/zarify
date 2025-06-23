
-- Drop the existing unique constraint that prevents parallel steps
ALTER TABLE manufacturing_order_step_data 
DROP CONSTRAINT IF EXISTS manufacturing_order_step_data_order_id_step_name_key;

-- Add new columns for instance tracking
ALTER TABLE manufacturing_order_step_data 
ADD COLUMN IF NOT EXISTS instance_id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS instance_number INTEGER DEFAULT 1;

-- Update existing records to have instance_number = 1
UPDATE manufacturing_order_step_data 
SET instance_number = 1 
WHERE instance_number IS NULL;

-- Make instance_number NOT NULL after setting defaults
ALTER TABLE manufacturing_order_step_data 
ALTER COLUMN instance_number SET NOT NULL;

-- Create new unique constraint on order_id, step_name, and instance_number
ALTER TABLE manufacturing_order_step_data 
ADD CONSTRAINT manufacturing_order_step_data_order_step_instance_unique 
UNIQUE (order_id, step_name, instance_number);

-- Create function to get next instance number for a step
CREATE OR REPLACE FUNCTION get_next_step_instance_number(p_order_id UUID, p_step_name TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_instance INTEGER;
BEGIN
    SELECT COALESCE(MAX(instance_number), 0) + 1
    INTO next_instance
    FROM manufacturing_order_step_data
    WHERE order_id = p_order_id 
    AND step_name = p_step_name;
    
    RETURN next_instance;
END;
$$;
