
-- Create table to store manufacturing order step field values
CREATE TABLE public.manufacturing_order_step_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manufacturing_order_step_id UUID NOT NULL REFERENCES public.manufacturing_order_steps(id) ON DELETE CASCADE,
  field_id TEXT NOT NULL,
  field_value TEXT NOT NULL,
  merchant_id UUID NOT NULL REFERENCES public.merchants(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.manufacturing_order_step_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view step values from their merchant" 
  ON public.manufacturing_order_step_values 
  FOR SELECT 
  USING (merchant_id = (SELECT get_user_merchant_id()));

CREATE POLICY "Users can create step values for their merchant" 
  ON public.manufacturing_order_step_values 
  FOR INSERT 
  WITH CHECK (merchant_id = (SELECT get_user_merchant_id()));

CREATE POLICY "Users can update step values from their merchant" 
  ON public.manufacturing_order_step_values 
  FOR UPDATE 
  USING (merchant_id = (SELECT get_user_merchant_id()));

CREATE POLICY "Users can delete step values from their merchant" 
  ON public.manufacturing_order_step_values 
  FOR DELETE 
  USING (merchant_id = (SELECT get_user_merchant_id()));

-- Add updated_at trigger
CREATE TRIGGER update_manufacturing_order_step_values_updated_at
  BEFORE UPDATE ON public.manufacturing_order_step_values
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
