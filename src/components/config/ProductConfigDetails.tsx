
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ProductConfigDetailsProps {
  category: string;
  subcategory: string;
  size: string;
  sizeValue: string;
  isActive: boolean;
  generateProductCode: () => string;
  setIsActive: (active: boolean) => void;
}

const ProductConfigDetails = ({ 
  category, 
  subcategory, 
  size, 
  sizeValue, 
  isActive, 
  generateProductCode, 
  setIsActive 
}: ProductConfigDetailsProps) => {
  const productCode = generateProductCode();

  return (
    <div className="space-y-3">
      {productCode && (
        <div className="p-2 bg-blue-50 rounded border text-xs">
          <Label className="text-xs font-medium">Generated Product Code:</Label>
          <div className="text-sm font-bold text-blue-700">{productCode}</div>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-2 p-2 bg-gray-50 rounded text-xs">
        <div>
          <Label className="text-xs font-medium">Full Description:</Label>
          <div className="text-xs text-gray-600">
            {category} - {subcategory} ({size}: {sizeValue}m)
          </div>
        </div>
        <div>
          <Label className="text-xs font-medium">Status:</Label>
          <div className="flex items-center space-x-1 mt-1">
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              className="scale-75"
            />
            <Badge variant={isActive ? "default" : "secondary"} className="text-xs h-4 px-1">
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductConfigDetails;
