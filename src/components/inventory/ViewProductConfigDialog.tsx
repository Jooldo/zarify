
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface ProductConfig {
  id: string;
  category: string;
  subcategory: string;
  size: string;
  size_value: number;
  product_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_config_materials?: {
    raw_material_id: string;
    quantity_required: number;
    unit: string;
  }[];
}

interface ViewProductConfigDialogProps {
  config: ProductConfig;
}

const ViewProductConfigDialog = ({ config }: ViewProductConfigDialogProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <Label className="font-medium">Product Code:</Label>
          <div className="text-lg font-bold font-mono bg-gray-50 p-2 rounded">
            {config.product_code}
          </div>
        </div>
        <div>
          <Label className="font-medium">Status:</Label>
          <Badge variant={config.is_active ? "default" : "secondary"} className="text-sm">
            {config.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div>
          <Label className="font-medium">Category:</Label>
          <div className="text-lg font-medium">{config.category}</div>
        </div>
        <div>
          <Label className="font-medium">Subcategory:</Label>
          <div className="text-lg">{config.subcategory}</div>
        </div>
        <div>
          <Label className="font-medium">Size:</Label>
          <div className="text-lg">{config.size}</div>
        </div>
        <div>
          <Label className="font-medium">Size Value:</Label>
          <div className="text-lg">{config.size_value}m</div>
        </div>
        <div>
          <Label className="font-medium">Created:</Label>
          <div className="text-sm text-gray-600">
            {new Date(config.created_at).toLocaleDateString()}
          </div>
        </div>
        <div>
          <Label className="font-medium">Last Updated:</Label>
          <div className="text-sm text-gray-600">
            {new Date(config.updated_at).toLocaleDateString()}
          </div>
        </div>
      </div>
      
      {config.product_config_materials && config.product_config_materials.length > 0 && (
        <div className="mt-6">
          <Label className="font-medium text-base">Raw Materials Required:</Label>
          <div className="mt-2 space-y-2">
            {config.product_config_materials.map((material, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="font-medium">Material ID:</span> {material.raw_material_id}
                  </div>
                  <div>
                    <span className="font-medium">Quantity:</span> {material.quantity_required}
                  </div>
                  <div>
                    <span className="font-medium">Unit:</span> {material.unit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProductConfigDialog;
