
import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

export type ManufacturingOrderStatus = 'pending' | 'in_progress' | 'completed' | 'qc_failed' | 'cancelled' | 'tagged_in';

export type ManufacturingOrder = Database['public']['Tables']['manufacturing_orders']['Row'] & {
  product_configs?: Database['public']['Tables']['product_configs']['Row'] | null;
};

export const useManufacturingOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchManufacturingOrders = useCallback(async () => {
    if (!user) return [];

    const { data: merchantId, error: merchantError } = await supabase
      .rpc('get_user_merchant_id');

    if (merchantError || !merchantId) {
      console.error('Error fetching merchant ID:', merchantError);
      return [];
    }

    const { data, error } = await supabase
      .from('manufacturing_orders')
      .select(`
        *,
        product_configs(*)
      `)
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching manufacturing orders:', error);
      throw new Error('Could not fetch manufacturing orders');
    }

    return data as ManufacturingOrder[];
  }, [user]);

  const {
    data: manufacturingOrders = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['manufacturing-orders', user?.id],
    queryFn: fetchManufacturingOrders,
    enabled: !!user,
  });

  const invalidateManufacturingOrders = () => {
    queryClient.invalidateQueries({ queryKey: ['manufacturing-orders', user?.id] });
  };

  return { 
    manufacturingOrders, 
    isLoading, 
    error, 
    refetch, 
    invalidateManufacturingOrders 
  };
};
