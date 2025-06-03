
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const AddProductDialog = () => {
  const [selectedProductCode, setSelectedProductCode] = useState('');

  const productConfigs = [
    {
      id: "PC-001",
      category: "Traditional",
      subcategory: "Meena Work",
      size: "Small (0.20m)",
      productCode: "TRD-MEE-SM",
      isActive: true,
    },
    {
      id: "PC-002", 
      category: "Traditional",
      subcategory: "Meena Work",
      size: "Medium (0.25m)",
      productCode: "TRD-MEE-MD",
      isActive: true,
    },
    {
      id: "PC-003",
      category: "Traditional",
      subcategory: "Kundan Work", 
      size: "Large (0.30m)",
      productCode: "TRD-KUN-LG",
      isActive: true,
    },
    {
      id: "PC-004",
      category: "Modern",
      subcategory: "Silver Chain",
      size: "Small (0.20m)",
      productCode: "MOD-SIL-SM",
      isActive: true,
    },
    {
      id: "PC-005",
      category: "Bridal",
      subcategory: "Heavy Traditional",
      size: "Extra Large (0.35m)",
      productCode: "BRD-HEA-XL",
      isActive: false,
    }
  ];

  const activeProductConfigs = productConfigs.filter(config => config.isActive);
  const selectedConfig = activeProductConfigs.find(config => config.productCode === selectedProductCode);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="productCode">Product Code</Label>
        <Select value={selectedProductCode} onValueChange={setSelectedProductCode}>
          <SelectTrigger>
            <SelectValue placeholder="Select product code" />
          </SelectTrigger>
          <SelectContent>
            {activeProductConfigs.map((config) => (
              <SelectItem key={config.productCode} value={config.productCode}>
                {config.productCode}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedConfig && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <Label className="text-sm font-medium">Category</Label>
            <div className="text-sm text-gray-600">{selectedConfig.category}</div>
          </div>
          <div>
            <Label className="text-sm font-medium">Subcategory</Label>
            <div className="text-sm text-gray-600">{selectedConfig.subcategory}</div>
          </div>
          <div>
            <Label className="text-sm font-medium">Size</Label>
            <div className="text-sm text-gray-600">{selectedConfig.size}</div>
          </div>
          <div>
            <Label className="text-sm font-medium">Status</Label>
            <Badge variant="default" className="text-xs">Active</Badge>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">Current Stock</Label>
          <Input id="quantity" type="number" placeholder="0" />
        </div>
        <div>
          <Label htmlFor="threshold">Threshold</Label>
          <Input id="threshold" type="number" placeholder="0" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="required">Required Quantity</Label>
          <Input id="required" type="number" placeholder="0" />
        </div>
        <div>
          <Label htmlFor="inManufacturing">In Manufacturing</Label>
          <Input id="inManufacturing" type="number" placeholder="0" />
        </div>
      </div>
      <Button className="w-full" disabled={!selectedProductCode}>Add to Inventory</Button>
    </div>
  );
};

export default AddProductDialog;
