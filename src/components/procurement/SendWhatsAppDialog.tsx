
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Building2, Package, Hash, CalendarDays } from 'lucide-react';
import { useWhatsAppNotifications } from '@/hooks/useWhatsAppNotifications';
import { useSuppliers } from '@/hooks/useSuppliers';
import type { ProcurementRequest } from '@/hooks/useProcurementRequests';

interface SendWhatsAppDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  request: ProcurementRequest | null;
}

const SendWhatsAppDialog = ({ isOpen, onOpenChange, request }: SendWhatsAppDialogProps) => {
  const [sending, setSending] = useState(false);
  const { sendWhatsAppNotification } = useWhatsAppNotifications();
  const { suppliers } = useSuppliers();
  const [supplier, setSupplier] = useState<any>(null);

  useEffect(() => {
    if (request && suppliers.length > 0) {
      const foundSupplier = suppliers.find(s => s.id === request.supplier_id);
      setSupplier(foundSupplier);
    }
  }, [request, suppliers]);

  if (!request) return null;

  const canSendWhatsApp = supplier && supplier.whatsapp_enabled && supplier.whatsapp_number;

  const handleSendWhatsApp = async () => {
    if (!canSendWhatsApp || !supplier) return;

    setSending(true);
    try {
      await sendWhatsAppNotification(
        request.id,
        request.supplier_id!,
        supplier.whatsapp_number,
        supplier.company_name,
        request.raw_material?.name || 'Unknown Material',
        request.quantity_requested,
        request.unit,
        request.request_number,
        request.eta
      );
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Send WhatsApp Notification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Request Details */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-sm">{request.request_number}</span>
              <Badge className="ml-auto">
                {request.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{request.raw_material?.name}</span>
            </div>
            <div className="text-sm text-gray-600">
              Quantity: {request.quantity_requested} {request.unit}
            </div>
            {request.eta && (
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <span className="text-sm">ETA: {new Date(request.eta).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Supplier Details */}
          <div className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="font-medium">{supplier?.company_name || 'No supplier selected'}</span>
            </div>
            {supplier && (
              <>
                <div className="text-sm text-gray-600">
                  WhatsApp: {supplier.whatsapp_number || 'Not provided'}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={supplier.whatsapp_enabled ? 'default' : 'secondary'}>
                    {supplier.whatsapp_enabled ? 'WhatsApp Enabled' : 'WhatsApp Disabled'}
                  </Badge>
                </div>
              </>
            )}
          </div>

          {!canSendWhatsApp && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                {!supplier ? 'No supplier selected for this request' :
                 !supplier.whatsapp_enabled ? 'WhatsApp is not enabled for this supplier' :
                 !supplier.whatsapp_number ? 'No WhatsApp number configured for this supplier' :
                 'Cannot send WhatsApp notification'}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendWhatsApp}
              disabled={!canSendWhatsApp || sending}
              className="flex-1"
            >
              {sending ? 'Sending...' : 'Send WhatsApp'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendWhatsAppDialog;
