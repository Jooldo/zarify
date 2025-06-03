
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';

interface OrderItemFormProps {
  item: {
    category: string;
    subcategory: string;
    size: string;
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
  const categories = {
    "Traditional": ["Meena Work", "Kundan Work", "Temple Style", "Oxidized"],
    "Modern": ["Silver Chain", "Gold Plated", "Beaded", "Charm Style"],
    "Bridal": ["Heavy Traditional", "Designer", "Kundan Heavy", "Polki Work"]
  };

  const sizes = [
    "Small (0.20m)", 
    "Medium (0.25m)", 
    "Large (0.30m)", 
    "Extra Large (0.35m)", 
    "XXL (0.40m)"
  ];

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
        <div>
          <Label>Category *</Label>
          <Select
            value={item.category}
            onValueChange={(value) => updateItem(index, 'category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(categories).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Subcategory *</Label>
          <Select
            value={item.subcategory}
            onValueChange={(value) => updateItem(index, 'subcategory', value)}
            disabled={!item.category}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subcategory" />
            </SelectTrigger>
            <SelectContent>
              {item.category && categories[item.category].map((subcat) => (
                <SelectItem key={subcat} value={subcat}>
                  {subcat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Size *</Label>
          <Select
            value={item.size}
            onValueChange={(value) => updateItem(index, 'size', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
