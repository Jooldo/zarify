
-- Delete all invoice items first (due to foreign key constraints)
DELETE FROM invoice_items;

-- Delete all invoices
DELETE FROM invoices;

-- Delete all inventory tags related to orders
DELETE FROM inventory_tags WHERE order_id IS NOT NULL;

-- Delete all order items
DELETE FROM order_items;

-- Delete all orders
DELETE FROM orders;

-- Reset the order number sequence by clearing any cached values
-- (The next order will start from OD000001 again)
