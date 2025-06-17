
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivityLog } from '@/hooks/useActivityLog';

export type OrderStatus = 'Created' | 'In Progress' | 'Ready' | 'Delivered' | 'Partially Fulfilled';

export interface OrderItem {
  id: string;
  suborder_id: string;
  order_id: string;
  merchant_id: string;
  product_config_id: string;
  quantity: number;
  fulfilled_quantity: number;
  unit_price: number;
  total_price: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  product_configs?: {
    id: string;
    merchant_id: string;
    product_code: string;
    category: string;
    subcategory: string;
    size_value: number;
    weight_range: string | null;
    is_active: boolean;
    created_at: string;
  };
}

export interface ProductConfig {
  id: string;
  merchant_id: string;
  product_code: string;
  category: string;
  subcategory: string;
  size_value: number;
  weight_range: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  merchant_id: string;
  name: string;
  phone: string;
  address: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  total_amount: number;
  expected_delivery?: string | null;
  status?: OrderStatus;
  created_at: string;
  updated_at?: string;
  created_date: string;
  updated_date?: string;
  merchant_id: string;
  customers?: Customer;
  order_items: OrderItem[];
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { logActivity } = useActivityLog();

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) {
        console.error('Error getting merchant ID:', merchantError);
        setError(merchantError);
        throw merchantError;
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers(id, merchant_id, name, phone, address, created_at),
          order_items(
            *,
            product_configs(id, merchant_id, product_code, category, subcategory, size_value, weight_range, is_active, created_at)
          )
        `)
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        setError(error);
        throw error;
      }

      // Map the data to include backward compatibility fields
      const mappedData = (data || []).map(order => ({
        ...order,
        created_date: order.created_at?.split('T')[0] || order.created_at,
        updated_date: order.updated_at?.split('T')[0] || order.updated_at
      }));

      setOrders(mappedData);
    } catch (err) {
      const typedError = err as Error;
      console.error('Error fetching orders:', typedError);
      setError(typedError);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const createOrder = async (orderData: {
    customer_id: string;
    expected_delivery?: string;
    items: Array<{
      product_config_id: string;
      quantity: number;
      unit_price: number;
    }>;
  }) => {
    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) {
        console.error('Error getting merchant ID:', merchantError);
        throw merchantError;
      }

      const { data: orderNumber, error: orderNumberError } = await supabase
        .rpc('get_next_order_number');

      if (orderNumberError) {
        console.error('Error getting order number:', orderNumberError);
        throw orderNumberError;
      }

      if (!orderNumber) {
        throw new Error('Could not generate order number');
      }

      let totalAmount = 0;
      orderData.items.forEach(item => {
        totalAmount += item.quantity * item.unit_price;
      });

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_id: orderData.customer_id,
          expected_delivery: orderData.expected_delivery,
          total_amount: totalAmount,
          merchant_id: merchantId,
        })
        .select(`
          *,
          customers(id, merchant_id, name, phone, address, created_at)
        `)
        .single();

      if (orderError) throw orderError;

      const orderId = order?.id;

      const orderItems = orderData.items.map(item => ({
        order_id: orderId,
        product_config_id: item.product_config_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        merchant_id: merchantId,
        suborder_id: `${orderNumber}-${item.product_config_id}`
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Log the order creation
      console.log('Logging order creation activity...');
      await logActivity(
        'Created',
        'Order',
        orderNumber,
        `Created order ${orderNumber} for ${order?.customers?.name || 'Unknown Customer'} with total amount ₹${totalAmount.toFixed(2)}`
      );

      toast({
        title: 'Success',
        description: `Order ${orderNumber} created successfully!`,
      });

      await fetchOrders();
      return order;
    } catch (err) {
      const typedError = err as Error;
      console.error('Error creating order:', typedError);
      toast({
        title: 'Error',
        description: 'Failed to create order',
        variant: 'destructive',
      });
      throw typedError;
    }
  };

  const updateOrderItemStatus = async (itemId: string, status: OrderStatus) => {
    try {
      // Get current item details for logging
      const { data: currentItem } = await supabase
        .from('order_items')
        .select(`
          *,
          orders(order_number),
          product_configs(product_code)
        `)
        .eq('id', itemId)
        .single();

      const { error } = await supabase
        .from('order_items')
        .update({ status })
        .eq('id', itemId);

      if (error) throw error;

      // Log the status update
      console.log('Logging order item status update activity...');
      if (currentItem) {
        await logActivity(
          'Status Updated',
          'Order Item',
          currentItem.orders?.order_number || currentItem.order_id,
          `Order ${currentItem.orders?.order_number || ''} item ${currentItem.product_configs?.product_code || ''} status changed from ${currentItem.status} to ${status}`
        );
      }

      toast({
        title: 'Success',
        description: 'Order item status updated successfully!',
      });

      await fetchOrders();
    } catch (err) {
      const typedError = err as Error;
      console.error('Error updating order item status:', typedError);
      toast({
        title: 'Error',
        description: 'Failed to update order item status',
        variant: 'destructive',
      });
      throw typedError;
    }
  };

  const updateOrderItemDetails = async (itemId: string, updates: { status?: OrderStatus; fulfilled_quantity?: number }) => {
    try {
      // Get current item details for logging
      const { data: currentItem } = await supabase
        .from('order_items')
        .select(`
          *,
          orders(order_number),
          product_configs(product_code)
        `)
        .eq('id', itemId)
        .single();

      const { error } = await supabase
        .from('order_items')
        .update(updates)
        .eq('id', itemId);

      if (error) throw error;

      // Log the status update if status changed
      if (currentItem && updates.status && currentItem.status !== updates.status) {
        console.log('Logging order item status change activity...');
        await logActivity(
          'Status Updated',
          'Order Item',
          currentItem.orders?.order_number || currentItem.order_id,
          `Order ${currentItem.orders?.order_number || ''} item ${currentItem.product_configs?.product_code || ''} status changed from ${currentItem.status} to ${updates.status}`
        );
      }

      // Log fulfilled quantity update if changed
      if (currentItem && updates.fulfilled_quantity !== undefined && currentItem.fulfilled_quantity !== updates.fulfilled_quantity) {
        console.log('Logging order item fulfilled quantity update activity...');
        await logActivity(
          'Updated',
          'Order Item',
          currentItem.orders?.order_number || currentItem.order_id,
          `Order ${currentItem.orders?.order_number || ''} item ${currentItem.product_configs?.product_code || ''} fulfilled quantity updated from ${currentItem.fulfilled_quantity} to ${updates.fulfilled_quantity}`
        );
      }

      toast({
        title: 'Success',
        description: 'Order item updated successfully!',
      });

      await fetchOrders();
    } catch (err) {
      const typedError = err as Error;
      console.error('Error updating order item:', typedError);
      toast({
        title: 'Error',
        description: 'Failed to update order item',
        variant: 'destructive',
      });
      throw typedError;
    }
  };

  const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    try {
      // Get current order details for logging
      const { data: currentOrder } = await supabase
        .from('orders')
        .select('order_number, status, total_amount, expected_delivery')
        .eq('id', orderId)
        .single();

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;

      // Log the update
      if (currentOrder) {
        const changes = Object.entries(updates)
          .map(([key, value]) => {
            if (key === 'status' && currentOrder.status !== value) {
              return `status: ${currentOrder.status} → ${value}`;
            }
            if (key === 'total_amount' && currentOrder.total_amount !== value) {
              return `total amount: ₹${currentOrder.total_amount} → ₹${value}`;
            }
            if (key === 'expected_delivery' && currentOrder.expected_delivery !== value) {
              return `expected delivery: ${currentOrder.expected_delivery || 'none'} → ${value || 'none'}`;
            }
            return `${key}: ${value}`;
          })
          .join(', ');
        
        console.log('Logging order update activity...');
        await logActivity(
          'Updated',
          'Order',
          currentOrder.order_number,
          `Order ${currentOrder.order_number} updated: ${changes}`
        );
        
        // If status was updated, log it specifically
        if (updates.status && currentOrder.status !== updates.status) {
          console.log('Logging order status change activity...');
          await logActivity(
            'Status Updated',
            'Order',
            currentOrder.order_number,
            `Order ${currentOrder.order_number} status changed from ${currentOrder.status} to ${updates.status}`
          );
        }
      }

      toast({
        title: 'Success',
        description: 'Order updated successfully!',
      });

      await fetchOrders();
    } catch (err) {
      const typedError = err as Error;
      console.error('Error updating order:', typedError);
      toast({
        title: 'Error',
        description: 'Failed to update order',
        variant: 'destructive',
      });
      throw typedError;
    }
  };

  return { 
    orders, 
    loading, 
    error, 
    fetchOrders, 
    refetch: fetchOrders,
    createOrder, 
    updateOrderItemStatus, 
    updateOrderItemDetails,
    updateOrder 
  };
};
