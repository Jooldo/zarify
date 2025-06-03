
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
    <div className="space-y-3">
      <div>
        <Label htmlFor="productCode" className="text-xs">Product Code</Label>
        <Select value={selectedProductCode} onValueChange={setSelectedProductCode}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select product code" />
          </SelectTrigger>
          <SelectContent>
            {activeProductConfigs.map((config) => (
              <SelectItem key={config.productCode} value={config.productCode} className="text-xs">
                {config.productCode}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedConfig && (
        <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded text-xs">
          <div>
            <Label className="text-xs font-medium">Category</Label>
            <div className="text-xs text-gray-600">{selectedConfig.category}</div>
          </div>
          <div>
            <Label className="text-xs font-medium">Subcategory</Label>
            <div className="text-xs text-gray-600">{selectedConfig.subcategory}</div>
          </div>
          <div>
            <Label className="text-xs font-medium">Size</Label>
            <div className="text-xs text-gray-600">{selectedConfig.size}</div>
          </div>
          <div>
            <Label className="text-xs font-medium">Status</Label>
            <Badge variant="default" className="text-xs h-4 px-1">Active</Badge>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="quantity" className="text-xs">Current Stock</Label>
          <Input id="quantity" type="number" placeholder="0" className="h-8 text-xs" />
        </div>
        <div>
          <Label htmlFor="threshold" className="text-xs">Threshold</Label>
          <Input id="threshold" type="number" placeholder="0" className="h-8 text-xs" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="required" className="text-xs">Required Quantity</Label>
          <Input id="required" type="number" placeholder="0" className="h-8 text-xs" />
        </div>
        <div>
          <Label htmlFor="inManufacturing" className="text-xs">In Manufacturing</Label>
          <Input id="inManufacturing" type="number" placeholder="0" className="h-8 text-xs" />
        </div>
      </div>
      <Button className="w-full h-8 text-xs" disabled={!selectedProductCode}>Add to Inventory</Button>
    </div>
  );
};

export default AddProductDialog;
