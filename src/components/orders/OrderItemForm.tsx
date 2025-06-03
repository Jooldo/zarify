import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Minus } from 'lucide-react';

interface OrderItemFormProps {
  item: {
    productCode: string;
    quantity: number;
    price: number;
  };
  index: number;
  items: any[];
  updateItem: (index: number, field: string, value: any) => void;
  removeItem: (index: number) => void;
  generateSuborderId: (orderIndex: number, itemIndex: number) => string;
}

const OrderItemForm = ({ item, index, items, updateItem, removeItem, generateSuborderId }: OrderItemFormProps) => {
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

  const selectedConfig = productConfigs.find(config => config.productCode === item.productCode);

  return (
    <div className="border rounded p-2 space-y-2 bg-gray-50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Item {index + 1}</span>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs h-4 px-1">
            {generateSuborderId(1, index)}
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeItem(index)}
            disabled={items.length === 1}
            className="h-6 w-6 p-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">Product Code *</Label>
          <Select value={item.productCode} onValueChange={(value) => updateItem(index, 'productCode', value)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {productConfigs.map((config) => (
                <SelectItem key={config.productCode} value={config.productCode} className="text-xs">
                  {config.productCode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Quantity *</Label>
          <Input
            type="number"
            value={item.quantity}
            onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
            min="1"
            className="h-8 text-xs"
            required
          />
        </div>

        <div>
          <Label className="text-xs">Price per Unit *</Label>
          <Input
            type="number"
            value={item.price}
            onChange={(e) => updateItem(index, 'price', Number(e.target.value))}
            min="0"
            className="h-8 text-xs"
            placeholder="₹0"
            required
          />
        </div>
      </div>

      {selectedConfig && (
        <div className="grid grid-cols-3 gap-2 p-2 bg-white rounded border text-xs">
          <div>
            <span className="font-medium">Category:</span> {selectedConfig.category}
          </div>
          <div>
            <span className="font-medium">Type:</span> {selectedConfig.subcategory}
          </div>
          <div>
            <span className="font-medium">Size:</span> {selectedConfig.size}
          </div>
        </div>
      )}

      <div className="text-right">
        <span className="text-xs font-medium">
          Subtotal: ₹{(item.price * item.quantity).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default OrderItemForm;
