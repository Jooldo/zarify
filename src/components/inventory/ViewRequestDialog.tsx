import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Edit, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useWhatsAppNotifications, type WhatsAppNotification } from '@/hooks/useWhatsAppNotifications';
import type { ProcurementRequest } from '@/hooks/useProcurementRequests';

interface Supplier {
  id: string;
  company_name: string;
  contact_person: string;
}

interface ViewRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: ProcurementRequest | null;
  onUpdateRequestStatus: (requestId: string, newStatus: string) => void;
  onRequestUpdated?: () => void; // Add this to trigger table refresh
}

// Dummy supplier data with proper UUIDs - for display only
const DUMMY_SUPPLIERS: Supplier[] = [
  { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', company_name: 'Global Materials Inc', contact_person: 'John Smith' },
  { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480', company_name: 'Premium Supply Co', contact_person: 'Sarah Johnson' },
  { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481', company_name: 'EcoFriendly Resources', contact_person: 'Mike Chen' },
  { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d482', company_name: 'Industrial Solutions Ltd', contact_person: 'Emily Davis' },
  { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d483', company_name: 'Quality Raw Materials', contact_person: 'Robert Wilson' },
];

const ViewRequestDialog = ({ isOpen, onOpenChange, selectedRequest, onUpdateRequestStatus, onRequestUpdated }: ViewRequestDialogProps) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [editMode, setEditMode] = useState(false);
  const [editEta, setEditEta] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [whatsappHistory, setWhatsappHistory] = useState<WhatsAppNotification[]>([]);
  const { toast } = useToast();
  const { getNotificationHistory, sendWhatsAppNotification } = useWhatsAppNotifications();

  const extractSupplierFromNotes = (notes?: string) => {
    if (!notes) return '-';
    const supplierMatch = notes.match(/Supplier:\s*([^\n]+)/);
    return supplierMatch ? supplierMatch[1].trim() : '-';
  };

  const getRequestOrigin = (notes?: string) => {
    if (!notes) return 'procurement';
    return notes.includes('Source: Inventory Alert') ? 'inventory' : 'procurement';
  };

  const isIncompleteRequest = () => {
    if (!selectedRequest) return false;
    const origin = getRequestOrigin(selectedRequest.notes);
    return origin === 'inventory' && (!selectedRequest.supplier_id || !selectedRequest.eta);
  };

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const { data: merchantId, error: merchantError } = await supabase
          .rpc('get_user_merchant_id');

        if (merchantError) throw merchantError;

        const { data, error } = await supabase
          .from('suppliers')
          .select('id, company_name, contact_person')
          .eq('merchant_id', merchantId);

        if (error) {
          console.log('Error fetching suppliers, using dummy data:', error);
          setSuppliers(DUMMY_SUPPLIERS);
        } else {
          // Combine real suppliers with dummy data for display
          setSuppliers([...(data || []), ...DUMMY_SUPPLIERS]);
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        setSuppliers(DUMMY_SUPPLIERS);
      }
    };

    const fetchWhatsAppHistory = async () => {
      if (selectedRequest) {
        const history = await getNotificationHistory(selectedRequest.id);
        setWhatsappHistory(history);
      }
    };

    if (isOpen) {
      fetchSuppliers();
      fetchWhatsAppHistory();
      if (selectedRequest) {
        setSelectedSupplier(selectedRequest.supplier_id || '');
        setEditEta(selectedRequest.eta || '');
        setEditNotes(selectedRequest.notes || '');
      }
    }
  }, [isOpen, selectedRequest]);

  const handleCompleteRequest = async () => {
    if (!selectedRequest) return;

    setLoading(true);
    try {
      const updates: any = {};
      let updatedNotes = editNotes || '';

      if (selectedSupplier) {
        const selectedSupplierData = suppliers.find(s => s.id === selectedSupplier);
        if (selectedSupplierData) {
          // Check if this is a dummy supplier
          const isDummySupplier = DUMMY_SUPPLIERS.some(dummy => dummy.id === selectedSupplier);
          
          if (!isDummySupplier) {
            // Only set supplier_id for real suppliers from database
            updates.supplier_id = selectedSupplier;
          }
          
          // Update or add supplier info in notes
          if (updatedNotes.includes('Supplier:')) {
            updatedNotes = updatedNotes.replace(/Supplier:\s*[^\n]*/, `Supplier: ${selectedSupplierData.company_name}`);
          } else {
            updatedNotes += `\nSupplier: ${selectedSupplierData.company_name}`;
          }
        }
      }

      if (editEta) {
        updates.eta = editEta;
      }

      if (updatedNotes !== selectedRequest.notes) {
        updates.notes = updatedNotes.trim();
      }

      const { error } = await supabase
        .from('procurement_requests')
        .update(updates)
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Request details updated successfully',
      });

      setEditMode(false);
      
      // Trigger table refresh if callback is provided
      if (onRequestUpdated) {
        onRequestUpdated();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: 'Error',
        description: 'Failed to update request details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!selectedRequest) return;

    const supplier = suppliers.find(s => s.id === selectedSupplier);
    if (!supplier) {
      toast({
        title: 'Error',
        description: 'Please select a supplier first',
        variant: 'destructive',
      });
      return;
    }

    // Get supplier WhatsApp details
    const { data: supplierData, error } = await supabase
      .from('suppliers')
      .select('whatsapp_number, whatsapp_enabled')
      .eq('id', supplier.id)
      .single();

    if (error || !supplierData?.whatsapp_number) {
      toast({
        title: 'Error',
        description: 'Supplier WhatsApp number not found',
        variant: 'destructive',
      });
      return;
    }

    if (!supplierData.whatsapp_enabled) {
      toast({
        title: 'Error',
        description: 'WhatsApp notifications are disabled for this supplier',
        variant: 'destructive',
      });
      return;
    }

    const success = await sendWhatsAppNotification(
      selectedRequest.id,
      supplier.id,
      supplierData.whatsapp_number,
      supplier.company_name,
      selectedRequest.raw_material?.name || 'Unknown Material',
      selectedRequest.quantity_requested,
      selectedRequest.unit,
      selectedRequest.request_number,
      selectedRequest.eta
    );

    if (success) {
      // Refresh WhatsApp history
      const history = await getNotificationHistory(selectedRequest.id);
      setWhatsappHistory(history);
    }
  };

  const origin = getRequestOrigin(selectedRequest?.notes);
  const isIncomplete = isIncompleteRequest();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            Request Details
            <Badge variant={origin === 'inventory' ? "secondary" : "default"} className="text-xs">
              {origin === 'inventory' ? 'From Alert' : 'Direct Request'}
            </Badge>
            {isIncomplete && (
              <div className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-amber-600">Incomplete</span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{selectedRequest?.raw_material?.name || ''}</span>
              <Badge variant="outline" className="text-xs">{selectedRequest?.raw_material?.type || 'Unknown'}</Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Request ID: {selectedRequest?.request_number}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Quantity</Label>
              <Input 
                value={`${selectedRequest?.quantity_requested || 0} ${selectedRequest?.unit || ''}`} 
                disabled 
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label className="text-sm">Status</Label>
              <Select 
                value={selectedRequest?.status || ''} 
                onValueChange={(value) => onUpdateRequestStatus(selectedRequest?.id || '', value)}
              >
                <SelectTrigger className="mt-1 text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Date Requested</Label>
              <Input 
                value={selectedRequest?.date_requested ? new Date(selectedRequest.date_requested).toLocaleDateString() : ''} 
                disabled 
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label className="text-sm">Expected Delivery</Label>
              {editMode ? (
                <Input
                  type="date"
                  value={editEta}
                  onChange={(e) => setEditEta(e.target.value)}
                  className="mt-1 text-sm"
                />
              ) : (
                <Input 
                  value={selectedRequest?.eta ? new Date(selectedRequest.eta).toLocaleDateString() : 'Not specified'} 
                  disabled 
                  className="mt-1 text-sm"
                />
              )}
            </div>
          </div>

          <div>
            <Label className="text-sm">Raised By</Label>
            <Input 
              value={selectedRequest?.raised_by || 'Unknown'} 
              disabled 
              className="mt-1 text-sm"
            />
          </div>

          <div>
            <Label className="text-sm">Supplier</Label>
            {editMode ? (
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger className="mt-1 text-sm">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.company_name} {supplier.contact_person && `(${supplier.contact_person})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input 
                value={extractSupplierFromNotes(selectedRequest?.notes)} 
                disabled 
                className="mt-1 text-sm"
              />
            )}
          </div>

          <div>
            <Label className="text-sm">Notes</Label>
            {editMode ? (
              <Textarea 
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="mt-1 text-sm min-h-[60px]"
                placeholder="Add notes about the request"
              />
            ) : (
              <Textarea 
                value={selectedRequest?.notes || 'No notes'} 
                disabled 
                className="mt-1 text-sm min-h-[60px]"
              />
            )}
          </div>

          {/* WhatsApp Notifications Section */}
          {whatsappHistory.length > 0 && (
            <div>
              <Label className="text-sm flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                WhatsApp Notifications
              </Label>
              <div className="mt-1 space-y-1 max-h-20 overflow-y-auto">
                {whatsappHistory.map((notification) => (
                  <div key={notification.id} className="text-xs bg-gray-50 p-2 rounded">
                    <div className="flex items-center justify-between">
                      <Badge variant={notification.status === 'sent' ? 'default' : 'destructive'} className="text-xs">
                        {notification.status}
                      </Badge>
                      <span className="text-muted-foreground">
                        {new Date(notification.sent_at).toLocaleString()}
                      </span>
                    </div>
                    {notification.error_message && (
                      <div className="text-red-600 mt-1">{notification.error_message}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {!editMode && selectedSupplier && (
              <Button 
                onClick={handleSendWhatsApp} 
                className="flex-1 flex items-center gap-2"
                variant="outline"
                size="sm"
              >
                <MessageCircle className="h-3 w-3" />
                Send WhatsApp
              </Button>
            )}
            {!editMode && (
              <Button 
                onClick={() => setEditMode(true)} 
                className="flex-1 flex items-center gap-2"
                variant="outline"
              >
                <Edit className="h-3 w-3" />
                Edit Details
              </Button>
            )}
            {editMode && (
              <Button 
                onClick={handleCompleteRequest} 
                disabled={loading} 
                className="flex-1"
              >
                {loading ? 'Updating...' : 'Save Changes'}
              </Button>
            )}
            {editMode && (
              <Button 
                variant="outline" 
                onClick={() => setEditMode(false)} 
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            {!editMode && (
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                className="flex-1"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewRequestDialog;
