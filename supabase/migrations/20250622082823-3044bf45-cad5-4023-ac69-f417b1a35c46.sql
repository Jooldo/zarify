
-- Check if there are any duplicate or conflicting foreign key constraints
-- First, let's see what relationships exist between these tables

-- Check existing foreign keys on manufacturing_order_steps table
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='manufacturing_order_steps'
  AND ccu.table_name = 'manufacturing_orders';

-- If there are duplicate constraints, we'll need to drop the extras
-- Let's also ensure we have the correct single foreign key relationship

-- Drop any potential duplicate foreign key constraints (if they exist)
DO $$ 
DECLARE
    constraint_record RECORD;
BEGIN
    -- Find all foreign key constraints from manufacturing_order_steps to manufacturing_orders
    FOR constraint_record IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name='manufacturing_order_steps'
          AND ccu.table_name = 'manufacturing_orders'
    LOOP
        -- Drop each foreign key constraint
        EXECUTE 'ALTER TABLE manufacturing_order_steps DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
    END LOOP;
END $$;

-- Now add back the single, correct foreign key constraint
ALTER TABLE manufacturing_order_steps 
ADD CONSTRAINT fk_manufacturing_order_steps_order_id 
FOREIGN KEY (manufacturing_order_id) 
REFERENCES manufacturing_orders(id) 
ON DELETE CASCADE;

-- Also ensure we don't have any duplicate indexes that might cause issues
DROP INDEX IF EXISTS idx_manufacturing_order_steps_order_id_duplicate;
CREATE INDEX IF NOT EXISTS idx_manufacturing_order_steps_order_id 
ON manufacturing_order_steps(manufacturing_order_id);
