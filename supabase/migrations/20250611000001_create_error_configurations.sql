
-- Create error configurations table
CREATE TABLE IF NOT EXISTS public.error_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_code TEXT UNIQUE NOT NULL,
  error_type TEXT NOT NULL CHECK (error_type IN ('validation', 'network', 'auth', 'system', 'permission', 'timeout')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  description TEXT,
  possible_causes TEXT[],
  action_items TEXT[],
  is_retryable BOOLEAN DEFAULT false,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert predefined error configurations
INSERT INTO public.error_configurations (error_code, error_type, title, message, description, possible_causes, action_items, is_retryable, severity) VALUES
-- Authentication Errors
('AUTH_001', 'auth', 'Authentication Failed', 'Invalid login credentials provided', 'The email or password you entered is incorrect. Please verify your credentials and try again.', 
 ARRAY['Incorrect email address', 'Wrong password', 'Account may be locked', 'Caps lock may be on'], 
 ARRAY['Double-check your email address', 'Verify your password', 'Try resetting your password', 'Contact support if account is locked'], 
 false, 'medium'),

('AUTH_002', 'auth', 'Session Expired', 'Your session has expired', 'For security reasons, your login session has timed out. Please sign in again to continue.', 
 ARRAY['Inactive for extended period', 'Session timeout reached', 'Security policy enforcement'], 
 ARRAY['Sign in again', 'Enable "Remember me" for longer sessions'], 
 false, 'low'),

-- Validation Errors
('VAL_001', 'validation', 'Required Field Missing', 'Please fill in all required fields', 'Some mandatory information is missing from your form submission.', 
 ARRAY['Required fields left empty', 'Form validation failed'], 
 ARRAY['Fill in all fields marked with *', 'Review form for any error indicators'], 
 false, 'low'),

('VAL_002', 'validation', 'Invalid Data Format', 'The data format provided is not valid', 'The information entered does not match the expected format for this field.', 
 ARRAY['Incorrect email format', 'Invalid phone number', 'Wrong date format', 'Special characters not allowed'], 
 ARRAY['Check email format (user@domain.com)', 'Ensure phone number includes area code', 'Use DD/MM/YYYY date format', 'Remove special characters if not allowed'], 
 false, 'low'),

-- Network Errors
('NET_001', 'network', 'Connection Failed', 'Unable to connect to server', 'There was a problem connecting to our servers. This could be due to network connectivity issues.', 
 ARRAY['Poor internet connection', 'Server maintenance', 'Firewall blocking connection', 'DNS resolution issues'], 
 ARRAY['Check your internet connection', 'Try refreshing the page', 'Wait a few minutes and retry', 'Contact your network administrator'], 
 true, 'medium'),

('NET_002', 'timeout', 'Request Timeout', 'The request took too long to complete', 'The server did not respond within the expected time frame.', 
 ARRAY['Slow internet connection', 'Server overload', 'Large data processing'], 
 ARRAY['Try again with a faster connection', 'Break large operations into smaller chunks', 'Contact support if problem persists'], 
 true, 'medium'),

-- Inventory Errors
('INV_001', 'system', 'Insufficient Stock', 'Not enough inventory for this operation', 'The requested quantity exceeds the available stock levels.', 
 ARRAY['Stock levels depleted', 'Concurrent stock movements', 'Inventory count discrepancy'], 
 ARRAY['Check current stock levels', 'Reduce requested quantity', 'Restock inventory', 'Contact inventory manager'], 
 false, 'high'),

('INV_002', 'system', 'Stock Update Failed', 'Unable to update inventory levels', 'The system encountered an error while trying to update stock quantities.', 
 ARRAY['Database constraint violation', 'Concurrent modification', 'System maintenance'], 
 ARRAY['Refresh inventory data', 'Try the operation again', 'Contact system administrator'], 
 true, 'medium'),

('INV_003', 'system', 'Tag Operation Failed', 'RFID/Barcode operation unsuccessful', 'The tag scanning or printing operation could not be completed.', 
 ARRAY['Hardware malfunction', 'Tag not readable', 'Printer offline', 'Database connectivity'], 
 ARRAY['Check tag reader connection', 'Verify tag is not damaged', 'Ensure printer is online', 'Try manual entry as backup'], 
 true, 'medium'),

-- Procurement Errors
('PROC_001', 'validation', 'Supplier Not Available', 'Selected supplier cannot fulfill this request', 'The chosen supplier is not currently available for new procurement requests.', 
 ARRAY['Supplier contract expired', 'Supplier marked inactive', 'Material not in supplier catalog'], 
 ARRAY['Select different supplier', 'Contact procurement team', 'Update supplier information'], 
 false, 'medium'),

('PROC_002', 'system', 'Material Unavailable', 'Requested material is not available', 'The material you requested is currently out of stock or discontinued.', 
 ARRAY['Material discontinued', 'Supplier shortage', 'Seasonal unavailability'], 
 ARRAY['Find alternative materials', 'Contact supplier for availability', 'Adjust production schedule'], 
 false, 'high'),

-- Manufacturing Errors
('MFG_001', 'system', 'Production Constraint', 'Cannot start production', 'Insufficient raw materials or resources to begin manufacturing.', 
 ARRAY['Raw material shortage', 'Equipment unavailable', 'Worker capacity exceeded'], 
 ARRAY['Check raw material inventory', 'Schedule equipment maintenance', 'Adjust production timeline', 'Hire additional workers'], 
 false, 'high'),

('MFG_002', 'system', 'Task Assignment Failed', 'Unable to assign manufacturing task', 'The system could not assign the production task to the selected worker.', 
 ARRAY['Worker already assigned', 'Skill mismatch', 'Shift scheduling conflict'], 
 ARRAY['Select different worker', 'Check worker availability', 'Verify required skills'], 
 true, 'medium'),

-- Permission Errors
('PERM_001', 'permission', 'Access Denied', 'You do not have permission for this action', 'Your current role does not include the necessary permissions to perform this operation.', 
 ARRAY['Insufficient user role', 'Feature requires admin access', 'Account restrictions'], 
 ARRAY['Contact administrator for access', 'Verify your user role', 'Request permission upgrade'], 
 false, 'medium'),

-- System Errors
('SYS_001', 'system', 'Database Error', 'Database operation failed', 'The system encountered an error while accessing the database.', 
 ARRAY['Database connection lost', 'Query timeout', 'Data integrity constraint'], 
 ARRAY['Try the operation again', 'Contact technical support', 'Check system status'], 
 true, 'high'),

('SYS_002', 'system', 'File Operation Failed', 'Unable to process file', 'The file upload, download, or processing operation encountered an error.', 
 ARRAY['File size too large', 'Unsupported format', 'Storage quota exceeded', 'Corrupted file'], 
 ARRAY['Check file size limit', 'Use supported file formats', 'Free up storage space', 'Try a different file'], 
 true, 'medium');

-- Create index for faster lookups
CREATE INDEX idx_error_configurations_code ON public.error_configurations(error_code);
CREATE INDEX idx_error_configurations_type ON public.error_configurations(error_type);

-- Add RLS
ALTER TABLE public.error_configurations ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read error configurations
CREATE POLICY "Allow read access to error configurations" ON public.error_configurations
  FOR SELECT TO authenticated USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_error_configurations_updated_at
    BEFORE UPDATE ON public.error_configurations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
