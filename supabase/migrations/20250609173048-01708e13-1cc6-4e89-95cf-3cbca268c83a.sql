
-- Create invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  merchant_id UUID NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(invoice_number, merchant_id)
);

-- Create invoice_items table
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items(id),
  product_config_id UUID NOT NULL REFERENCES product_configs(id),
  merchant_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create function to generate invoice numbers
CREATE OR REPLACE FUNCTION get_next_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_num INTEGER;
    current_merchant_id UUID;
    current_year TEXT;
BEGIN
    -- Get current user's merchant ID
    SELECT get_user_merchant_id() INTO current_merchant_id;
    
    -- Get current year
    SELECT EXTRACT(YEAR FROM CURRENT_DATE)::TEXT INTO current_year;
    
    -- Get the highest invoice number for this merchant and year
    SELECT COALESCE(
        MAX(
            CASE 
                WHEN invoice_number ~ ('^INV/' || current_year || '/[0-9]+$')
                THEN CAST(SUBSTRING(invoice_number FROM LENGTH('INV/' || current_year || '/') + 1) AS INTEGER)
                ELSE 0
            END
        ), 0
    ) + 1
    INTO next_num
    FROM invoices 
    WHERE merchant_id = current_merchant_id;
    
    -- Return formatted invoice number
    RETURN 'INV/' || current_year || '/' || LPAD(next_num::TEXT, 4, '0');
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_invoices_updated_at 
    BEFORE UPDATE ON invoices 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
