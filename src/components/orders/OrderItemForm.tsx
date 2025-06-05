
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Minus } from 'lucide-react';
import ProductCodeSelector from './ProductCodeSelector';

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
        <ProductCodeSelector
          value={item.productCode}
          onChange={(value) => updateItem(index, 'productCode', value)}
        />

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

      <div className="text-right">
        <span className="text-xs font-medium">
          Subtotal: ₹{(item.price * item.quantity).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default OrderItemForm;
