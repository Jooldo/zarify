
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { ProcurementRequest } from '@/hooks/useProcurementRequests';

interface ViewRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: ProcurementRequest | null;
  onUpdateRequestStatus: (requestId: string, newStatus: string) => void;
}

const ViewRequestDialog = ({ isOpen, onOpenChange, selectedRequest, onUpdateRequestStatus }: ViewRequestDialogProps) => {
  const extractSupplierFromNotes = (notes?: string) => {
    if (!notes) return '-';
    const supplierMatch = notes.match(/Supplier:\s*([^\n]+)/);
    return supplierMatch ? supplierMatch[1].trim() : '-';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Procurement Request Details - {selectedRequest?.request_number}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Material</Label>
              <Input value={selectedRequest?.raw_material?.name || ''} disabled />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input value={`${selectedRequest?.quantity_requested || 0} ${selectedRequest?.unit || ''}`} disabled />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date Requested</Label>
              <Input value={selectedRequest?.date_requested ? new Date(selectedRequest.date_requested).toLocaleDateString() : ''} disabled />
            </div>
            <div>
              <Label>Expected Delivery</Label>
              <Input value={selectedRequest?.eta ? new Date(selectedRequest.eta).toLocaleDateString() : ''} disabled />
            </div>
          </div>
          <div>
            <Label>Supplier</Label>
            <Input value={extractSupplierFromNotes(selectedRequest?.notes)} disabled />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={selectedRequest?.status || ''} 
              onValueChange={(value) => onUpdateRequestStatus(selectedRequest?.id || '', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Received">Received</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {selectedRequest?.notes && (
            <div>
              <Label>Notes</Label>
              <Textarea value={selectedRequest.notes} disabled />
            </div>
          )}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewRequestDialog;
