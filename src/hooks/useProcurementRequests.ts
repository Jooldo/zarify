
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProcurementRequest {
  id: string;
  request_number: string;
  raw_material_id: string;
  quantity_requested: number;
  unit: string;
  supplier_id?: string;
  eta?: string;
  notes?: string;
  status: 'Pending' | 'Approved' | 'Received';
  date_requested: string;
  raw_material?: {
    name: string;
    type: string;
  };
}

export const useProcurementRequests = () => {
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      const { data, error } = await supabase
        .from('procurement_requests')
        .select(`
          *,
          raw_material:raw_materials(name, type)
        `)
        .eq('merchant_id', merchantId)
        .neq('status', 'None')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter out any records with 'None' status and ensure proper typing
      const filteredRequests = (data || []).filter(
        (request): request is ProcurementRequest => 
          request.status !== 'None' && 
          ['Pending', 'Approved', 'Received'].includes(request.status)
      );
      
      setRequests(filteredRequests);
    } catch (error) {
      console.error('Error fetching procurement requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch procurement requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return { requests, loading, refetch: fetchRequests };
};
