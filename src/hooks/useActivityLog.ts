
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
      console.log('=== ACTIVITY LOG START ===');
      console.log('Parameters:', { action, entityType, entityId, description });
      
      // Check user authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('❌ User authentication failed:', userError);
        throw new Error('User not authenticated');
      }
      console.log('✅ User authenticated:', user.id);

      // Check merchant ID
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) {
        console.error('❌ Merchant ID RPC error:', merchantError);
        throw new Error('Failed to get merchant ID: ' + merchantError.message);
      }
      
      if (!merchantId) {
        console.error('❌ No merchant ID returned');
        throw new Error('No merchant found for user');
      }
      console.log('✅ Merchant ID:', merchantId);

      // Test direct insert first
      console.log('🧪 Testing direct insert...');
      const directInsertData = {
        user_id: user.id,
        user_name: 'Test User',
        action: action,
        entity_type: entityType,
        entity_id: entityId,
        description: description || 'Test description',
        merchant_id: merchantId
      };
      
      console.log('Direct insert data:', directInsertData);
      
      const { data: directResult, error: directError } = await supabase
        .from('user_activity_log')
        .insert(directInsertData)
        .select()
        .single();
      
      if (directError) {
        console.error('❌ Direct insert failed:', directError);
        console.error('Error details:', {
          message: directError.message,
          details: directError.details,
          hint: directError.hint,
          code: directError.code
        });
        throw new Error('Direct insert failed: ' + directError.message);
      }
      
      console.log('✅ Direct insert successful:', directResult);
      
      // Refresh logs after successful insert
      await fetchLogs();
      
      return directResult.id;
      
    } catch (error) {
      console.error('❌ Activity logging failed:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return { logs, loading, logActivity, refetch: fetchLogs };
};
