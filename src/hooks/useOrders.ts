
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface OrderItem {
  id: string;
  suborder_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: 'Created' | 'In Progress' | 'Ready' | 'Delivered';
  product_config: {
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
  customer: {
    name: string;
    phone?: string;
  };
  order_items: OrderItem[];
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(name, phone),
          order_items(
            *,
            product_config:product_configs(product_code, category, subcategory, size_value, weight_range)
          )
        `)
        .order('created_date', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
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

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, refetch: fetchOrders };
};
