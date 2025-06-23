
-- Delete all manufacturing orders and related data
-- First delete related manufacturing_order_steps (due to foreign key constraints)
DELETE FROM public.manufacturing_order_steps;

-- Then delete all manufacturing orders
DELETE FROM public.manufacturing_orders;
