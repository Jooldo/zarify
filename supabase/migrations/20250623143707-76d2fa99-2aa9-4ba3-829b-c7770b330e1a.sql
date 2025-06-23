
-- Add parent_instance_id column to manufacturing_order_step_data table
ALTER TABLE public.manufacturing_order_step_data 
ADD COLUMN parent_instance_id uuid REFERENCES public.manufacturing_order_step_data(id);

-- Add index for better query performance
CREATE INDEX idx_manufacturing_order_step_data_parent_instance_id 
ON public.manufacturing_order_step_data(parent_instance_id);
