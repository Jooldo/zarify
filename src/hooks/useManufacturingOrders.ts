
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale for immediate updates
  });

  // Set up real-time subscriptions with immediate invalidation
  useManufacturingOrdersRealtime(() => {
    console.log('Real-time update received, invalidating and refetching manufacturing orders cache');
    queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
    queryClient.refetchQueries({ queryKey: ['manufacturing-orders'] });
  });

  const createOrder = async (data: CreateManufacturingOrderData) => {
    try {
      await createManufacturingOrder(data);

      toast({
        title: 'Success',
        description: 'Manufacturing order created successfully',
      });

      // Force immediate refetch
      await queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      await queryClient.refetchQueries({ queryKey: ['manufacturing-orders'] });
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

      // Force immediate refetch
      await queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      await queryClient.refetchQueries({ queryKey: ['manufacturing-orders'] });
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

      // Force immediate refetch
      await queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      await queryClient.refetchQueries({ queryKey: ['manufacturing-orders'] });
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
    isCreating: false,
    updateOrder,
    deleteOrder,
    refetch,
  };
};
