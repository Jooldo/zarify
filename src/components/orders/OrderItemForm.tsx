
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import ProductCodeSelector from './ProductCodeSelector';

interface OrderItemFormProps {
  item: {
    productCode: string;
    quantity: number;
    price: string | number;
  };
  index: number;
  suborderId: string;
  updateItem: (index: number, field: string, value: any) => void;
  removeItem: (index: number) => void;
  canRemove: boolean;
}

const OrderItemForm = ({ 
  item, 
  index, 
  suborderId, 
  updateItem, 
  removeItem, 
  canRemove 
}: OrderItemFormProps) => {
  const handlePriceChange = (value: string) => {
    // Allow empty string or valid number
    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
      updateItem(index, 'price', value);
    }
  };

  return (
    <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-medium text-gray-600">
          Item {index + 1} - {suborderId}
        </div>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeItem(index)}
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {/* First line: Product Code */}
        <div>
          <ProductCodeSelector
            value={item.productCode}
            onChange={(value) => updateItem(index, 'productCode', value)}
          />
        </div>

        {/* Second line: Quantity and Price */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor={`quantity-${index}`} className="text-xs">Quantity *</Label>
            <Input
              id={`quantity-${index}`}
              type="number"
              value={item.quantity}
              onChange={(e) => updateItem(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="h-8 text-xs"
              required
            />
          </div>

          <div>
            <Label htmlFor={`price-${index}`} className="text-xs">Price per Unit (₹) *</Label>
            <Input
              id={`price-${index}`}
              type="number"
              value={item.price}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder="Enter price per unit"
              min="0"
              step="0.01"
              className="h-8 text-xs"
              required
            />
          </div>
        </div>
      </div>

      {item.price && item.quantity && (
        <div className="mt-2 text-xs text-gray-600">
          Total: ₹{(Number(item.price) * item.quantity).toFixed(2)}
        </div>
      )}
    </div>
  );
};

export default OrderItemForm;
