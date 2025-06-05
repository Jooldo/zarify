
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useActivityLog } from '@/hooks/useActivityLog';
import { supabase } from '@/integrations/supabase/client';
import OrderItemForm from './orders/OrderItemForm';

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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { logActivity } = useActivityLog();

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

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get merchant ID
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      // Validate that all product codes exist and get their UUIDs
      const productCodes = items.map(item => item.productCode);
      const { data: productConfigs, error: configError } = await supabase
        .from('product_configs')
        .select('id, product_code')
        .in('product_code', productCodes)
        .eq('merchant_id', merchantId);

      if (configError) throw configError;

      // Check if all product codes were found
      const foundCodes = productConfigs?.map(config => config.product_code) || [];
      const missingCodes = productCodes.filter(code => !foundCodes.includes(code));
      
      if (missingCodes.length > 0) {
        throw new Error(`Product codes not found: ${missingCodes.join(', ')}`);
      }

      // Create or find customer
      let customerId;
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', customerPhone)
        .eq('merchant_id', merchantId)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            name: customerName,
            phone: customerPhone,
            merchant_id: merchantId
          })
          .select('id')
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;

        // Log customer creation activity
        await logActivity(
          'created',
          'customer',
          customerId,
          `created a new customer "${customerName}" with phone ${customerPhone}`
        );
      }

      // Generate order number using database function
      const { data: orderNumber, error: orderNumberError } = await supabase
        .rpc('get_next_order_number');

      if (orderNumberError) throw orderNumberError;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_id: customerId,
          total_amount: calculateTotal(),
          expected_delivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          merchant_id: merchantId,
          status: 'Created' as const
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Generate suborder IDs and create order items
      const orderItems = [];
      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        const productConfig = productConfigs?.find(config => config.product_code === item.productCode);
        if (!productConfig) {
          throw new Error(`Product config not found for code: ${item.productCode}`);
        }
        
        // Generate suborder ID using database function
        const { data: suborderId, error: suborderError } = await supabase
          .rpc('get_next_suborder_id', {
            order_number: orderNumber,
            item_index: index + 1
          });

        if (suborderError) throw suborderError;
        
        orderItems.push({
          order_id: order.id,
          product_config_id: productConfig.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          suborder_id: suborderId,
          merchant_id: merchantId,
          status: 'Created' as const
        });
      }

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Log order creation activity
      await logActivity(
        'created',
        'order',
        orderNumber,
        `created Order ${orderNumber} for customer "${customerName}" with ${items.length} items totaling ₹${calculateTotal().toLocaleString()}`
      );

      toast({
        title: 'Success',
        description: 'Order created successfully',
      });

      onOrderCreated();
      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create order',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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
              generateSuborderId={(orderIndex: number, itemIndex: number) => `Preview: S-OD${String(orderIndex).padStart(6, '0')}-${String(itemIndex).padStart(2, '0')}`}
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
        <Button type="submit" size="sm" className="h-8 text-xs" disabled={loading}>
          {loading ? 'Creating...' : 'Create Order'}
        </Button>
      </div>
    </form>
  );
};

export default CreateOrderForm;
