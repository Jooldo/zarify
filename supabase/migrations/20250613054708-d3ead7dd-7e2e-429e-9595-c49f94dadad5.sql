
-- Fix duplicate step numbers by updating them to be sequential
WITH ranked_steps AS (
  SELECT 
    id,
    step_order,
    merchant_id,
    ROW_NUMBER() OVER (PARTITION BY merchant_id ORDER BY created_at) as new_order
  FROM manufacturing_steps
  WHERE is_active = true
)
UPDATE manufacturing_steps 
SET step_order = ranked_steps.new_order
FROM ranked_steps 
WHERE manufacturing_steps.id = ranked_steps.id
  AND manufacturing_steps.step_order != ranked_steps.new_order;

-- Add a unique constraint to prevent duplicate step orders per merchant
ALTER TABLE manufacturing_steps 
ADD CONSTRAINT unique_step_order_per_merchant 
UNIQUE (merchant_id, step_order);
