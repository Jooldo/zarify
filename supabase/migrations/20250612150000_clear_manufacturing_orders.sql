
-- Clear existing manufacturing orders to resolve constraint conflicts
DELETE FROM manufacturing_order_steps;
DELETE FROM manufacturing_orders;
