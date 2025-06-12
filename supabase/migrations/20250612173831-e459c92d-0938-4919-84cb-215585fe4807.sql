
-- Clear manufacturing order step values first (due to foreign key constraints)
DELETE FROM manufacturing_order_step_values;

-- Clear manufacturing order steps
DELETE FROM manufacturing_order_steps;

-- Clear manufacturing orders
DELETE FROM manufacturing_orders;

-- Clear manufacturing step fields
DELETE FROM manufacturing_step_fields;

-- Clear manufacturing steps
DELETE FROM manufacturing_steps;
