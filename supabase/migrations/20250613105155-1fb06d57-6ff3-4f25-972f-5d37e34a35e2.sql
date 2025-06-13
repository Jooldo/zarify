
-- Delete all manufacturing order step values
DELETE FROM manufacturing_order_step_values;

-- Delete all manufacturing order steps
DELETE FROM manufacturing_order_steps;

-- Delete all manufacturing orders
DELETE FROM manufacturing_orders;

-- Delete all manufacturing step fields configuration
DELETE FROM manufacturing_step_fields;

-- Delete all manufacturing steps
DELETE FROM manufacturing_steps;

-- Reset the in_manufacturing column in finished_goods to 0
UPDATE finished_goods SET in_manufacturing = 0;
