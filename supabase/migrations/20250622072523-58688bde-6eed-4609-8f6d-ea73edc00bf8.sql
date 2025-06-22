
-- Clear all manufacturing order data while preserving configuration
-- First delete dependent data (due to foreign key constraints)
DELETE FROM manufacturing_order_step_values;
DELETE FROM manufacturing_order_steps;
DELETE FROM manufacturing_material_reservations;
DELETE FROM manufacturing_orders;

-- Reset the order number sequence by clearing any cached values
-- This ensures the next manufacturing order will start from MO000001 again
