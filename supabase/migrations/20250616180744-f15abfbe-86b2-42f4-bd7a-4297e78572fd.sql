
-- Create table to store previous steps data for each manufacturing order step
CREATE TABLE public.manufacturing_step_previous_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manufacturing_order_step_id UUID NOT NULL REFERENCES public.manufacturing_order_steps(id) ON DELETE CASCADE,
  previous_steps_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  merchant_id UUID NOT NULL REFERENCES public.merchants(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(manufacturing_order_step_id)
);

-- Add RLS policies
ALTER TABLE public.manufacturing_step_previous_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view previous steps data from their merchant" 
  ON public.manufacturing_step_previous_data 
  FOR SELECT 
  USING (merchant_id = (SELECT get_user_merchant_id()));

CREATE POLICY "Users can create previous steps data for their merchant" 
  ON public.manufacturing_step_previous_data 
  FOR INSERT 
  WITH CHECK (merchant_id = (SELECT get_user_merchant_id()));

CREATE POLICY "Users can update previous steps data from their merchant" 
  ON public.manufacturing_step_previous_data 
  FOR UPDATE 
  USING (merchant_id = (SELECT get_user_merchant_id()));

CREATE POLICY "Users can delete previous steps data from their merchant" 
  ON public.manufacturing_step_previous_data 
  FOR DELETE 
  USING (merchant_id = (SELECT get_user_merchant_id()));

-- Add updated_at trigger
CREATE TRIGGER update_manufacturing_step_previous_data_updated_at
  BEFORE UPDATE ON public.manufacturing_step_previous_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update previous steps data
CREATE OR REPLACE FUNCTION public.update_previous_steps_data()
RETURNS TRIGGER AS $$
DECLARE
    order_id UUID;
    current_step_order INTEGER;
    step_record RECORD;
    previous_steps_data JSONB := '[]'::jsonb;
    step_data JSONB;
    field_record RECORD;
    field_values JSONB := '{}'::jsonb;
BEGIN
    -- Get order and step info
    IF TG_OP = 'DELETE' THEN
        order_id := OLD.manufacturing_order_id;
        SELECT step_order INTO current_step_order 
        FROM manufacturing_steps 
        WHERE id = OLD.manufacturing_step_id;
    ELSE
        order_id := NEW.manufacturing_order_id;
        SELECT step_order INTO current_step_order 
        FROM manufacturing_steps 
        WHERE id = NEW.manufacturing_step_id;
    END IF;

    -- Get all previous steps data for this order
    FOR step_record IN 
        SELECT 
            mos.id as order_step_id,
            ms.step_name,
            ms.step_order,
            mos.status,
            mos.started_at,
            mos.completed_at,
            w.name as worker_name,
            ms.merchant_id
        FROM manufacturing_order_steps mos
        JOIN manufacturing_steps ms ON mos.manufacturing_step_id = ms.id
        LEFT JOIN workers w ON mos.assigned_worker_id = w.id
        WHERE mos.manufacturing_order_id = order_id
          AND ms.step_order < current_step_order
        ORDER BY ms.step_order
    LOOP
        -- Get field values for this step
        field_values := '{}'::jsonb;
        
        FOR field_record IN
            SELECT 
                msf.field_label,
                mosv.field_value,
                msf.field_options
            FROM manufacturing_step_fields msf
            LEFT JOIN manufacturing_order_step_values mosv 
                ON msf.field_id = mosv.field_id 
                AND mosv.manufacturing_order_step_id = step_record.order_step_id
            WHERE msf.manufacturing_step_id IN (
                SELECT manufacturing_step_id 
                FROM manufacturing_order_steps 
                WHERE id = step_record.order_step_id
            )
        LOOP
            field_values := field_values || jsonb_build_object(
                field_record.field_label, 
                COALESCE(field_record.field_value, '-')
            );
        END LOOP;

        -- Build step data
        step_data := jsonb_build_object(
            'stepName', step_record.step_name,
            'stepOrder', step_record.step_order,
            'status', step_record.status,
            'startedAt', step_record.started_at,
            'completedAt', step_record.completed_at,
            'workerName', COALESCE(step_record.worker_name, 'Not assigned'),
            'fieldValues', field_values,
            'missing', false
        );

        previous_steps_data := previous_steps_data || step_data;
    END LOOP;

    -- Update or insert previous steps data for all subsequent steps
    FOR step_record IN
        SELECT mos.id as order_step_id, ms.merchant_id
        FROM manufacturing_order_steps mos
        JOIN manufacturing_steps ms ON mos.manufacturing_step_id = ms.id
        WHERE mos.manufacturing_order_id = order_id
          AND ms.step_order >= current_step_order
    LOOP
        INSERT INTO manufacturing_step_previous_data (
            manufacturing_order_step_id,
            previous_steps_data,
            merchant_id
        ) VALUES (
            step_record.order_step_id,
            previous_steps_data,
            step_record.merchant_id
        )
        ON CONFLICT (manufacturing_order_step_id) 
        DO UPDATE SET 
            previous_steps_data = EXCLUDED.previous_steps_data,
            updated_at = now();
    END LOOP;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update previous steps data when steps are modified
CREATE TRIGGER trigger_update_previous_steps_on_step_insert
    AFTER INSERT ON manufacturing_order_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_previous_steps_data();

CREATE TRIGGER trigger_update_previous_steps_on_step_update
    AFTER UPDATE ON manufacturing_order_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_previous_steps_data();

CREATE TRIGGER trigger_update_previous_steps_on_step_delete
    AFTER DELETE ON manufacturing_order_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_previous_steps_data();

-- Create trigger to update previous steps data when step values are modified
CREATE OR REPLACE FUNCTION public.update_previous_steps_on_values_change()
RETURNS TRIGGER AS $$
DECLARE
    order_step_record RECORD;
BEGIN
    -- Get the order step info
    IF TG_OP = 'DELETE' THEN
        SELECT manufacturing_order_id, manufacturing_step_id 
        INTO order_step_record
        FROM manufacturing_order_steps 
        WHERE id = OLD.manufacturing_order_step_id;
    ELSE
        SELECT manufacturing_order_id, manufacturing_step_id 
        INTO order_step_record
        FROM manufacturing_order_steps 
        WHERE id = NEW.manufacturing_order_step_id;
    END IF;

    -- Trigger the previous steps data update
    PERFORM update_previous_steps_data() FROM manufacturing_order_steps 
    WHERE manufacturing_order_id = order_step_record.manufacturing_order_id
      AND manufacturing_step_id = order_step_record.manufacturing_step_id
    LIMIT 1;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_previous_steps_on_values_insert
    AFTER INSERT ON manufacturing_order_step_values
    FOR EACH ROW
    EXECUTE FUNCTION update_previous_steps_on_values_change();

CREATE TRIGGER trigger_update_previous_steps_on_values_update
    AFTER UPDATE ON manufacturing_order_step_values
    FOR EACH ROW
    EXECUTE FUNCTION update_previous_steps_on_values_change();

CREATE TRIGGER trigger_update_previous_steps_on_values_delete
    AFTER DELETE ON manufacturing_order_step_values
    FOR EACH ROW
    EXECUTE FUNCTION update_previous_steps_on_values_change();
