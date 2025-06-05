
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import CustomerInfoSection from './orders/CustomerInfoSection';
import OrderItemsSection from './orders/OrderItemsSection';
import { useOrderSubmission } from '@/hooks/useOrderSubmission';

interface CreateOrderFormProps {
  onClose: () => void;
  onOrderCreated: () => void;
}

const CreateOrderForm = ({ onClose, onOrderCreated }: CreateOrderFormProps) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState([{
    productCode: '',
    quantity: 1,
    price: 0
  }]);

  const { submitOrder, loading } = useOrderSubmission({ onOrderCreated, onClose });

  const addItem = () => {
    setItems([...items, {
      productCode: '',
      quantity: 1,
      price: 0
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
    await submitOrder(customerName, customerPhone, items);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <CustomerInfoSection
        customerName={customerName}
        customerPhone={customerPhone}
        onCustomerNameChange={setCustomerName}
        onCustomerPhoneChange={setCustomerPhone}
      />

      <OrderItemsSection
        items={items}
        onAddItem={addItem}
        updateItem={updateItem}
        removeItem={removeItem}
        generateSuborderId={generatePreviewSuborderId}
      />

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onClose} size="sm" className="h-8 text-xs">
          Cancel
        </Button>
        <Button type="submit" size="sm" className="h-8 text-xs" disabled={loading}>
          {loading ? 'Creating...' : 'Create Order'}
        </Button>
      </div>
    </form>
  );
};

export default CreateOrderForm;
