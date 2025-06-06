
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TagAuditLog {
  id: string;
  tag_id: string;
  product_id: string;
  action: string;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  user_id: string;
  user_name: string;
  timestamp: string;
  merchant_id: string;
  finished_goods: {
    product_code: string;
  };
}

export const useTagAuditLog = () => {
  const [auditLogs, setAuditLogs] = useState<TagAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('tag_audit_log')
        .select(`
          *,
          finished_goods!inner(product_code)
        `)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error fetching tag audit logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tag audit logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return {
    auditLogs,
    loading,
    refetch: fetchAuditLogs
  };
};
