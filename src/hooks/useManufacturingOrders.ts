
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ManufacturingOrder {
  id: string;
  order_number: string;
  product_name: string;
  product_type?: string;
  product_config_id?: string;
  quantity_required: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'qc_failed' | 'cancelled';
  due_date?: string;
  special_instructions?: string;
  created_by?: string;
  merchant_id: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  product_configs?: {
    id: string;
    product_code: string;
    category: string;
    subcategory: string;
    product_config_materials?: Array<{
      id: string;
      raw_material_id: string;
      quantity_required: number;
      unit: string;
      raw_materials: {
        id: string;
        name: string;
        type: string;
        unit: string;
      };
    }>;
  };
}

export interface CreateManufacturingOrderData {
  product_name: string;
  product_type?: string;
  product_config_id?: string;
  quantity_required: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  special_instructions?: string;
}

export const useManufacturingOrders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: manufacturingOrders = [], isLoading, error, refetch } = useQuery({
    queryKey: ['manufacturing-orders'],
    queryFn: async () => {
      try {
        // First, get manufacturing orders
        const { data: orders, error: ordersError } = await supabase
          .from('manufacturing_orders' as any)
          .select('*')
          .order('created_at', { ascending: false });

        if (ordersError) {
          console.error('Error fetching manufacturing orders:', ordersError);
          throw ordersError;
        }

        if (!orders || orders.length === 0) {
          return [];
        }

        // Get unique product config IDs
        const productConfigIds = orders
          .map(order => order.product_config_id)
          .filter(id => id);

        let productConfigsMap: Record<string, any> = {};

        // Fetch product configs if we have any IDs
        if (productConfigIds.length > 0) {
          const { data: productConfigs, error: configsError } = await supabase
            .from('product_configs')
            .select(`
              id,
              product_code,
              category,
              subcategory,
              product_config_materials (
                id,
                raw_material_id,
                quantity_required,
                unit,
                raw_materials (
                  id,
                  name,
                  type,
                  unit
                )
              )
            `)
            .in('id', productConfigIds);

          if (!configsError && productConfigs) {
            productConfigsMap = productConfigs.reduce((acc, config) => {
              acc[config.id] = config;
              return acc;
            }, {} as Record<string, any>);
          }
        }

        // Combine orders with their product configs
        const ordersWithConfigs = orders.map(order => ({
          ...order,
          product_configs: order.product_config_id ? productConfigsMap[order.product_config_id] : null
        }));

        return ordersWithConfigs as ManufacturingOrder[];
      } catch (error) {
        console.error('Error in manufacturing orders query:', error);
        throw error;
      }
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CreateManufacturingOrderData) => {
      // Get next order number using raw RPC call
      const { data: orderNumber, error: orderNumberError } = await supabase.rpc(
        'get_next_manufacturing_order_number' as any
      );

      if (orderNumberError) throw orderNumberError;

      // Get merchant ID
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      // Create the manufacturing order
      const { data: order, error } = await supabase
        .from('manufacturing_orders' as any)
        .insert({
          ...orderData,
          order_number: orderNumber,
          merchant_id: merchantId,
          created_by: (await supabase.auth.getUser()).data.user?.id
        } as any)
        .select()
        .single();

      if (error) throw error;

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      toast({
        title: 'Success',
        description: 'Manufacturing order created successfully',
      });
    },
    onError: (error) => {
      console.error('Error creating manufacturing order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create manufacturing order',
        variant: 'destructive',
      });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ManufacturingOrder> }) => {
      const { data, error } = await supabase
        .from('manufacturing_orders' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      toast({
        title: 'Success',
        description: 'Manufacturing order updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating manufacturing order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update manufacturing order',
        variant: 'destructive',
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('manufacturing_orders' as any)
        .delete()
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      toast({
        title: 'Success',
        description: 'Manufacturing order deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Error deleting manufacturing order:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete manufacturing order',
        variant: 'destructive',
      });
    },
  });

  const createOrder = (orderData: CreateManufacturingOrderData) => {
    return createOrderMutation.mutate(orderData);
  };

  const updateOrder = (id: string, updates: Partial<ManufacturingOrder>) => {
    return updateOrderMutation.mutate({ id, updates });
  };

  const deleteOrder = (orderId: string) => {
    return deleteOrderMutation.mutate(orderId);
  };

  return {
    manufacturingOrders,
    isLoading,
    loading: isLoading,
    error,
    createOrder,
    updateOrder,
    deleteOrder,
    refetch,
    isCreating: createOrderMutation.isPending,
    isUpdating: updateOrderMutation.isPending,
    isDeleting: deleteOrderMutation.isPending,
  };
};
