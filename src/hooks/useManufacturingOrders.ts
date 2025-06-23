
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ManufacturingOrder {
  id: string;
  order_number: string;
  merchant_id: string;
  product_name: string;
  quantity_required: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold' | 'tagged_in';
  due_date?: string;
  special_instructions?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  product_config_id?: string;
  product_configs?: {
    product_code: string;
    category: string;
    subcategory: string;
    size_value: number;
    weight_range?: string;
    product_config_materials?: Array<{
      id: string;
      quantity_required: number;
      unit: string;
      raw_material_id: string;
      raw_materials?: {
        id: string;
        name: string;
        current_stock: number;
        unit: string;
      };
    }>;
  };
}

export interface CreateManufacturingOrderData {
  product_name: string;
  product_config_id: string;
  quantity_required: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  special_instructions?: string;
}

export const useManufacturingOrders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    data: manufacturingOrders = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery<ManufacturingOrder[]>({
    queryKey: ['manufacturing-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturing_orders')
        .select(`
          *,
          product_configs (
            product_code,
            category,
            subcategory,
            size_value,
            weight_range,
            product_config_materials (
              id,
              quantity_required,
              unit,
              raw_material_id,
              raw_materials (
                id,
                name,
                current_stock,
                unit
              )
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ManufacturingOrder[];
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CreateManufacturingOrderData) => {
      const { data: orderNumber, error: orderNumberError } = await supabase
        .rpc('get_next_manufacturing_order_number');

      if (orderNumberError) throw orderNumberError;

      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      const { data, error } = await supabase
        .from('manufacturing_orders')
        .insert({
          order_number: orderNumber,
          merchant_id: merchantId,
          product_name: orderData.product_name,
          product_config_id: orderData.product_config_id,
          quantity_required: orderData.quantity_required,
          priority: orderData.priority,
          due_date: orderData.due_date,
          special_instructions: orderData.special_instructions,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Manufacturing order created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create manufacturing order',
        variant: 'destructive',
      });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ManufacturingOrder> }) => {
      const { data, error } = await supabase
        .from('manufacturing_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Manufacturing order updated successfully',
      });
      queryClient.invalidateQueries({
        queryKey: ['manufacturing-orders']
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update manufacturing order',
        variant: 'destructive',
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
      toast({
        title: 'Success',
        description: 'Manufacturing order deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete manufacturing order',
        variant: 'destructive',
      });
    },
  });

  return {
    manufacturingOrders,
    isLoading,
    error,
    refetch,
    createOrder: createOrderMutation.mutate,
    updateOrder: (id: string, updates: Partial<ManufacturingOrder>) => 
      updateOrderMutation.mutate({ id, updates }),
    deleteOrder: deleteOrderMutation.mutate,
    isCreating: createOrderMutation.isPending,
    isUpdating: updateOrderMutation.isPending,
    isDeleting: deleteOrderMutation.isPending,
    // Legacy names for backward compatibility
    isCreatingOrder: createOrderMutation.isPending,
    isUpdatingOrder: updateOrderMutation.isPending,
    isDeletingOrder: deleteOrderMutation.isPending,
  };
};
