
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
      // Use raw SQL query since types aren't generated yet
      const { data, error } = await supabase
        .from('manufacturing_orders' as any)
        .select(`
          *,
          product_configs (
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
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching manufacturing orders:', error);
        throw error;
      }

      return data as ManufacturingOrder[];
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
