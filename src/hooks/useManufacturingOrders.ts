
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ManufacturingOrder, CreateManufacturingOrderData } from '@/types/manufacturingOrders';
import { 
  fetchManufacturingOrders, 
  createManufacturingOrder, 
  updateManufacturingOrder, 
  deleteManufacturingOrder 
} from '@/services/manufacturingOrderService';
import { useManufacturingOrdersRealtime } from './useManufacturingOrdersRealtime';

export type { ManufacturingOrder, CreateManufacturingOrderData } from '@/types/manufacturingOrders';

export const useManufacturingOrders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use React Query for data fetching with proper caching and invalidation
  const { data: manufacturingOrders = [], isLoading, refetch } = useQuery<ManufacturingOrder[]>({
    queryKey: ['manufacturing-orders'],
    queryFn: async () => {
      try {
        return await fetchManufacturingOrders();
      } catch (error) {
        console.error('Error fetching manufacturing orders:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch manufacturing orders',
          variant: 'destructive',
        });
        throw error;
      }
    },
  });

  // Set up real-time subscriptions with proper invalidation
  useManufacturingOrdersRealtime(() => {
    console.log('Real-time update received, invalidating manufacturing orders cache');
    queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
  });

  const createOrder = async (data: CreateManufacturingOrderData) => {
    try {
      await createManufacturingOrder(data);

      toast({
        title: 'Success',
        description: 'Manufacturing order created successfully',
      });

      // Invalidate and refetch the orders
      await queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
    } catch (error: any) {
      console.error('Error in createOrder:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create manufacturing order',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateOrder = async (orderId: string, updates: Partial<ManufacturingOrder>) => {
    try {
      await updateManufacturingOrder(orderId, updates);

      toast({
        title: 'Success',
        description: 'Manufacturing order updated successfully',
      });

      // Invalidate and refetch the orders
      await queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
    } catch (error: any) {
      console.error('Error updating manufacturing order:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update manufacturing order',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await deleteManufacturingOrder(orderId);

      toast({
        title: 'Success',
        description: 'Manufacturing order deleted successfully',
      });

      // Invalidate and refetch the orders
      await queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
    } catch (error: any) {
      console.error('Error deleting manufacturing order:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete manufacturing order',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    manufacturingOrders,
    isLoading,
    createOrder,
    isCreating: false, // We can add a separate mutation state if needed
    updateOrder,
    deleteOrder,
    refetch,
  };
};
