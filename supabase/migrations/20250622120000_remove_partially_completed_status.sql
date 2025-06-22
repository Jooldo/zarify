
-- Remove partially_completed status from manufacturing_order_steps table
ALTER TABLE manufacturing_order_steps 
DROP CONSTRAINT IF EXISTS manufacturing_order_steps_status_check;

ALTER TABLE manufacturing_order_steps 
ADD CONSTRAINT manufacturing_order_steps_status_check 
CHECK (status IN ('pending', 'in_progress', 'completed'));

-- Update any existing partially_completed records to in_progress
UPDATE manufacturing_order_steps 
SET status = 'in_progress' 
WHERE status = 'partially_completed';
