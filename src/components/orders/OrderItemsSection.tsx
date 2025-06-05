
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import OrderItemForm from './OrderItemForm';

interface OrderItem {
  productCode: string;
  quantity: number;
  price: number;
}

interface OrderItemsSectionProps {
  items: OrderItem[];
  onAddItem: () => void;
  updateItem: (index: number, field: string, value: any) => void;
  removeItem: (index: number) => void;
  generateSuborderId: (orderIndex: number, itemIndex: number) => string;
}

const OrderItemsSection = ({
  items,
  onAddItem,
  updateItem,
  removeItem,
  generateSuborderId
}: OrderItemsSectionProps) => {
  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Order Items</CardTitle>
          <Button type="button" onClick={onAddItem} variant="outline" size="sm" className="h-7 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {items.map((item, index) => (
          <OrderItemForm
            key={index}
            item={item}
            index={index}
            items={items}
            updateItem={updateItem}
            removeItem={removeItem}
            generateSuborderId={generateSuborderId}
          />
        ))}

        <div className="border-t pt-3">
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
