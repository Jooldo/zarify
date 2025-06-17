
import { useCallback, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { useActivityLog } from '@/hooks/useActivityLog';

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
  const { logActivity } = useActivityLog();
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
    onSuccess: async (data) => {
      toast({ title: "Success", description: "Manufacturing order created successfully!" });
      
      // Log the activity
      await logActivity(
        'Created',
        'Manufacturing Order',
        data.id,
        `Created manufacturing order ${data.order_number} for ${data.quantity_required} units of ${data.product_name}`
      );
      
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
    onSuccess: async (data, variables) => {
      // Log the activity
      if (variables.updates.status) {
        await logActivity(
          'Status Updated',
          'Manufacturing Order',
          data.id,
          `Manufacturing order ${data.order_number} status changed to ${variables.updates.status}`
        );
      }
      
      if (variables.updates.priority) {
        await logActivity(
          'Priority Updated',
          'Manufacturing Order',
          data.id,
          `Manufacturing order ${data.order_number} priority changed to ${variables.updates.priority}`
        );
      }
      
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
      // Get order details before deletion for logging
      const { data: orderData } = await supabase
        .from('manufacturing_orders')
        .select('order_number, product_name')
        .eq('id', orderId)
        .single();

      const { error } = await supabase
        .from('manufacturing_orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      return orderData;
    },
    onSuccess: async (orderData) => {
      toast({ title: "Success", description: "Manufacturing order deleted successfully!" });
      
      // Log the activity
      if (orderData) {
        await logActivity(
          'Deleted',
          'Manufacturing Order',
          undefined,
          `Deleted manufacturing order ${orderData.order_number} for ${orderData.product_name}`
        );
      }
      
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
