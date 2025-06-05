
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useActivityLog } from '@/hooks/useActivityLog';
import { supabase } from '@/integrations/supabase/client';

interface OrderItem {
  productCode: string;
  quantity: number;
  price: number;
}

interface UseOrderSubmissionProps {
  onOrderCreated: () => void;
  onClose: () => void;
}

export const useOrderSubmission = ({ onOrderCreated, onClose }: UseOrderSubmissionProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { logActivity } = useActivityLog();

  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const submitOrder = async (customerName: string, customerPhone: string, items: OrderItem[]) => {
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
          total_amount: calculateTotal(items),
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
        `created Order ${orderNumber} for customer "${customerName}" with ${items.length} items totaling ₹${calculateTotal(items).toLocaleString()}`
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

  return { submitOrder, loading };
};
