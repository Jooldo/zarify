
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const extractSupplierFromNotes = (notes?: string) => {
    if (!notes) return '-';
    const supplierMatch = notes.match(/Supplier:\s*([^\n]+)/);
    return supplierMatch ? supplierMatch[1].trim() : '-';
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
    }
  }, [isOpen]);

  const handleSupplierUpdate = async () => {
    if (!selectedRequest || !selectedSupplier) return;

    setLoading(true);
    try {
      const { data: supplier } = await supabase
        .from('suppliers')
        .select('company_name')
        .eq('id', selectedSupplier)
        .single();

      const updatedNotes = selectedRequest.notes 
        ? `${selectedRequest.notes}\nSupplier: ${supplier?.company_name}`
        : `Supplier: ${supplier?.company_name}`;

      const { error } = await supabase
        .from('procurement_requests')
        .update({ 
          supplier_id: selectedSupplier,
          notes: updatedNotes
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Supplier updated successfully',
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast({
        title: 'Error',
        description: 'Failed to update supplier',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Request Details</DialogTitle>
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
              <Input 
                value={selectedRequest?.eta ? new Date(selectedRequest.eta).toLocaleDateString() : 'Not specified'} 
                disabled 
                className="mt-1 text-sm"
              />
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
            <Label className="text-sm">Current Supplier</Label>
            <Input 
              value={extractSupplierFromNotes(selectedRequest?.notes)} 
              disabled 
              className="mt-1 text-sm"
            />
          </div>

          <div>
            <Label className="text-sm">Assign Supplier</Label>
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
            {selectedSupplier && (
              <Button onClick={handleSupplierUpdate} disabled={loading} className="flex-1">
                {loading ? 'Updating...' : 'Update Supplier'}
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewRequestDialog;
