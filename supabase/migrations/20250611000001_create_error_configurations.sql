
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

-- Insert predefined error configurations with detailed descriptions
INSERT INTO public.error_configurations (error_code, error_type, title, message, description, possible_causes, action_items, is_retryable, severity) VALUES
-- Authentication Errors
('AUTH_001', 'auth', 'Authentication Failed', 'Invalid login credentials provided', 'Your email or password is incorrect. This security measure protects your account from unauthorized access. Please verify your credentials and try again.', 
 ARRAY['Incorrect email address entered', 'Wrong password typed', 'Account may be temporarily locked', 'Caps lock might be enabled'], 
 ARRAY['Double-check your email address spelling', 'Verify your password is correct', 'Try resetting your password if forgotten', 'Contact support if account appears locked'], 
 false, 'medium'),

('AUTH_002', 'auth', 'Session Expired', 'Your session has expired', 'For security reasons, your login session has automatically timed out after a period of inactivity. This protects your account if you forget to log out on a shared device.', 
 ARRAY['Extended period of inactivity', 'Session timeout policy reached', 'Security protocol enforcement', 'Browser cache cleared'], 
 ARRAY['Sign in again to continue working', 'Enable "Remember me" for longer sessions', 'Save your work frequently to avoid data loss'], 
 false, 'low'),

-- Validation Errors
('VAL_001', 'validation', 'Required Field Missing', 'Please fill in all required fields', 'Some mandatory information is missing from your form. All fields marked with an asterisk (*) must be completed before the form can be submitted.', 
 ARRAY['Required fields left empty', 'Form validation rules not met', 'Mandatory data not provided'], 
 ARRAY['Fill in all fields marked with a red asterisk (*)', 'Review the form for any highlighted error fields', 'Ensure all dropdown selections are made'], 
 false, 'low'),

('VAL_002', 'validation', 'Invalid Data Format', 'The data format provided is not valid', 'The information entered does not match the expected format for this field. Please check the format requirements and enter the data correctly.', 
 ARRAY['Incorrect email format used', 'Invalid phone number format', 'Wrong date format entered', 'Special characters not allowed in field'], 
 ARRAY['Use proper email format (user@domain.com)', 'Include area code in phone numbers', 'Use DD/MM/YYYY format for dates', 'Remove special characters if not permitted'], 
 false, 'low'),

-- Network Errors
('NET_001', 'network', 'Connection Failed', 'Unable to connect to server', 'There was a problem connecting to Zarify servers. This could be due to internet connectivity issues or temporary server maintenance. Your data is safe and will sync once connection is restored.', 
 ARRAY['Poor or unstable internet connection', 'Server maintenance in progress', 'Firewall blocking the connection', 'DNS resolution problems'], 
 ARRAY['Check your internet connection status', 'Try refreshing the page', 'Wait a few minutes and retry the operation', 'Contact your network administrator if problem persists'], 
 true, 'medium'),

('NET_002', 'timeout', 'Request Timeout', 'The request took too long to complete', 'The server did not respond within the expected time frame. This usually happens when processing large amounts of data or during peak usage times.', 
 ARRAY['Slow internet connection', 'Server experiencing high load', 'Large data processing taking time', 'Network congestion'], 
 ARRAY['Try again with a more stable connection', 'Break large operations into smaller chunks', 'Retry during off-peak hours', 'Contact support if timeout persists'], 
 true, 'medium'),

-- Inventory Errors
('INV_001', 'system', 'Insufficient Stock', 'Not enough inventory for this operation', 'The requested quantity exceeds the available stock levels in your inventory. This safety check prevents overselling and maintains accurate stock records.', 
 ARRAY['Stock levels depleted since last check', 'Concurrent stock movements by other users', 'Inventory count discrepancy', 'Recent bulk operations not reflected'], 
 ARRAY['Check current stock levels in inventory', 'Reduce the requested quantity', 'Update inventory with new stock arrivals', 'Contact inventory manager for stock replenishment'], 
 false, 'high'),

('INV_002', 'system', 'Stock Update Failed', 'Unable to update inventory levels', 'The system encountered an error while trying to update stock quantities. This protects data integrity by preventing partial updates that could cause inventory discrepancies.', 
 ARRAY['Database constraint violation', 'Concurrent modification by another user', 'System maintenance in progress', 'Invalid stock adjustment amount'], 
 ARRAY['Refresh inventory data and try again', 'Check if another user is updating the same item', 'Verify the adjustment amount is valid', 'Contact system administrator if issue persists'], 
 true, 'medium'),

('INV_003', 'system', 'Tag Operation Failed', 'RFID/Barcode operation unsuccessful', 'The tag scanning or printing operation could not be completed. This ensures that only valid, readable tags are used in your inventory system.', 
 ARRAY['RFID reader or barcode scanner malfunction', 'Tag is damaged or unreadable', 'Printer is offline or out of supplies', 'Database connectivity issue'], 
 ARRAY['Check tag reader/scanner connection', 'Verify the tag is not damaged or dirty', 'Ensure printer is online with sufficient supplies', 'Try manual entry as a backup option'], 
 true, 'medium'),

-- Procurement Errors
('PROC_001', 'validation', 'Supplier Not Available', 'Selected supplier cannot fulfill this request', 'The chosen supplier is not currently available for new procurement requests. This could be due to contract status, capacity limits, or supplier-specific restrictions.', 
 ARRAY['Supplier contract has expired', 'Supplier marked as inactive', 'Material not available in supplier catalog', 'Supplier at capacity limit'], 
 ARRAY['Select a different active supplier', 'Contact procurement team for supplier status', 'Update supplier contract information', 'Check alternative suppliers for the material'], 
 false, 'medium'),

('PROC_002', 'system', 'Material Unavailable', 'Requested material is not available', 'The material you requested is currently out of stock or has been discontinued by the supplier. This prevents invalid procurement requests.', 
 ARRAY['Material discontinued by supplier', 'Supplier experiencing shortage', 'Seasonal unavailability', 'Material catalog not updated'], 
 ARRAY['Find alternative materials with similar specifications', 'Contact supplier for availability timeline', 'Adjust production schedule accordingly', 'Update material catalog with current options'], 
 false, 'high'),

-- Manufacturing Errors
('MFG_001', 'system', 'Production Constraint', 'Cannot start production', 'Insufficient raw materials, equipment, or resources to begin manufacturing. This prevents starting production orders that cannot be completed successfully.', 
 ARRAY['Raw material shortage in inventory', 'Required equipment unavailable or under maintenance', 'Worker capacity exceeded for timeframe', 'Production schedule conflict'], 
 ARRAY['Check raw material inventory levels', 'Schedule equipment maintenance appropriately', 'Adjust production timeline or hire additional workers', 'Resolve schedule conflicts before starting'], 
 false, 'high'),

('MFG_002', 'system', 'Task Assignment Failed', 'Unable to assign manufacturing task', 'The system could not assign the production task to the selected worker. This ensures proper task distribution and prevents overloading workers.', 
 ARRAY['Worker already assigned to another task', 'Skill mismatch for the required task', 'Shift scheduling conflict detected', 'Worker marked as unavailable'], 
 ARRAY['Select a different available worker', 'Check worker availability and current assignments', 'Verify worker has required skills for the task', 'Adjust shift schedules to resolve conflicts'], 
 true, 'medium'),

-- Permission Errors
('PERM_001', 'permission', 'Access Denied', 'You do not have permission for this action', 'Your current user role does not include the necessary permissions to perform this operation. This security measure protects sensitive business functions.', 
 ARRAY['Insufficient user role privileges', 'Feature requires administrator access', 'Account has usage restrictions', 'Permission not granted for this module'], 
 ARRAY['Contact your administrator to request access', 'Verify your assigned user role', 'Request permission upgrade if needed', 'Use alternative methods available to your role'], 
 false, 'medium'),

-- System Errors
('SYS_001', 'system', 'Database Error', 'Database operation failed', 'The system encountered an error while accessing the database. This protects data integrity by preventing corrupted or incomplete transactions.', 
 ARRAY['Database connection temporarily lost', 'Query execution timeout', 'Data integrity constraint violation', 'Database maintenance in progress'], 
 ARRAY['Try the operation again in a moment', 'Check your internet connection', 'Contact technical support if problem persists', 'Save your work and refresh the page'], 
 true, 'high'),

('SYS_002', 'system', 'File Operation Failed', 'Unable to process file', 'The file upload, download, or processing operation encountered an error. This ensures only valid files are processed and stored securely.', 
 ARRAY['File size exceeds maximum limit', 'Unsupported file format used', 'Storage quota has been exceeded', 'File is corrupted or incomplete'], 
 ARRAY['Check file size is under the limit', 'Use supported file formats (PDF, JPG, PNG)', 'Free up storage space or upgrade plan', 'Try uploading a different file'], 
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
