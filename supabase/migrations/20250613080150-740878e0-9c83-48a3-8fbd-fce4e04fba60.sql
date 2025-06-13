
-- Update manufacturing_order_steps table to only allow 3 statuses
ALTER TABLE manufacturing_order_steps 
DROP CONSTRAINT IF EXISTS manufacturing_order_steps_status_check;

ALTER TABLE manufacturing_order_steps 
ADD CONSTRAINT manufacturing_order_steps_status_check 
CHECK (status IN ('pending', 'in_progress', 'completed'));

-- Update manufacturing_orders table to only allow 3 statuses
ALTER TABLE manufacturing_orders 
DROP CONSTRAINT IF EXISTS manufacturing_orders_status_check;

ALTER TABLE manufacturing_orders 
ADD CONSTRAINT manufacturing_orders_status_check 
CHECK (status IN ('pending', 'in_progress', 'completed'));

-- Create function to automatically update manufacturing order status
CREATE OR REPLACE FUNCTION update_manufacturing_order_status()
RETURNS TRIGGER AS $$
DECLARE
    order_id UUID;
    total_steps INTEGER;
    completed_steps INTEGER;
    in_progress_steps INTEGER;
    new_status TEXT;
BEGIN
    -- Get the order ID from the step
    IF TG_OP = 'DELETE' THEN
        order_id := OLD.manufacturing_order_id;
    ELSE
        order_id := NEW.manufacturing_order_id;
    END IF;
    
    -- Count total steps for this order
    SELECT COUNT(*) INTO total_steps
    FROM manufacturing_order_steps
    WHERE manufacturing_order_id = order_id;
    
    -- Count completed steps
    SELECT COUNT(*) INTO completed_steps
    FROM manufacturing_order_steps
    WHERE manufacturing_order_id = order_id AND status = 'completed';
    
    -- Count in-progress steps
    SELECT COUNT(*) INTO in_progress_steps
    FROM manufacturing_order_steps
    WHERE manufacturing_order_id = order_id AND status = 'in_progress';
    
    -- Determine new status based on step statuses
    IF completed_steps = total_steps THEN
        new_status := 'completed';
    ELSIF in_progress_steps > 0 OR completed_steps > 0 THEN
        new_status := 'in_progress';
    ELSE
        new_status := 'pending';
    END IF;
    
    -- Update the manufacturing order status
    UPDATE manufacturing_orders 
    SET status = new_status, updated_at = now()
    WHERE id = order_id;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update order status when steps change
DROP TRIGGER IF EXISTS trigger_update_manufacturing_order_status ON manufacturing_order_steps;

CREATE TRIGGER trigger_update_manufacturing_order_status
    AFTER INSERT OR UPDATE OR DELETE ON manufacturing_order_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_manufacturing_order_status();

-- Update existing data to ensure consistency
UPDATE manufacturing_order_steps 
SET status = 'pending' 
WHERE status NOT IN ('pending', 'in_progress', 'completed');

-- Update existing orders to correct status
UPDATE manufacturing_orders 
SET status = (
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM manufacturing_order_steps 
            WHERE manufacturing_order_id = manufacturing_orders.id 
            AND status = 'completed'
            HAVING COUNT(*) = (
                SELECT COUNT(*) FROM manufacturing_order_steps 
                WHERE manufacturing_order_id = manufacturing_orders.id
            )
        ) THEN 'completed'
        WHEN EXISTS (
            SELECT 1 FROM manufacturing_order_steps 
            WHERE manufacturing_order_id = manufacturing_orders.id 
            AND status IN ('in_progress', 'completed')
        ) THEN 'in_progress'
        ELSE 'pending'
    END
);
