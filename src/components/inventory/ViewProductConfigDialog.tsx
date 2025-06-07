
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Package, Warehouse, Calendar } from 'lucide-react';

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
    <div className="space-y-4 max-w-4xl">
      {/* Header Section */}
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-semibold text-blue-900">Product Configuration</h3>
          <Badge variant={config.is_active ? "default" : "secondary"} className="text-xs">
            {config.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div className="text-lg font-bold font-mono text-blue-700">
          {config.product_code}
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-medium text-gray-700">Product Type:</Label>
            <div className="text-sm font-semibold text-gray-900 mt-1">
              {config.subcategory}
            </div>
          </div>
          
          <div>
            <Label className="text-xs font-medium text-gray-700">Category:</Label>
            <div className="text-sm text-gray-900 mt-1">
              {config.category}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-xs font-medium text-gray-700">Size Value:</Label>
            <div className="text-sm font-medium text-gray-900 mt-1">
              {sizeValueInInches}" (inches)
            </div>
          </div>
          
          {config.weight_range && (
            <div>
              <Label className="text-xs font-medium text-gray-700">Weight:</Label>
              <div className="text-sm font-medium text-gray-900 mt-1">
                {config.weight_range}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timestamps */}
      <div className="grid grid-cols-2 gap-4 pt-3 border-t">
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3 text-gray-500" />
          <div>
            <Label className="text-xs font-medium text-gray-500">Created:</Label>
            <div className="text-xs text-gray-700">
              {new Date(config.created_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3 text-gray-500" />
          <div>
            <Label className="text-xs font-medium text-gray-500">Last Updated:</Label>
            <div className="text-xs text-gray-700">
              {new Date(config.updated_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Raw Materials Section */}
      {config.product_config_materials && config.product_config_materials.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 pt-3 border-t">
            <Package className="h-4 w-4 text-gray-700" />
            <Label className="text-sm font-semibold text-gray-900">Raw Materials Required</Label>
          </div>
          
          <div className="grid gap-3">
            {config.product_config_materials.map((material, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-3 gap-3 items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Package className="h-3 w-3 text-gray-500" />
                      <Label className="text-xs font-medium text-gray-700">Material:</Label>
                    </div>
                    <div className="text-xs font-semibold text-gray-900">
                      {material.raw_material?.name || 'Unknown Material'}
                    </div>
                    <Badge variant="outline" className="text-xs w-fit h-4 px-1">
                      {material.raw_material?.type || 'N/A'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Warehouse className="h-3 w-3 text-gray-500" />
                      <Label className="text-xs font-medium text-gray-700">Quantity:</Label>
                    </div>
                    <div className="text-xs font-semibold text-gray-900">
                      {material.quantity_required} {material.unit}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-700">Unit:</Label>
                    <Badge variant="secondary" className="text-xs w-fit h-4 px-1">
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
