
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
      const { data, error } = await supabase
        .from('user_activity_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
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
      const { error } = await supabase.rpc('log_user_activity', {
        p_action: action,
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_description: description
      });

      if (error) throw error;
      
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
