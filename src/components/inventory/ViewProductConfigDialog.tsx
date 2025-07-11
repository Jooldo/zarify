import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Package, Warehouse, Calendar, Target } from 'lucide-react';
import { useRawMaterials } from '@/hooks/useRawMaterials';

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
  threshold?: number;
  image_url?: string;
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
  const { rawMaterials } = useRawMaterials();

  // Debug logging to see what data we're getting
  console.log('ViewProductConfigDialog - config:', config);
  console.log('ViewProductConfigDialog - product_config_materials:', config.product_config_materials);

  // Display size_value directly as inches (no conversion needed)
  const sizeValueInInches = config.size_value?.toFixed(2) || config.size_value;

  // Generate product code with full subcategory name and size
  const generateProductCode = () => {
    if (!config.category || !config.subcategory) return config.product_code;
    
    const categoryCode = config.category.slice(0, 3).toUpperCase();
    const subcategoryCode = config.subcategory.replace(/\s+/g, '').toUpperCase(); // Use entire subcategory name
    const sizeCode = config.size_value ? `${config.size_value}IN` : ''; // Add size in inches
    // Extract weight from weight_range (e.g., "35.5g" -> "35.5G")
    const weightCode = config.weight_range ? config.weight_range.replace('g', 'G') : '';
    
    return `${categoryCode}-${subcategoryCode}${sizeCode ? '-' + sizeCode : ''}${weightCode ? '-' + weightCode : ''}`;
  };

  // Helper function to get material name and type
  const getMaterialInfo = (materialId: string, materialData?: { name: string; type: string }) => {
    // First try to use the nested raw_material data
    if (materialData) {
      return { name: materialData.name, type: materialData.type };
    }
    
    // Fallback to finding it in the rawMaterials array
    const material = rawMaterials.find(m => m.id === materialId);
    if (material) {
      return { name: material.name, type: material.type };
    }
    
    // Last fallback
    return { name: 'Unknown Material', type: 'Unknown' };
  };

  // Get the materials array - handle both possible structures
  const materials = config.product_config_materials || [];
  const hasMaterials = materials && materials.length > 0;

  return (
    <div className="space-y-3 max-w-4xl">
      {config.image_url && (
        <div className="mb-4">
          <img
            src={config.image_url}
            alt={config.product_code}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}
      {/* Header Section */}
      <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="text-sm font-semibold text-blue-900">Product Configuration</h3>
          <Badge variant={config.is_active ? "default" : "secondary"} className="text-xs h-4 px-1">
            {config.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div className="text-base font-bold font-mono text-blue-700">
          {generateProductCode()}
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div>
            <Label className="text-xs font-medium text-gray-700">Product Type:</Label>
            <div className="text-sm font-semibold text-gray-900 mt-0.5">
              {config.subcategory}
            </div>
          </div>
          
          <div>
            <Label className="text-xs font-medium text-gray-700">Category:</Label>
            <div className="text-sm text-gray-900 mt-0.5">
              {config.category}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <Label className="text-xs font-medium text-gray-700">Size Value:</Label>
            <div className="text-sm font-medium text-gray-900 mt-0.5">
              {sizeValueInInches}" (inches)
            </div>
          </div>
          
          {config.weight_range && (
            <div>
              <Label className="text-xs font-medium text-gray-700">Weight:</Label>
              <div className="text-sm font-medium text-gray-900 mt-0.5">
                {config.weight_range}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Threshold Section */}
      {config.threshold !== undefined && config.threshold !== null && (
        <div className="p-2 bg-orange-50 rounded border border-orange-200">
          <div className="flex items-center gap-1.5">
            <Target className="h-3 w-3 text-orange-600" />
            <Label className="text-xs font-medium text-orange-700">Stock Threshold:</Label>
            <span className="text-sm font-semibold text-orange-900">{config.threshold} units</span>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t">
        <div className="flex items-center gap-1.5">
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
        
        <div className="flex items-center gap-1.5">
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
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 pt-2 border-t">
          <Package className="h-3 w-3 text-gray-700" />
          <Label className="text-sm font-semibold text-gray-900">Raw Materials Required</Label>
          <span className="text-xs text-gray-500">({materials.length} materials)</span>
        </div>
        
        {hasMaterials ? (
          <div className="space-y-1.5">
            {materials.map((material, index) => {
              const materialInfo = getMaterialInfo(material.raw_material_id, material.raw_material);
              
              return (
                <div key={index} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-3 w-3 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-900">
                        {materialInfo.name}
                      </span>
                      <Badge variant="outline" className="text-xs h-4 px-1">
                        {materialInfo.type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Warehouse className="h-3 w-3 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {material.quantity_required} {material.unit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No raw materials have been configured for this product.
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewProductConfigDialog;
