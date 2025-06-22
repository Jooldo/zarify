
-- Add the missing assigned_to_step column to manufacturing_orders table
ALTER TABLE manufacturing_orders 
ADD COLUMN assigned_to_step INTEGER;

-- Add a comment to document the column purpose
COMMENT ON COLUMN manufacturing_orders.assigned_to_step IS 'The step number to which this rework order is assigned';
