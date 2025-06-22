
-- First, let's drop the existing constraint
ALTER TABLE manufacturing_orders DROP CONSTRAINT IF EXISTS manufacturing_orders_rework_source_step_id_fkey;

-- Now let's recreate it with the correct reference to manufacturing_order_steps table
ALTER TABLE manufacturing_orders 
ADD CONSTRAINT manufacturing_orders_rework_source_step_id_fkey 
FOREIGN KEY (rework_source_step_id) REFERENCES manufacturing_order_steps(id) ON DELETE SET NULL;

-- Let's also check if there are any existing invalid references by updating them to NULL
UPDATE manufacturing_orders 
SET rework_source_step_id = NULL 
WHERE rework_source_step_id IS NOT NULL 
AND rework_source_step_id NOT IN (SELECT id FROM manufacturing_order_steps);
