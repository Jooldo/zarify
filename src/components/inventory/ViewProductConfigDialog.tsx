
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
  // Extract weight range from size if it contains weight info, otherwise show size value in inches
  const getSizeDisplay = () => {
    // Check if size contains weight range pattern
    const weightMatch = config.size?.match(/(\d+(?:\.\d+)?-\d+(?:\.\d+)?\s*gms?)/i);
    if (weightMatch) {
      return {
        sizeValue: `${config.size_value}"`,
        weightRange: weightMatch[1]
      };
    }
    return {
      sizeValue: config.size_value ? `${config.size_value}"` : `${config.size_value}m`,
      weightRange: null
    };
  };

  const { sizeValue, weightRange } = getSizeDisplay();

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
          <Label className="font-medium">Size Value:</Label>
          <div className="text-lg">{sizeValue}</div>
        </div>
        {weightRange && (
          <div>
            <Label className="font-medium">Weight Range:</Label>
            <div className="text-lg">{weightRange}</div>
          </div>
        )}
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
              <div key={index} className="p-3 bg-gray-50 rounded text-sm">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="font-medium">Material:</span>{' '}
                    <div className="text-base font-medium text-blue-700">
                      {material.raw_material?.name || 'Unknown Material'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Type: {material.raw_material?.type || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Quantity Required:</span>{' '}
                    <div className="text-base font-medium">
                      {material.quantity_required} {material.unit}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Unit:</span>{' '}
                    <Badge variant="outline" className="text-xs">
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
