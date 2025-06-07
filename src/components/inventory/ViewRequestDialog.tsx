
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
}

const ViewRequestDialog = ({ isOpen, onOpenChange, selectedRequest, onUpdateRequestStatus }: ViewRequestDialogProps) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [editMode, setEditMode] = useState(false);
  const [editEta, setEditEta] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

        if (error) throw error;
        setSuppliers(data || []);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    if (isOpen) {
      fetchSuppliers();
      if (selectedRequest) {
        setSelectedSupplier(selectedRequest.supplier_id || '');
        setEditEta(selectedRequest.eta || '');
      }
    }
  }, [isOpen, selectedRequest]);

  const handleCompleteRequest = async () => {
    if (!selectedRequest || (!selectedSupplier && !editEta)) return;

    setLoading(true);
    try {
      const updates: any = {};
      let updatedNotes = selectedRequest.notes || '';

      if (selectedSupplier) {
        const selectedSupplierData = suppliers.find(s => s.id === selectedSupplier);
        if (selectedSupplierData) {
          updates.supplier_id = selectedSupplier;
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

          {selectedRequest?.notes && (
            <div>
              <Label className="text-sm">Notes</Label>
              <Textarea 
                value={selectedRequest.notes} 
                disabled 
                className="mt-1 text-sm min-h-[60px]"
              />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {isIncomplete && !editMode && (
              <Button 
                onClick={() => setEditMode(true)} 
                className="flex-1 flex items-center gap-2"
                variant="outline"
              >
                <Edit className="h-3 w-3" />
                Complete Request
              </Button>
            )}
            {editMode && (
              <Button 
                onClick={handleCompleteRequest} 
                disabled={loading || (!selectedSupplier && !editEta)} 
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
