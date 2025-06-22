
-- First, let's check what relationships currently exist
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
  AND tc.table_name='manufacturing_order_steps';

-- Drop ALL existing foreign key constraints on manufacturing_order_steps table
DO $$ 
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints AS tc 
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name='manufacturing_order_steps'
    LOOP
        EXECUTE 'ALTER TABLE manufacturing_order_steps DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
    END LOOP;
END $$;

-- Re-create only the essential foreign key constraints
ALTER TABLE manufacturing_order_steps 
ADD CONSTRAINT manufacturing_order_steps_manufacturing_order_id_fkey 
FOREIGN KEY (manufacturing_order_id) 
REFERENCES manufacturing_orders(id) 
ON DELETE CASCADE;

ALTER TABLE manufacturing_order_steps 
ADD CONSTRAINT manufacturing_order_steps_manufacturing_step_id_fkey 
FOREIGN KEY (manufacturing_step_id) 
REFERENCES manufacturing_steps(id);

ALTER TABLE manufacturing_order_steps 
ADD CONSTRAINT manufacturing_order_steps_assigned_worker_id_fkey 
FOREIGN KEY (assigned_worker_id) 
REFERENCES workers(id);

ALTER TABLE manufacturing_order_steps 
ADD CONSTRAINT manufacturing_order_steps_merchant_id_fkey 
FOREIGN KEY (merchant_id) 
REFERENCES merchants(id);

-- Clean up any duplicate indexes
DROP INDEX IF EXISTS idx_manufacturing_order_steps_order_id;
DROP INDEX IF EXISTS idx_manufacturing_order_steps_order_id_duplicate;

-- Create a single index for the manufacturing_order_id column
CREATE INDEX idx_manufacturing_order_steps_manufacturing_order_id 
ON manufacturing_order_steps(manufacturing_order_id);
