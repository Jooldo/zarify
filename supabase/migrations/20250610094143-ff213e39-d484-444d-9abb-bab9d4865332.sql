
-- Add weight fields to inventory_tags table
ALTER TABLE inventory_tags 
ADD COLUMN net_weight NUMERIC,
ADD COLUMN gross_weight NUMERIC,
ADD COLUMN customer_id UUID REFERENCES customers(id),
ADD COLUMN order_id UUID REFERENCES orders(id),
ADD COLUMN order_item_id UUID REFERENCES order_items(id);

-- Create index for better performance on customer and order lookups
CREATE INDEX idx_inventory_tags_customer_id ON inventory_tags(customer_id);
CREATE INDEX idx_inventory_tags_order_id ON inventory_tags(order_id);
CREATE INDEX idx_inventory_tags_order_item_id ON inventory_tags(order_item_id);

-- Add comment to document the new fields
COMMENT ON COLUMN inventory_tags.net_weight IS 'Net weight of the product being tagged';
COMMENT ON COLUMN inventory_tags.gross_weight IS 'Gross weight of the product being tagged';
COMMENT ON COLUMN inventory_tags.customer_id IS 'Customer associated with tag out operations';
COMMENT ON COLUMN inventory_tags.order_id IS 'Order associated with tag out operations';
COMMENT ON COLUMN inventory_tags.order_item_id IS 'Specific order item associated with tag out operations';
