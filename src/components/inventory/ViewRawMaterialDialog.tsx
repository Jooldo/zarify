
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RawMaterial } from '@/hooks/useRawMaterials';

interface ViewRawMaterialDialogProps {
  material: RawMaterial;
}

const ViewRawMaterialDialog = ({ material }: ViewRawMaterialDialogProps) => {
  const getStockStatus = (currentStock: number, minimumStock: number) => {
    if (currentStock === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (currentStock <= minimumStock) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const status = getStockStatus(material.current_stock, material.minimum_stock);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <Label className="font-medium">Material Name:</Label>
          <div className="text-lg font-bold">{material.name}</div>
        </div>
        <div>
          <Label className="font-medium">Type:</Label>
          <div className="text-lg">{material.type}</div>
        </div>
        <div>
          <Label className="font-medium">Current Stock:</Label>
          <div className="text-lg font-bold text-blue-600">
            {material.current_stock} {material.unit}
          </div>
        </div>
        <div>
          <Label className="font-medium">Minimum Stock:</Label>
          <div className="text-lg">{material.minimum_stock} {material.unit}</div>
        </div>
        <div>
          <Label className="font-medium">Required:</Label>
          <div className="text-lg">{material.required} {material.unit}</div>
        </div>
        <div>
          <Label className="font-medium">In Procurement:</Label>
          <div className="text-lg">{material.in_procurement} {material.unit}</div>
        </div>
        <div>
          <Label className="font-medium">Stock Status:</Label>
          <Badge variant={status.variant} className="text-sm">
            {status.label}
          </Badge>
        </div>
        <div>
          <Label className="font-medium">Supplier:</Label>
          <div className="text-lg">{material.supplier?.company_name || 'N/A'}</div>
        </div>
        <div>
          <Label className="font-medium">Cost per Unit:</Label>
          <div className="text-lg">${material.cost_per_unit || 'N/A'}</div>
        </div>
        <div>
          <Label className="font-medium">Last Updated:</Label>
          <div className="text-sm text-gray-600">
            {new Date(material.last_updated).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRawMaterialDialog;
