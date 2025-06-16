
-- Delete all manufacturing order step values first (due to foreign key constraints)
DELETE FROM manufacturing_order_step_values;

-- Delete all manufacturing order steps
DELETE FROM manufacturing_order_steps;

-- Delete all manufacturing orders
DELETE FROM manufacturing_orders;

-- Note: We're keeping manufacturing_steps and manufacturing_step_fields (the configuration)
-- as requested by the user
