
-- Clear all tag-related data from the backend
-- This will remove all inventory tags and their audit logs

-- First, clear the tag audit log (no foreign key constraints)
DELETE FROM tag_audit_log;

-- Then clear the inventory tags
DELETE FROM inventory_tags;

-- Reset any auto-incrementing sequences if needed
-- Note: Since we're using UUIDs, no sequence reset is needed
