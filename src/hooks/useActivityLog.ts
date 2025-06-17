
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  description: string;
  timestamp: string;
  merchant_id: string;
}

export const useActivityLog = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      console.log('Fetching activity logs...');
      
      // Get merchant ID first
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) {
        console.error('Error getting merchant ID for activity logs:', merchantError);
        throw merchantError;
      }

      console.log('Merchant ID for activity logs:', merchantId);

      const { data, error } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching activity logs:', error);
        throw error;
      }
      
      console.log('Activity logs fetched successfully:', data?.length || 0, 'logs');
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch activity logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (
    action: string,
    entityType: string,
    entityId?: string,
    description?: string
  ) => {
    try {
      console.log('=== ATTEMPTING TO LOG ACTIVITY ===');
      console.log('Action:', action);
      console.log('Entity Type:', entityType);
      console.log('Entity ID:', entityId);
      console.log('Description:', description);
      
      // First check if we have a valid user session
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('No valid user session for activity logging:', userError);
        toast({
          title: 'Error',
          description: 'User not authenticated',
          variant: 'destructive',
        });
        return;
      }
      console.log('User ID:', user.id);

      // Get merchant ID
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) {
        console.error('Error getting merchant ID for activity logging:', merchantError);
        toast({
          title: 'Error',
          description: 'Error getting merchant information',
          variant: 'destructive',
        });
        return;
      }
      console.log('Merchant ID for logging:', merchantId);

      // Call the RPC function
      console.log('Calling log_user_activity RPC function...');
      const { data, error } = await supabase.rpc('log_user_activity', {
        p_action: action,
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_description: description
      });

      if (error) {
        console.error('RPC Error logging activity:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        toast({
          title: 'Activity Log Error',
          description: error.message || 'Failed to log activity',
          variant: 'destructive',
        });
        throw error;
      }
      
      console.log('Activity logged successfully, RPC returned:', data);
      
      // Refresh logs after adding new one
      console.log('Refreshing logs after activity log...');
      await fetchLogs();
      
      // Show success message
      toast({
        title: 'Activity Logged',
        description: 'Activity has been logged successfully',
      });
      
    } catch (error) {
      console.error('Critical error in logActivity:', error);
      toast({
        title: 'Error',
        description: 'Failed to log activity: ' + (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return { logs, loading, logActivity, refetch: fetchLogs };
};
