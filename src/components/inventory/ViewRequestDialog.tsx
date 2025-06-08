
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
  onRequestUpdated?: () => void;
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
  const [editQuantity, setEditQuantity] = useState('');
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
    if (notes.includes('Source: Inventory Alert')) return 'inventory';
    if (notes.includes('Source: Multi-Item Procurement Request')) return 'multi-item';
    return 'procurement';
  };

  const parseMultiItemMaterials = (notes?: string) => {
    if (!notes || !notes.includes('Materials in this request:')) return null;
    
    const materialsSection = notes.split('Materials in this request:')[1];
    if (!materialsSection) return null;

    const materialLines = materialsSection.trim().split('\n').filter(line => line.trim());
    
    return materialLines.map(line => {
      // Parse format: "1. Material Name (Type) - Quantity Unit - Notes"
      const match = line.match(/^\d+\.\s*(.+?)\s*\((.+?)\)\s*-\s*(\d+)\s*(\w+)(?:\s*-\s*(.+))?$/);
      if (match) {
        return {
          name: match[1].trim(),
          type: match[2].trim(),
          quantity: parseInt(match[3]),
          unit: match[4].trim(),
          notes: match[5]?.trim() || ''
        };
      }
      return null;
    }).filter(Boolean);
  };

  const isIncompleteRequest = () => {
    if (!selectedRequest) return false;
    const origin = getRequestOrigin(selectedRequest.notes);
    return origin === 'inventory' && (!selectedRequest.supplier_id || !selectedRequest.eta);
  };

  const isMultiItemRequest = () => {
    if (!selectedRequest) return false;
    return getRequestOrigin(selectedRequest.notes) === 'multi-item';
  };

  const getTotalQuantityForMultiItem = () => {
    const materials = parseMultiItemMaterials(selectedRequest?.notes);
    if (!materials) return selectedRequest?.quantity_requested || 0;
    return materials.reduce((total, material) => total + material.quantity, 0);
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
        setEditQuantity(isMultiItemRequest() ? getTotalQuantityForMultiItem().toString() : selectedRequest.quantity_requested.toString());
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
          const isDummySupplier = DUMMY_SUPPLIERS.some(dummy => dummy.id === selectedSupplier);
          
          if (!isDummySupplier) {
            updates.supplier_id = selectedSupplier;
          }
          
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

      // Update quantity only for single item requests
      if (!isMultiItemRequest() && editQuantity && parseInt(editQuantity) !== selectedRequest.quantity_requested) {
        updates.quantity_requested = parseInt(editQuantity);
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
      selectedRequest.raw_material?.name || 'Multiple Materials',
      selectedRequest.quantity_requested,
      selectedRequest.unit,
      selectedRequest.request_number,
      selectedRequest.eta
    );

    if (success) {
      const history = await getNotificationHistory(selectedRequest.id);
      setWhatsappHistory(history);
    }
  };

  const origin = getRequestOrigin(selectedRequest?.notes);
  const isIncomplete = isIncompleteRequest();
  const isMultiItem = isMultiItemRequest();
  const multiItemMaterials = parseMultiItemMaterials(selectedRequest?.notes);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            Request Details
            <Badge variant={origin === 'inventory' ? "secondary" : origin === 'multi-item' ? "default" : "outline"} className="text-xs">
              {origin === 'inventory' ? 'From Alert' : origin === 'multi-item' ? 'Multi-Item' : 'Single Item'}
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
          {/* Material(s) Section */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              Request ID: {selectedRequest?.request_number}
            </div>
            
            {isMultiItem && multiItemMaterials ? (
              <div>
                <Label className="text-sm font-medium">Materials ({multiItemMaterials.length} items)</Label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                  {multiItemMaterials.map((material, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
                      <div>
                        <span className="font-medium">{material.name}</span>
                        <span className="text-gray-500 ml-1">({material.type})</span>
                      </div>
                      <div className="text-right">
                        <div>{material.quantity} {material.unit}</div>
                        {material.notes && (
                          <div className="text-gray-500 text-xs">{material.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">{selectedRequest?.raw_material?.name || ''}</span>
                  <Badge variant="outline" className="text-xs ml-2">{selectedRequest?.raw_material?.type || 'Unknown'}</Badge>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Total Quantity</Label>
              {editMode && !isMultiItem ? (
                <Input
                  type="number"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  className="mt-1 text-sm"
                />
              ) : (
                <Input 
                  value={`${isMultiItem ? getTotalQuantityForMultiItem() : selectedRequest?.quantity_requested || 0} ${selectedRequest?.unit || ''}`} 
                  disabled 
                  className="mt-1 text-sm"
                />
              )}
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
