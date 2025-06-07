
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerInfoSection from './orders/CustomerInfoSection';
import OrderItemsSection from './orders/OrderItemsSection';
import { useOrderSubmission } from '@/hooks/useOrderSubmission';

interface CreateOrderFormProps {
  onClose: () => void;
  onOrderCreated: () => void;
}

interface OrderFormItem {
  productCode: string;
  quantity: number;
  price: string; // Keep as string for form handling
}

const CreateOrderForm = ({ onClose, onOrderCreated }: CreateOrderFormProps) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [items, setItems] = useState<OrderFormItem[]>([{
    productCode: '',
    quantity: 1,
    price: '' // Empty string as placeholder
  }]);

  const { submitOrder, loading } = useOrderSubmission({ onOrderCreated, onClose });

  // Calculate default expected delivery date (7 days from now)
  const getDefaultExpectedDelivery = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  const addItem = () => {
    setItems([...items, {
      productCode: '',
      quantity: 1,
      price: '' // Empty string as placeholder
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = items.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const generatePreviewSuborderId = (itemIndex: number) => {
    return `S-OD000001-${String(itemIndex).padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert string prices to numbers for submission
    const itemsWithValidPrices = items.map(item => ({
      ...item,
      price: item.price === '' ? 0 : Number(item.price)
    }));
    
    // Set default expected delivery if not provided
    const deliveryDate = expectedDelivery || getDefaultExpectedDelivery();
    
    await submitOrder(customerName, customerPhone, itemsWithValidPrices, deliveryDate);
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-3">
        <CustomerInfoSection
          customerName={customerName}
          customerPhone={customerPhone}
          onCustomerNameChange={setCustomerName}
          onCustomerPhoneChange={setCustomerPhone}
        />

        {/* Expected Delivery Section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="expectedDelivery" className="text-xs">Expected Delivery Date</Label>
              <Input
                id="expectedDelivery"
                type="date"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
                placeholder={getDefaultExpectedDelivery()}
                className="h-8 text-xs"
              />
              <p className="text-xs text-gray-500 mt-1">
                Default: {new Date(getDefaultExpectedDelivery()).toLocaleDateString('en-IN')} (7 days from today)
              </p>
            </div>
          </CardContent>
        </Card>

        <OrderItemsSection
          items={items}
          onAddItem={addItem}
          updateItem={updateItem}
          removeItem={removeItem}
          generateSuborderId={generatePreviewSuborderId}
        />

        <div className="flex gap-2 justify-end pt-2 border-t">
          <Button type="button" variant="outline" onClick={onClose} size="sm" className="h-8 text-xs">
            Cancel
          </Button>
          <Button type="submit" size="sm" className="h-8 text-xs" disabled={loading}>
            {loading ? 'Creating...' : 'Create Order'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrderForm;
