
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
      console.log('Fetching manufacturing orders...');
      try {
        // First, get manufacturing orders
        const { data: orders, error: ordersError } = await supabase
          .from('manufacturing_orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (ordersError) {
          console.error('Error fetching manufacturing orders:', ordersError);
          throw ordersError;
        }

        console.log('Fetched orders:', orders?.length || 0);

        if (!orders || orders.length === 0) {
          return [];
        }

        // Type the orders properly
        const typedOrders = orders as Array<{
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
        }>;

        // Get unique product config IDs
        const productConfigIds = typedOrders
          .map(order => order.product_config_id)
          .filter((id): id is string => Boolean(id));

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
        const ordersWithConfigs: ManufacturingOrder[] = typedOrders.map(order => ({
          ...order,
          product_configs: order.product_config_id ? productConfigsMap[order.product_config_id] : undefined
        }));

        return ordersWithConfigs;
      } catch (error) {
        console.error('Error in manufacturing orders query:', error);
        throw error;
      }
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CreateManufacturingOrderData) => {
      console.log('🚀 Starting manufacturing order creation with data:', orderData);
      
      try {
        // Get merchant ID first
        console.log('📍 Getting merchant ID...');
        const { data: merchantId, error: merchantError } = await supabase
          .rpc('get_user_merchant_id');

        if (merchantError) {
          console.error('❌ Error getting merchant ID:', merchantError);
          throw new Error(`Failed to get merchant ID: ${merchantError.message}`);
        }

        console.log('✅ Merchant ID retrieved:', merchantId);

        // Get current user
        const { data: user, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('❌ Error getting user:', userError);
          throw new Error(`Failed to get user: ${userError.message}`);
        }

        console.log('✅ User retrieved:', user?.user?.id);
        
        // Get next order number
        console.log('🔢 Generating order number...');
        const { data: orderNumber, error: orderNumberError } = await supabase.rpc(
          'get_next_manufacturing_order_number'
        );

        if (orderNumberError) {
          console.error('❌ Error getting order number:', orderNumberError);
          throw new Error(`Failed to generate order number: ${orderNumberError.message}`);
        }

        console.log('✅ Generated order number:', orderNumber);

        // Create the manufacturing order
        const orderToInsert = {
          order_number: orderNumber,
          product_name: orderData.product_name,
          product_type: orderData.product_type || null,
          product_config_id: orderData.product_config_id || null,
          quantity_required: orderData.quantity_required,
          priority: orderData.priority,
          due_date: orderData.due_date || null,
          special_instructions: orderData.special_instructions || null,
          merchant_id: merchantId,
          created_by: user?.user?.id || null,
          status: 'pending' as const
        };

        console.log('💾 Inserting order:', orderToInsert);

        const { data: order, error: insertError } = await supabase
          .from('manufacturing_orders')
          .insert(orderToInsert)
          .select()
          .single();

        if (insertError) {
          console.error('❌ Error inserting manufacturing order:', insertError);
          throw new Error(`Failed to create order: ${insertError.message}`);
        }

        console.log('🎉 Order created successfully:', order);
        return order;
      } catch (error) {
        console.error('💥 Failed to create manufacturing order:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('✨ Order creation mutation successful:', data);
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      toast({
        title: 'Success',
        description: `Manufacturing order ${data.order_number} created successfully`,
      });
    },
    onError: (error: any) => {
      console.error('🚨 Order creation mutation failed:', error);
      
      let errorMessage = 'Failed to create manufacturing order';
      
      if (error.message?.includes('Unable to generate unique order number')) {
        errorMessage = 'Unable to generate unique order number. Please try again.';
      } else if (error.message?.includes('invalid input syntax for type uuid')) {
        errorMessage = 'Invalid product configuration selected. Please check your selection.';
      } else if (error.message?.includes('FOR UPDATE is not allowed')) {
        errorMessage = 'Database configuration issue. Please contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
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
        .from('manufacturing_orders')
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
