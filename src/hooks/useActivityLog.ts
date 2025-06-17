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
      console.log('Logging activity:', { action, entityType, entityId, description });
      
      const { error } = await supabase.rpc('log_user_activity', {
        p_action: action,
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_description: description
      });

      if (error) {
        console.error('Error logging activity:', error);
        throw error;
      }
      
      console.log('Activity logged successfully');
      
      // Refresh logs after adding new one
      await fetchLogs();
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return { logs, loading, logActivity, refetch: fetchLogs };
};
