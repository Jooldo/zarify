
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivityLog } from './useActivityLog';

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
  const { logActivity } = useActivityLog();

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
      
      // Map the database response to our ProcurementRequest interface
      const mappedRequests: ProcurementRequest[] = (data || [])
        .filter(request => request.status !== 'None' && ['Pending', 'Approved', 'Received'].includes(request.status))
        .map(request => ({
          id: request.id,
          request_number: request.request_number,
          raw_material_id: request.raw_material_id,
          quantity_requested: request.quantity_requested,
          unit: request.unit,
          supplier_id: request.supplier_id,
          eta: request.eta,
          notes: request.notes,
          status: request.status as 'Pending' | 'Approved' | 'Received',
          date_requested: request.date_requested,
          raw_material: request.raw_material
        }));
      
      setRequests(mappedRequests);
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

  const updateRequestStatus = async (requestId: string, newStatus: 'Pending' | 'Approved' | 'Received') => {
    try {
      console.log('Updating request status:', requestId, newStatus);
      
      // Get the request details before updating
      const request = requests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      // Update the procurement request status
      const { error: updateError } = await supabase
        .from('procurement_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // If status is "Received", update the raw material stock
      if (newStatus === 'Received') {
        console.log('Updating raw material stock for:', request.raw_material_id, 'quantity:', request.quantity_requested);
        
        // Update raw material current stock and reduce in_procurement
        const { error: stockError } = await supabase
          .from('raw_materials')
          .update({ 
            current_stock: supabase.sql`current_stock + ${request.quantity_requested}`,
            in_procurement: supabase.sql`GREATEST(0, in_procurement - ${request.quantity_requested})`,
            last_updated: new Date().toISOString()
          })
          .eq('id', request.raw_material_id);

        if (stockError) throw stockError;

        // Log the stock update activity
        await logActivity(
          'Stock Updated',
          'Raw Material',
          request.raw_material_id,
          `Stock increased by ${request.quantity_requested} ${request.unit} from procurement request ${request.request_number}`
        );
      }

      // Log the status update activity
      await logActivity(
        'Status Updated',
        'Procurement Request',
        requestId,
        `Procurement request ${request.request_number} status changed to ${newStatus}`
      );

      toast({
        title: 'Success',
        description: `Request status updated to ${newStatus}`,
      });

      // Refresh requests
      await fetchRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update request status',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return { requests, loading, refetch: fetchRequests, updateRequestStatus };
};
