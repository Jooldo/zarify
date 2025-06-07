
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WhatsAppNotification {
  id: string;
  procurement_request_id: string;
  supplier_id: string;
  message_content: string;
  status: string;
  sent_at: string;
  delivery_status?: string;
  error_message?: string;
}

export const useWhatsAppNotifications = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendWhatsAppNotification = async (
    procurementRequestId: string,
    supplierId: string,
    supplierPhone: string,
    supplierName: string,
    materialName: string,
    quantity: number,
    unit: string,
    requestNumber: string,
    eta?: string
  ) => {
    setLoading(true);
    try {
      console.log('Sending WhatsApp notification:', {
        procurementRequestId,
        supplierId,
        supplierPhone,
        supplierName,
        materialName,
        quantity,
        unit,
        requestNumber,
        eta
      });

      const { data, error } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          procurement_request_id: procurementRequestId,
          supplier_id: supplierId,
          supplier_phone: supplierPhone,
          supplier_name: supplierName,
          material_name: materialName,
          quantity,
          unit,
          request_number: requestNumber,
          eta
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: 'WhatsApp Notification Sent',
          description: `Procurement approval notification sent to ${supplierName}`,
        });
        return true;
      } else {
        throw new Error(data?.error || 'Failed to send WhatsApp notification');
      }
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
      toast({
        title: 'WhatsApp Notification Failed',
        description: `Failed to send notification to ${supplierName}: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getNotificationHistory = async (procurementRequestId: string): Promise<WhatsAppNotification[]> => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_notifications')
        .select('*')
        .eq('procurement_request_id', procurementRequestId)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notification history:', error);
      return [];
    }
  };

  return {
    sendWhatsAppNotification,
    getNotificationHistory,
    loading
  };
};
