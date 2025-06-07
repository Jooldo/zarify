
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RawMaterial } from '@/hooks/useRawMaterials';
import MaterialStatusBadge from './MaterialStatusBadge';

interface ViewRawMaterialDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  material: RawMaterial | null;
}

const ViewRawMaterialDialog = ({ isOpen, onOpenChange, material }: ViewRawMaterialDialogProps) => {
  if (!material) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">Material Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <Label className="text-xs font-medium text-gray-600">Name:</Label>
              <div className="font-semibold">{material.name}</div>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-600">Type:</Label>
              <div>{material.type}</div>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-600">Current Stock:</Label>
              <div className="font-semibold text-blue-600">
                {material.current_stock} {material.unit}
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-600">Min. Stock:</Label>
              <div>{material.minimum_stock} {material.unit}</div>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-600">Required:</Label>
              <div>{material.required} {material.unit}</div>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-600">In Procurement:</Label>
              <div>{material.in_procurement} {material.unit}</div>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-600">Status:</Label>
              <MaterialStatusBadge 
                currentStock={material.current_stock}
                minimumStock={material.minimum_stock}
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-600">Cost/Unit:</Label>
              <div>₹{material.cost_per_unit || 'N/A'}</div>
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-600">Last Updated:</Label>
            <div className="text-xs text-gray-500">
              {new Date(material.last_updated).toLocaleDateString()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewRawMaterialDialog;
