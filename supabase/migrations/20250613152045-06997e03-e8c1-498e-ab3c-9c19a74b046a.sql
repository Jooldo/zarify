
-- Fix manufacturing order number constraint to be per-merchant instead of global
-- This will resolve the duplicate key error when multiple merchants create orders

-- First, drop the existing global unique constraint on order_number
ALTER TABLE public.manufacturing_orders DROP CONSTRAINT IF EXISTS manufacturing_orders_order_number_key;

-- Add new constraint that ensures order_number is unique per merchant
-- This allows different merchants to have the same order numbers (MO000001, etc.)
ALTER TABLE public.manufacturing_orders 
ADD CONSTRAINT manufacturing_orders_order_number_merchant_key 
UNIQUE (order_number, merchant_id);
