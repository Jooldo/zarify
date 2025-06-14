
-- Add the 'fulfilled_quantity' column to the 'order_items' table
ALTER TABLE public.order_items
ADD COLUMN fulfilled_quantity INTEGER NOT NULL DEFAULT 0;

-- Add new status 'Partially Fulfilled' to the 'order_status' enum type
-- Note: Adding enum values needs to be done carefully.
-- Supabase might require this to be done in a specific way if there are active users.
-- This is the standard PostgreSQL way:
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'Partially Fulfilled';

-- It's good practice to ensure existing records make sense with the new column.
-- For existing order items, if their status is 'Delivered', we can assume they were fully fulfilled.
-- For other statuses, fulfilled_quantity remains 0.
-- This part is optional and depends on how historical data should be handled.
-- For now, I'll assume new items start with 0 and existing 'Delivered' items should be updated.
-- However, to keep the migration simple and focused on schema change, I'll omit data migration for now.
-- Data migration can be handled as a separate step if needed.
-- For example, one might run:
-- UPDATE public.order_items
-- SET fulfilled_quantity = quantity
-- WHERE status = 'Delivered' AND fulfilled_quantity = 0;
-- But let's keep this SQL block focused on schema alteration.

