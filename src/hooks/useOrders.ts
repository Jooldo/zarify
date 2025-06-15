
import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

export type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items: OrderItem[];
  customers: Customer | null;
};

export type OrderItem = Database['public']['Tables']['order_items']['Row'] & {
  product_configs: ProductConfig | null;
  updated_at: string;
};

export type Customer = Database['public']['Tables']['customers']['Row'];
export type ProductConfig = Database['public']['Tables']['product_configs']['Row'];

export const useOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchOrders = useCallback(async () => {
    if (!user) return [];

    const { data: merchantData, error: merchantError } = await supabase
      .from('profiles')
      .select('merchant_id')
      .eq('id', user.id)
      .single();

    if (merchantError || !merchantData) {
      console.error('Error fetching merchant ID:', merchantError);
      return [];
    }
    const merchantId = merchantData.merchant_id;

    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_items(*, product_configs(*)),
        customers(*)
      `
      )
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Could not fetch orders');
    }

    return data as Order[];
  }, [user]);

  const {
    data: orders = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: fetchOrders,
    enabled: !!user,
  });

  const invalidateOrders = () => {
    queryClient.invalidateQueries({ queryKey: ['orders', user?.id] });
  };

  return { orders, loading, error, invalidateOrders };
};
