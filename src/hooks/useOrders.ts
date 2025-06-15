import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type OrderStatus = 'Created' | 'Progress' | 'Ready' | 'Delivered' | 'Partially Fulfilled';

export interface OrderItem {
  id: string;
  suborder_id: string;
  quantity: number;
  fulfilled_quantity: number; // Added field
  unit_price: number;
  total_price: number;
  status: OrderStatus; // Updated type
  updated_at: string;
  product_config_id: string;
  product_config: {
    id: string;
    product_code: string;
    category: string;
    subcategory: string;
    size_value: number;
    weight_range: string | null;
  };
}

export interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  created_date: string;
  updated_date: string;
  updated_at: string;
  expected_delivery?: string;
  status: OrderStatus; // Updated type
  customer_id: string;
  customer: {
    id: string;
    name: string;
    phone?: string;
  };
  order_items: OrderItem[];
}

// Helper function to normalize status from database
const normalizeStatus = (status: string): OrderStatus => {
  if (status === 'In Progress') return 'Progress';
  // Ensure 'Partially Fulfilled' and other statuses are correctly typed
  return status as OrderStatus;
};

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(id, name, phone),
          order_items(
            *,
            product_config:product_configs(id, product_code, category, subcategory, size_value, weight_range)
          )
        `)
        .order('created_date', { ascending: false });

      if (error) throw error;
      
      const normalizedData = data?.map(order => ({
        ...order,
        status: normalizeStatus(order.status),
        order_items: order.order_items.map(item => ({
          ...item,
          status: normalizeStatus(item.status),
          fulfilled_quantity: item.fulfilled_quantity || 0, // Ensure default if null from DB
        }))
      })) || [];
      
      setOrders(normalizedData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const dbStatus = status === 'Progress' ? 'In Progress' : status;
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: dbStatus, 
          updated_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });

      await fetchOrders();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['finished-goods'] });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Renamed from updateOrderItemStatus to updateOrderItemDetails for clarity
  const updateOrderItemDetails = async (itemId: string, updates: { status?: OrderStatus; fulfilled_quantity?: number }) => {
    try {
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.status) {
        payload.status = updates.status === 'Progress' ? 'In Progress' : updates.status;
      }
      if (updates.fulfilled_quantity !== undefined) {
        payload.fulfilled_quantity = updates.fulfilled_quantity;
      }
      
      const { error } = await supabase
        .from('order_items')
        .update(payload)
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Order item details updated successfully',
      });

      await fetchOrders();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['finished-goods'] });
    } catch (error) {
      console.error('Error updating order item details:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order item details',
        variant: 'destructive',
      });
      throw error;
    }
  };


  useEffect(() => {
    fetchOrders();
  }, []);

  return { 
    orders, 
    loading, 
    refetch: fetchOrders, 
    updateOrderStatus, 
    updateOrderItemDetails // Changed export name
  };
};
