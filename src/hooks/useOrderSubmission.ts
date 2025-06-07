
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OrderSubmissionHookProps {
  onOrderCreated: () => void;
  onClose: () => void;
}

interface OrderItem {
  productCode: string;
  quantity: number;
  price: number;
}

export const useOrderSubmission = ({ onOrderCreated, onClose }: OrderSubmissionHookProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submitOrder = async (
    customerName: string, 
    customerPhone: string, 
    items: OrderItem[],
    expectedDelivery?: string
  ) => {
    setLoading(true);

    try {
      // Get merchant ID
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      // Check if customer exists or create new one
      let customerId;
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('name', customerName)
        .eq('merchant_id', merchantId)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
        
        // Update phone if provided
        if (customerPhone) {
          await supabase
            .from('customers')
            .update({ phone: customerPhone })
            .eq('id', customerId);
        }
      } else {
        // Create new customer
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
      }

      // Calculate total amount
      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Get next order number
      const { data: orderNumber, error: orderNumError } = await supabase
        .rpc('get_next_order_number');

      if (orderNumError) throw orderNumError;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_id: customerId,
          total_amount: totalAmount,
          merchant_id: merchantId,
          expected_delivery: expectedDelivery || null
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      // Create order items
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Get product config
        const { data: productConfig, error: configError } = await supabase
          .from('product_configs')
          .select('id')
          .eq('product_code', item.productCode)
          .eq('merchant_id', merchantId)
          .single();

        if (configError) throw configError;

        // Generate suborder ID
        const { data: suborderId, error: suborderError } = await supabase
          .rpc('get_next_suborder_id', {
            order_number: orderNumber,
            item_index: i
          });

        if (suborderError) throw suborderError;

        // Create order item
        const { error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            suborder_id: suborderId,
            product_config_id: productConfig.id,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity,
            merchant_id: merchantId
          });

        if (itemError) throw itemError;
      }

      toast({
        title: 'Success',
        description: `Order ${orderNumber} created successfully`,
      });

      onOrderCreated();
      onClose();

    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create order',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return { submitOrder, loading };
};
