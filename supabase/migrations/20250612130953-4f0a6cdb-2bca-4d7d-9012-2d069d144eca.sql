
-- Create table to store manufacturing step field configurations
CREATE TABLE public.manufacturing_step_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manufacturing_step_id UUID NOT NULL REFERENCES public.manufacturing_steps(id) ON DELETE CASCADE,
  field_id TEXT NOT NULL,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('worker', 'date', 'number', 'text', 'status', 'multiselect')),
  is_required BOOLEAN NOT NULL DEFAULT false,
  field_options JSONB,
  merchant_id UUID NOT NULL REFERENCES public.merchants(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(manufacturing_step_id, field_id)
);

-- Add RLS policies
ALTER TABLE public.manufacturing_step_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view step fields from their merchant" 
  ON public.manufacturing_step_fields 
  FOR SELECT 
  USING (merchant_id = (SELECT get_user_merchant_id()));

CREATE POLICY "Users can create step fields for their merchant" 
  ON public.manufacturing_step_fields 
  FOR INSERT 
  WITH CHECK (merchant_id = (SELECT get_user_merchant_id()));

CREATE POLICY "Users can update step fields from their merchant" 
  ON public.manufacturing_step_fields 
  FOR UPDATE 
  USING (merchant_id = (SELECT get_user_merchant_id()));

CREATE POLICY "Users can delete step fields from their merchant" 
  ON public.manufacturing_step_fields 
  FOR DELETE 
  USING (merchant_id = (SELECT get_user_merchant_id()));

-- Add QC required field to manufacturing_steps table
ALTER TABLE public.manufacturing_steps 
ADD COLUMN qc_required BOOLEAN NOT NULL DEFAULT false;

-- Add updated_at trigger for manufacturing_step_fields
CREATE TRIGGER update_manufacturing_step_fields_updated_at
  BEFORE UPDATE ON public.manufacturing_step_fields
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
