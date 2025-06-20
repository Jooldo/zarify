
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import OrderItemForm from './OrderItemForm';

interface OrderFormItem {
  productCode: string;
  quantity: number;
  price: string; // String for form handling
}

interface OrderItemsSectionProps {
  items: OrderFormItem[];
  onAddItem: () => void;
  updateItem: (index: number, field: string, value: any) => void;
  removeItem: (index: number) => void;
  generateSuborderId: (itemIndex: number) => string;
}

const OrderItemsSection = ({
  items,
  onAddItem,
  updateItem,
  removeItem,
  generateSuborderId
}: OrderItemsSectionProps) => {
  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const price = item.price === '' ? 0 : Number(item.price);
      return total + (price * item.quantity);
    }, 0);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Order Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {items.map((item, index) => (
          <OrderItemForm
            key={index}
            item={item}
            index={index}
            suborderId={generateSuborderId(index)}
            updateItem={updateItem}
            removeItem={removeItem}
            canRemove={items.length > 1}
          />
        ))}

        {/* Add Item Button - Now below the items */}
        <div className="flex justify-center pt-2">
          <Button type="button" onClick={onAddItem} variant="outline" size="sm" className="h-7 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Add Item
          </Button>
        </div>

        <div className="border-t pt-2 mt-3">
          <div className="flex justify-between items-center text-sm font-bold">
            <span>Total Order Amount:</span>
            <span>₹{calculateTotal().toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderItemsSection;
