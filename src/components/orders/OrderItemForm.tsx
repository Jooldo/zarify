
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import ProductCodeSelector from './ProductCodeSelector';

interface OrderItemFormProps {
  item: {
    productCode: string;
    quantity: number;
    price: string;
  };
  index: number;
  suborderId: string;
  updateItem: (index: number, field: string, value: any) => void;
  removeItem: (index: number) => void;
  canRemove: boolean;
}

const OrderItemForm = ({ item, index, suborderId, updateItem, removeItem, canRemove }: OrderItemFormProps) => {
  const totalPrice = item.price === '' ? 0 : Number(item.price) * item.quantity;

  return (
    <div className="p-2 border border-gray-200 rounded bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-gray-600">{suborderId}</div>
        {canRemove && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => removeItem(index)}
            className="h-5 w-5 p-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        <div>
          <Label className="text-xs">Product Code</Label>
          <ProductCodeSelector
            value={item.productCode}
            onValueChange={(value) => updateItem(index, 'productCode', value)}
          />
        </div>
        <div>
          <Label className="text-xs">Quantity</Label>
          <Input
            type="number"
            value={item.quantity}
            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
            min="1"
            className="h-6 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs">Unit Price (₹)</Label>
          <Input
            type="number"
            value={item.price}
            onChange={(e) => updateItem(index, 'price', e.target.value)}
            min="0"
            step="0.01"
            placeholder="0"
            className="h-6 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs">Total (₹)</Label>
          <Input
            value={`₹${totalPrice.toLocaleString()}`}
            disabled
            className="h-6 text-xs bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
};

export default OrderItemForm;
