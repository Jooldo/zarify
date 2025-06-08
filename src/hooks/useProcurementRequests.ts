import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivityLog } from './useActivityLog';
import { useWhatsAppNotifications } from './useWhatsAppNotifications';

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
  raised_by?: string;
  first_name?: string;
  last_name?: string;
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
  const { sendWhatsAppNotification } = useWhatsAppNotifications();

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
          first_name: request.first_name,
          last_name: request.last_name,
          raised_by: request.first_name && request.last_name 
            ? `${request.first_name} ${request.last_name}`.trim() 
            : 'Unknown User',
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

      // If status is "Approved", send WhatsApp notification to supplier
      if (newStatus === 'Approved') {
        console.log('Status changed to Approved, sending WhatsApp notification...');
        
        // Get supplier details for WhatsApp notification
        let supplierData = null;
        if (request.supplier_id) {
          const { data: supplier, error: supplierError } = await supabase
            .from('suppliers')
            .select('company_name, whatsapp_number, whatsapp_enabled')
            .eq('id', request.supplier_id)
            .single();

          if (!supplierError && supplier) {
            supplierData = supplier;
          }
        }

        // If we have supplier data and WhatsApp is enabled, send notification
        if (supplierData?.whatsapp_enabled && supplierData?.whatsapp_number) {
          console.log('Sending WhatsApp to supplier:', supplierData.company_name);
          await sendWhatsAppNotification(
            requestId,
            request.supplier_id!,
            supplierData.whatsapp_number,
            supplierData.company_name,
            request.raw_material?.name || 'Unknown Material',
            request.quantity_requested,
            request.unit,
            request.request_number,
            request.eta
          );
        } else {
          console.log('WhatsApp notification skipped - supplier data not available or WhatsApp disabled');
        }
      }

      // If status is "Received", update the raw material stock
      if (newStatus === 'Received') {
        console.log('Updating raw material stock for:', request.raw_material_id, 'quantity:', request.quantity_requested);
        
        // First, fetch the current raw material data
        const { data: currentMaterial, error: fetchError } = await supabase
          .from('raw_materials')
          .select('current_stock, in_procurement')
          .eq('id', request.raw_material_id)
          .single();

        if (fetchError) throw fetchError;

        // Calculate new values
        const newCurrentStock = currentMaterial.current_stock + request.quantity_requested;
        const newInProcurement = Math.max(0, currentMaterial.in_procurement - request.quantity_requested);

        console.log('Stock update calculation:', {
          currentStock: currentMaterial.current_stock,
          inProcurement: currentMaterial.in_procurement,
          quantityReceived: request.quantity_requested,
          newCurrentStock,
          newInProcurement
        });

        // Update raw material current stock and reduce in_procurement
        const { error: stockError } = await supabase
          .from('raw_materials')
          .update({ 
            current_stock: newCurrentStock,
            in_procurement: newInProcurement,
            last_updated: new Date().toISOString()
          })
          .eq('id', request.raw_material_id);

        if (stockError) throw stockError;

        console.log('Stock updated successfully');

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
        `Procurement request ${request.request_number} status changed to ${newStatus}${newStatus === 'Approved' ? ' (WhatsApp notification sent to supplier)' : ''}`
      );

      toast({
        title: 'Success',
        description: `Request status updated to ${newStatus}${newStatus === 'Approved' ? '. WhatsApp notification sent to supplier.' : ''}`,
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

  const deleteRequest = async (requestId: string) => {
    try {
      console.log('Deleting procurement request:', requestId);
      
      // Get the request details before deleting for logging
      const request = requests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      // Delete the procurement request
      const { error: deleteError } = await supabase
        .from('procurement_requests')
        .delete()
        .eq('id', requestId);

      if (deleteError) throw deleteError;

      // Log the deletion activity
      await logActivity(
        'Request Deleted',
        'Procurement Request',
        requestId,
        `Procurement request ${request.request_number} was deleted`
      );

      toast({
        title: 'Success',
        description: 'Procurement request deleted successfully',
      });

      // Refresh requests
      await fetchRequests();
    } catch (error) {
      console.error('Error deleting procurement request:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete procurement request',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return { requests, loading, refetch: fetchRequests, updateRequestStatus, deleteRequest };
};
