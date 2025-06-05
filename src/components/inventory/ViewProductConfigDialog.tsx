
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface ProductConfig {
  id: string;
  category: string;
  subcategory: string;
  size_value: number;
  weight_range: string | null;
  product_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_config_materials?: {
    raw_material_id: string;
    quantity_required: number;
    unit: string;
    raw_material?: {
      name: string;
      type: string;
    };
  }[];
}

interface ViewProductConfigDialogProps {
  config: ProductConfig;
}

const ViewProductConfigDialog = ({ config }: ViewProductConfigDialogProps) => {
  // Display size_value directly as inches (no conversion needed)
  const sizeValueInInches = config.size_value?.toFixed(2) || config.size_value;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <Label className="text-xs font-medium">Product Code:</Label>
          <div className="text-sm font-bold font-mono bg-gray-50 p-1 rounded">
            {config.product_code}
          </div>
        </div>
        <div>
          <Label className="text-xs font-medium">Status:</Label>
          <Badge variant={config.is_active ? "default" : "secondary"} className="text-xs h-4 px-1">
            {config.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div>
          <Label className="text-xs font-medium">Category:</Label>
          <div className="text-sm font-medium">{config.category}</div>
        </div>
        <div>
          <Label className="text-xs font-medium">Subcategory:</Label>
          <div className="text-sm">{config.subcategory}</div>
        </div>
        <div>
          <Label className="text-xs font-medium">Size Value:</Label>
          <div className="text-sm">{sizeValueInInches}"</div>
        </div>
        {config.weight_range && (
          <div>
            <Label className="text-xs font-medium">Weight Range:</Label>
            <div className="text-sm">{config.weight_range}</div>
          </div>
        )}
        <div>
          <Label className="text-xs font-medium">Created:</Label>
          <div className="text-xs text-gray-600">
            {new Date(config.created_at).toLocaleDateString()}
          </div>
        </div>
        <div>
          <Label className="text-xs font-medium">Last Updated:</Label>
          <div className="text-xs text-gray-600">
            {new Date(config.updated_at).toLocaleDateString()}
          </div>
        </div>
      </div>
      
      {config.product_config_materials && config.product_config_materials.length > 0 && (
        <div className="mt-4">
          <Label className="text-xs font-medium">Raw Materials Required:</Label>
          <div className="mt-1 space-y-1">
            {config.product_config_materials.map((material, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="font-medium">Material:</span>{' '}
                    <div className="text-xs font-medium text-blue-700">
                      {material.raw_material?.name || 'Unknown Material'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {material.raw_material?.type || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Quantity:</span>{' '}
                    <div className="text-xs font-medium">
                      {material.quantity_required} {material.unit}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Unit:</span>{' '}
                    <Badge variant="outline" className="text-xs h-3 px-1">
                      {material.unit}
                    </Badge>
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
