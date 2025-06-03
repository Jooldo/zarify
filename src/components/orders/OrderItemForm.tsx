
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

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
  generateSuborderId: (orderIndex: string, itemIndex: number) => string;
}

const OrderItemForm = ({ 
  item, 
  index, 
  items, 
  updateItem, 
  removeItem, 
  generateSuborderId 
}: OrderItemFormProps) => {
  // Product configurations from Product Config tab
  const productConfigs = [
    {
      productCode: "TRD-MNA-MD",
      category: "Traditional",
      subcategory: "Meena Work",
      size: "Medium (0.25m)"
    },
    {
      productCode: "TRD-KND-LG",
      category: "Traditional",
      subcategory: "Kundan Work",
      size: "Large (0.30m)"
    },
    {
      productCode: "MOD-SLV-SM",
      category: "Modern",
      subcategory: "Silver Chain",
      size: "Small (0.20m)"
    },
    {
      productCode: "TRD-TMP-XL",
      category: "Traditional",
      subcategory: "Temple Style",
      size: "Extra Large (0.35m)"
    },
    {
      productCode: "BRD-HEA-XL",
      category: "Bridal",
      subcategory: "Heavy Traditional",
      size: "Extra Large (0.35m)"
    }
  ];

  const selectedProduct = productConfigs.find(config => config.productCode === item.productCode);

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">
          Item {index + 1} 
          <Badge variant="outline" className="ml-2">
            Suborder ID: {generateSuborderId('XXX', index)}
          </Badge>
        </h4>
        {items.length > 1 && (
          <Button
            type="button"
            onClick={() => removeItem(index)}
            variant="outline"
            size="sm"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-3">
          <Label>Product Code *</Label>
          <Select
            value={item.productCode}
            onValueChange={(value) => updateItem(index, 'productCode', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select product code" />
            </SelectTrigger>
            <SelectContent>
              {productConfigs.map((config) => (
                <SelectItem key={config.productCode} value={config.productCode}>
                  {config.productCode} - {config.category} {config.subcategory} ({config.size})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProduct && (
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-3">
                <h5 className="text-sm font-medium mb-2">Product Details</h5>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <div className="font-medium">{selectedProduct.category}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Subcategory:</span>
                    <div className="font-medium">{selectedProduct.subcategory}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Size:</span>
                    <div className="font-medium">{selectedProduct.size}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div>
          <Label>Quantity *</Label>
          <Input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
            placeholder="1"
          />
        </div>

        <div>
          <Label>Price per piece (₹) *</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={item.price}
            onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>

        <div className="flex items-end">
          <div className="w-full">
            <Label>Item Total</Label>
            <div className="h-10 flex items-center px-3 border rounded-md bg-gray-50">
              ₹{(item.price * item.quantity).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderItemForm;
