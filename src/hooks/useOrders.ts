
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface OrderItem {
  id: string;
  suborder_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: 'Created' | 'In Progress' | 'Ready' | 'Delivered';
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
  expected_delivery?: string;
  status: 'Created' | 'In Progress' | 'Ready' | 'Delivered';
  customer_id: string;
  customer: {
    id: string;
    name: string;
    phone?: string;
  };
  order_items: OrderItem[];
}

type OrderStatus = 'Created' | 'In Progress' | 'Ready' | 'Delivered';

// Helper function to normalize status from database
const normalizeStatus = (status: string): OrderStatus => {
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
      
      // Normalize the data to match our types
      const normalizedData = data?.map(order => ({
        ...order,
        status: normalizeStatus(order.status),
        order_items: order.order_items.map(item => ({
          ...item,
          status: normalizeStatus(item.status)
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
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: status, 
          updated_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });

      // Auto refresh related data
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

  const updateOrderItemStatus = async (itemId: string, status: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('order_items')
        .update({ 
          status: status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Order item status updated successfully',
      });

      // Auto refresh related data
      await fetchOrders();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['finished-goods'] });
    } catch (error) {
      console.error('Error updating order item status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order item status',
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
    updateOrderItemStatus 
  };
};
