
-- Update manufacturing_order_steps table to allow partially_completed status
ALTER TABLE manufacturing_order_steps 
DROP CONSTRAINT IF EXISTS manufacturing_order_steps_status_check;

ALTER TABLE manufacturing_order_steps 
ADD CONSTRAINT manufacturing_order_steps_status_check 
CHECK (status IN ('pending', 'in_progress', 'completed', 'partially_completed'));
