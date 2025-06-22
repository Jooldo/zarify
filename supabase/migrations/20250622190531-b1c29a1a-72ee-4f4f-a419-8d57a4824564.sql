
-- First, let's check if there's an incorrect foreign key constraint and remove it
ALTER TABLE manufacturing_orders DROP CONSTRAINT IF EXISTS manufacturing_orders_rework_source_step_id_fkey;

-- Add the correct foreign key constraint that references the manufacturing_order_steps table
ALTER TABLE manufacturing_orders 
ADD CONSTRAINT manufacturing_orders_rework_source_step_id_fkey 
FOREIGN KEY (rework_source_step_id) REFERENCES manufacturing_order_steps(id) ON DELETE SET NULL;
