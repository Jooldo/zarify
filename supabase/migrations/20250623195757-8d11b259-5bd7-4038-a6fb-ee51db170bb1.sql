
-- Add rework-related fields to manufacturing_order_step_data table
ALTER TABLE public.manufacturing_order_step_data 
ADD COLUMN is_rework BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN origin_step_id UUID REFERENCES public.manufacturing_order_step_data(id);

-- Create index for better performance on rework queries
CREATE INDEX idx_manufacturing_order_step_data_rework ON manufacturing_order_step_data(is_rework) WHERE is_rework = true;
CREATE INDEX idx_manufacturing_order_step_data_origin ON manufacturing_order_step_data(origin_step_id) WHERE origin_step_id IS NOT NULL;

-- Function to automatically remove rework tag when step progresses beyond origin
CREATE OR REPLACE FUNCTION check_and_remove_rework_tag()
RETURNS TRIGGER AS $$
DECLARE
    origin_step_order INTEGER;
    current_step_order INTEGER;
    origin_step_name TEXT;
BEGIN
    -- Only process if this is a rework step and status is being updated
    IF NEW.is_rework = true AND NEW.origin_step_id IS NOT NULL THEN
        -- Get the origin step details
        SELECT ms.step_order, mosd.step_name INTO origin_step_order, origin_step_name
        FROM manufacturing_order_step_data mosd
        JOIN merchant_step_config ms ON ms.step_name = mosd.step_name AND ms.merchant_id = mosd.merchant_id
        WHERE mosd.id = NEW.origin_step_id;
        
        -- Get current step order
        SELECT ms.step_order INTO current_step_order
        FROM merchant_step_config ms
        WHERE ms.step_name = NEW.step_name AND ms.merchant_id = NEW.merchant_id;
        
        -- If current step has progressed beyond origin step, remove rework tag
        IF current_step_order > origin_step_order THEN
            NEW.is_rework = false;
            NEW.origin_step_id = NULL;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically remove rework tag
CREATE TRIGGER trigger_check_rework_progression
    BEFORE UPDATE ON manufacturing_order_step_data
    FOR EACH ROW
    EXECUTE FUNCTION check_and_remove_rework_tag();
