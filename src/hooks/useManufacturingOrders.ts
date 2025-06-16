
import { useCallback, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

export type ManufacturingOrderStatus = 'pending' | 'in_progress' | 'completed' | 'qc_failed' | 'cancelled' | 'tagged_in';

export type ManufacturingOrder = Database['public']['Tables']['manufacturing_orders']['Row'] & {
  manufacturing_quantity?: number;
  product_configs?: (Database['public']['Tables']['product_configs']['Row'] & {
    product_config_materials?: (Database['public']['Tables']['product_config_materials']['Row'] & {
      raw_materials?: Database['public']['Tables']['raw_materials']['Row'];
    })[];
  }) | null;
};

export const useManufacturingOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

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
        product_configs(
          *,
          product_config_materials(
            *,
            raw_materials(*)
          )
        )
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

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: {
      product_name: string;
      product_type?: string;
      product_config_id: string;
      quantity_required: number;
      priority: 'low' | 'medium' | 'high' | 'urgent';
      due_date?: string;
      special_instructions?: string;
    }) => {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError || !merchantId) {
        throw new Error('Could not get merchant ID');
      }

      const { data: orderNumber, error: orderNumberError } = await supabase
        .rpc('get_next_manufacturing_order_number');

      if (orderNumberError || !orderNumber) {
        throw new Error('Could not generate order number');
      }

      const { data, error } = await supabase
        .from('manufacturing_orders')
        .insert({
          ...orderData,
          order_number: orderNumber,
          merchant_id: merchantId,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Manufacturing order created successfully!" });
      invalidateManufacturingOrders();
    },
    onError: (error) => {
      console.error('Error creating manufacturing order:', error);
      toast({ 
        title: "Error", 
        description: "Failed to create manufacturing order. Please try again.",
        variant: "destructive"
      });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, updates }: { 
      orderId: string; 
      updates: Partial<Pick<ManufacturingOrder, 'status' | 'priority' | 'due_date'>>
    }) => {
      const { data, error } = await supabase
        .from('manufacturing_orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateManufacturingOrders();
    },
    onError: (error) => {
      console.error('Error updating manufacturing order:', error);
      toast({ 
        title: "Error", 
        description: "Failed to update manufacturing order.",
        variant: "destructive"
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('manufacturing_orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Manufacturing order deleted successfully!" });
      invalidateManufacturingOrders();
    },
    onError: (error) => {
      console.error('Error deleting manufacturing order:', error);
      toast({ 
        title: "Error", 
        description: "Failed to delete manufacturing order.",
        variant: "destructive"
      });
    },
  });

  const createOrder = async (orderData: Parameters<typeof createOrderMutation.mutateAsync>[0]) => {
    setIsCreating(true);
    try {
      await createOrderMutation.mutateAsync(orderData);
    } finally {
      setIsCreating(false);
    }
  };

  const updateOrder = (orderId: string, updates: Partial<Pick<ManufacturingOrder, 'status' | 'priority' | 'due_date'>>) => {
    updateOrderMutation.mutate({ orderId, updates });
  };

  const deleteOrder = (orderId: string) => {
    deleteOrderMutation.mutate(orderId);
  };

  const invalidateManufacturingOrders = () => {
    queryClient.invalidateQueries({ queryKey: ['manufacturing-orders', user?.id] });
  };

  return { 
    manufacturingOrders, 
    isLoading,
    loading: isLoading, // Alias for backward compatibility
    error, 
    refetch, 
    invalidateManufacturingOrders,
    createOrder,
    isCreating,
    updateOrder,
    deleteOrder
  };
};
