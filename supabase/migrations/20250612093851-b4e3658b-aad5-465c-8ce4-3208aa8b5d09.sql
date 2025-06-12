
-- Create manufacturing_orders table
CREATE TABLE public.manufacturing_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  product_type TEXT,
  product_config_id UUID REFERENCES public.product_configs(id),
  quantity_required INTEGER NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'qc_failed', 'cancelled')),
  due_date DATE,
  special_instructions TEXT,
  created_by UUID REFERENCES auth.users(id),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies
ALTER TABLE public.manufacturing_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for manufacturing orders
CREATE POLICY "Users can view manufacturing orders from their merchant" 
  ON public.manufacturing_orders 
  FOR SELECT 
  USING (merchant_id = (SELECT get_user_merchant_id()));

CREATE POLICY "Users can create manufacturing orders for their merchant" 
  ON public.manufacturing_orders 
  FOR INSERT 
  WITH CHECK (merchant_id = (SELECT get_user_merchant_id()));

CREATE POLICY "Users can update manufacturing orders from their merchant" 
  ON public.manufacturing_orders 
  FOR UPDATE 
  USING (merchant_id = (SELECT get_user_merchant_id()));

CREATE POLICY "Users can delete manufacturing orders from their merchant" 
  ON public.manufacturing_orders 
  FOR DELETE 
  USING (merchant_id = (SELECT get_user_merchant_id()));

-- Create function to get next manufacturing order number
CREATE OR REPLACE FUNCTION public.get_next_manufacturing_order_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    next_num INTEGER;
    current_merchant_id UUID;
BEGIN
    SELECT get_user_merchant_id() INTO current_merchant_id;
    
    SELECT COALESCE(
        MAX(
            CASE 
                WHEN order_number ~ '^MO[0-9]+$' 
                THEN CAST(SUBSTRING(order_number FROM 3) AS INTEGER)
                ELSE 0
            END
        ), 0
    ) + 1
    INTO next_num
    FROM manufacturing_orders 
    WHERE merchant_id = current_merchant_id;
    
    RETURN 'MO' || LPAD(next_num::TEXT, 6, '0');
END;
$function$
