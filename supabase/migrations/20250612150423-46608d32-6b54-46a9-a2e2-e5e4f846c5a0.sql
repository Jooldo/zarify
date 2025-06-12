
-- Clear all manufacturing order data to start fresh
DELETE FROM manufacturing_order_steps;
DELETE FROM manufacturing_orders;

-- Reset any sequences or constraints that might be causing issues
-- This ensures we start with a clean slate
