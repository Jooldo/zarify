
-- Create manufacturing_steps table to define production steps
CREATE TABLE public.manufacturing_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  description TEXT,
  estimated_duration_hours INTEGER DEFAULT 24,
  merchant_id UUID NOT NULL REFERENCES public.merchants(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create manufacturing_order_steps table to track order progress through steps
CREATE TABLE public.manufacturing_order_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manufacturing_order_id UUID NOT NULL REFERENCES public.manufacturing_orders(id) ON DELETE CASCADE,
  manufacturing_step_id UUID NOT NULL REFERENCES public.manufacturing_steps(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'skipped')),
  assigned_worker_id UUID REFERENCES public.workers(id),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  notes TEXT,
  merchant_id UUID NOT NULL REFERENCES public.merchants(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for manufacturing_steps
ALTER TABLE public.manufacturing_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view manufacturing steps from their merchant" 
  ON public.manufacturing_steps 
  FOR SELECT 
  USING (merchant_id = (SELECT get_user_merchant_id()));

CREATE POLICY "Users can create manufacturing steps for their merchant" 
  ON public.manufacturing_steps 
  FOR INSERT 
  WITH CHECK (merchant_id = (SELECT get_user_merchant_id()));

CREATE POLICY "Users can update manufacturing steps from their merchant" 
  ON public.manufacturing_steps 
  FOR UPDATE 
  USING (merchant_id = (SELECT get_user_merchant_id()));

CREATE POLICY "Users can delete manufacturing steps from their merchant" 
  ON public.manufacturing_steps 
  FOR DELETE 
  USING (merchant_id = (SELECT get_user_merchant_id()));

-- Add RLS policies for manufacturing_order_steps
ALTER TABLE public.manufacturing_order_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view manufacturing order steps from their merchant" 
  ON public.manufacturing_order_steps 
  FOR SELECT 
  USING (merchant_id = (SELECT get_user_merchant_id()));

CREATE POLICY "Users can create manufacturing order steps for their merchant" 
  ON public.manufacturing_order_steps 
  FOR INSERT 
  WITH CHECK (merchant_id = (SELECT get_user_merchant_id()));

CREATE POLICY "Users can update manufacturing order steps from their merchant" 
  ON public.manufacturing_order_steps 
  FOR UPDATE 
  USING (merchant_id = (SELECT get_user_merchant_id()));

CREATE POLICY "Users can delete manufacturing order steps from their merchant" 
  ON public.manufacturing_order_steps 
  FOR DELETE 
  USING (merchant_id = (SELECT get_user_merchant_id()));

-- Add indexes for performance
CREATE INDEX idx_manufacturing_steps_merchant_order ON manufacturing_steps(merchant_id, step_order);
CREATE INDEX idx_manufacturing_order_steps_order_id ON manufacturing_order_steps(manufacturing_order_id);
CREATE INDEX idx_manufacturing_order_steps_step_id ON manufacturing_order_steps(manufacturing_step_id);
CREATE INDEX idx_manufacturing_order_steps_worker_id ON manufacturing_order_steps(assigned_worker_id);

-- Insert default manufacturing steps for jewelry production
INSERT INTO public.manufacturing_steps (step_name, step_order, description, estimated_duration_hours, merchant_id) 
SELECT 
  step_name,
  step_order,
  description,
  estimated_duration_hours,
  m.id as merchant_id
FROM (
  VALUES 
    ('Jhalai', 1, 'Initial metal preparation and forming', 8),
    ('Dhol', 2, 'Metal shaping and refining process', 12),
    ('Stone Setting', 3, 'Setting precious stones and gems', 16),
    ('Polish', 4, 'Final polishing and finishing', 6),
    ('QC Check', 5, 'Quality control inspection', 2),
    ('Final Inspection', 6, 'Final quality verification before completion', 1)
) AS steps(step_name, step_order, description, estimated_duration_hours)
CROSS JOIN public.merchants m;

-- Add trigger to automatically create order steps when manufacturing order is created
CREATE OR REPLACE FUNCTION create_manufacturing_order_steps()
RETURNS TRIGGER AS $$
DECLARE
    step_record RECORD;
BEGIN
    -- Create order steps for all active manufacturing steps
    FOR step_record IN 
        SELECT id, step_order 
        FROM manufacturing_steps 
        WHERE merchant_id = NEW.merchant_id 
          AND is_active = true 
        ORDER BY step_order
    LOOP
        INSERT INTO manufacturing_order_steps (
            manufacturing_order_id,
            manufacturing_step_id,
            status,
            merchant_id
        ) VALUES (
            NEW.id,
            step_record.id,
            CASE WHEN step_record.step_order = 1 THEN 'pending' ELSE 'pending' END,
            NEW.merchant_id
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_manufacturing_order_steps
    AFTER INSERT ON manufacturing_orders
    FOR EACH ROW
    EXECUTE FUNCTION create_manufacturing_order_steps();
