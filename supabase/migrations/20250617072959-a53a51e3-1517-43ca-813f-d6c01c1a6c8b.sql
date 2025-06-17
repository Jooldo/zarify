
-- Check if the log_user_activity function exists and recreate it with better error handling
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_action text, 
  p_entity_type text, 
  p_entity_id text DEFAULT NULL::text, 
  p_description text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  activity_id UUID;
  user_name TEXT;
  merchant_id_var UUID;
  current_user_id UUID;
BEGIN
  -- Get current user ID
  SELECT auth.uid() INTO current_user_id;
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Get user merchant ID
  SELECT get_user_merchant_id() INTO merchant_id_var;
  
  -- Check if merchant ID was found
  IF merchant_id_var IS NULL THEN
    RAISE EXCEPTION 'No merchant found for user';
  END IF;
  
  -- Get user name from profiles table
  SELECT COALESCE(first_name || ' ' || last_name, 'Unknown User') 
  INTO user_name
  FROM profiles 
  WHERE id = current_user_id;
  
  -- Default to 'Unknown User' if name not found
  IF user_name IS NULL THEN
    user_name := 'Unknown User';
  END IF;
  
  -- Insert activity log
  INSERT INTO user_activity_log (
    user_id,
    user_name,
    action,
    entity_type,
    entity_id,
    description,
    merchant_id
  ) VALUES (
    current_user_id,
    user_name,
    p_action,
    p_entity_type,
    p_entity_id,
    p_description,
    merchant_id_var
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise
    RAISE EXCEPTION 'Error in log_user_activity: %', SQLERRM;
END;
$$;

-- Ensure RLS is enabled on user_activity_log table
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Create or replace RLS policies for user_activity_log
DROP POLICY IF EXISTS "Users can view activity logs for their merchant" ON user_activity_log;
CREATE POLICY "Users can view activity logs for their merchant" 
ON user_activity_log FOR SELECT 
USING (merchant_id = get_user_merchant_id());

DROP POLICY IF EXISTS "Users can insert activity logs for their merchant" ON user_activity_log;
CREATE POLICY "Users can insert activity logs for their merchant" 
ON user_activity_log FOR INSERT 
WITH CHECK (merchant_id = get_user_merchant_id());
