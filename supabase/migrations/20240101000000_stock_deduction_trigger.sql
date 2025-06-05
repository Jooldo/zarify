
-- Create function to handle stock deduction when order status changes
CREATE OR REPLACE FUNCTION handle_stock_deduction()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if status changed to 'Ready' or 'Delivered' from a different status
  IF (OLD.status IS DISTINCT FROM NEW.status) AND 
     (NEW.status IN ('Ready', 'Delivered')) AND 
     (OLD.status NOT IN ('Ready', 'Delivered')) THEN
    
    -- Deduct stock from finished_goods table
    UPDATE finished_goods 
    SET current_stock = current_stock - NEW.quantity,
        updated_at = now()
    WHERE product_config_id = NEW.product_config_id
      AND merchant_id = NEW.merchant_id;
    
    -- Log the deduction (optional)
    RAISE NOTICE 'Stock deducted: % units of product_config_id % for order_item %', 
                 NEW.quantity, NEW.product_config_id, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on order_items table
DROP TRIGGER IF EXISTS trigger_stock_deduction ON order_items;
CREATE TRIGGER trigger_stock_deduction
  AFTER UPDATE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION handle_stock_deduction();
