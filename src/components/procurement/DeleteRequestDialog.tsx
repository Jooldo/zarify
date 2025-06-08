
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import type { ProcurementRequest } from '@/hooks/useProcurementRequests';

interface DeleteRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  request: ProcurementRequest | null;
  onConfirmDelete: () => void;
  loading?: boolean;
}

const DeleteRequestDialog = ({ 
  isOpen, 
  onOpenChange, 
  request, 
  onConfirmDelete, 
  loading = false 
}: DeleteRequestDialogProps) => {
  const getRequestOrigin = (notes?: string) => {
    if (!notes) return 'procurement';
    if (notes.includes('Source: Inventory Alert')) return 'inventory';
    if (notes.includes('Source: Multi-Item Procurement Request')) return 'multi-item';
    return 'procurement';
  };

  const origin = getRequestOrigin(request?.notes);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Procurement Request
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this procurement request? This action cannot be undone.
          </p>
          
          {request && (
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Request ID:</span>
                <span>{request.request_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Material:</span>
                <span>{request.raw_material?.name || 'Multiple materials'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Type:</span>
                <span className="capitalize">{origin === 'multi-item' ? 'Multi-item' : origin}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span>{request.status}</span>
              </div>
            </div>
          )}
          
          <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            <strong>Warning:</strong> Deleting this request will not affect any existing inventory or stock levels.
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirmDelete}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRequestDialog;
