
-- Delete all manufacturing-related data
-- Order matters due to foreign key constraints

-- First delete manufacturing order step values (references manufacturing_order_steps)
DELETE FROM manufacturing_order_step_values;

-- Then delete manufacturing order steps (references manufacturing_orders and manufacturing_steps)
DELETE FROM manufacturing_order_steps;

-- Delete manufacturing orders
DELETE FROM manufacturing_orders;

-- Delete manufacturing step fields (references manufacturing_steps)
DELETE FROM manufacturing_step_fields;

-- Finally delete manufacturing steps
DELETE FROM manufacturing_steps;
