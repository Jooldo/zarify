
-- Drop manufacturing-related tables and their dependencies (keeping workers table and finished_goods in_manufacturing column)

-- Drop production step history table
DROP TABLE IF EXISTS public.production_step_history CASCADE;

-- Drop production tasks table  
DROP TABLE IF EXISTS public.production_tasks CASCADE;

-- Drop custom types used by production (keeping worker_status for workers table)
DROP TYPE IF EXISTS production_step CASCADE;
DROP TYPE IF EXISTS production_priority CASCADE; 
DROP TYPE IF EXISTS production_task_status CASCADE;

-- Note: Keeping workers table and worker_status type
-- Note: Keeping in_manufacturing column in finished_goods table
