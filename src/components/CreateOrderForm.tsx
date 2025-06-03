
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import OrderItemForm from './orders/OrderItemForm';

const CreateOrderForm = ({ onClose }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState([{
    productCode: '',
    quantity: 1,
    price: 0
  }]);

  const generateSuborderId = (orderIndex, itemIndex) => {
    return `SUB-${String(orderIndex).padStart(3, '0')}-${itemIndex + 1}`;
  };

  const addItem = () => {
    setItems([...items, {
      productCode: '',
      quantity: 1,
      price: 0
    }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const updatedItems = items.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const orderIndex = Math.floor(Math.random() * 1000);
    
    const suborders = items.map((item, index) => ({
      id: generateSuborderId(orderIndex, index),
      productCode: item.productCode,
      quantity: item.quantity,
      price: item.price * item.quantity,
      status: "Created"
    }));

    const orderData = {
      customer: customerName,
      phone: customerPhone,
      suborders: suborders,
      totalAmount: calculateTotal(),
      createdDate: new Date().toISOString().split('T')[0],
      expectedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    console.log('Creating order with suborders:', orderData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-0">
          <div>
            <Label htmlFor="customerName" className="text-xs">Customer Name *</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              className="h-8 text-xs"
              required
            />
          </div>
          <div>
            <Label htmlFor="customerPhone" className="text-xs">Phone Number *</Label>
            <Input
              id="customerPhone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              className="h-8 text-xs"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Order Items</CardTitle>
            <Button type="button" onClick={addItem} variant="outline" size="sm" className="h-7 text-xs">
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

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onClose} size="sm" className="h-8 text-xs">
          Cancel
        </Button>
        <Button type="submit" size="sm" className="h-8 text-xs">
          Create Order
        </Button>
      </div>
    </form>
  );
};

export default CreateOrderForm;
