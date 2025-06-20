
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ManufacturingOrder, CreateManufacturingOrderData } from '@/types/manufacturingOrders';
import { 
  fetchManufacturingOrders, 
  createManufacturingOrder, 
  updateManufacturingOrder, 
  deleteManufacturingOrder 
} from '@/services/manufacturingOrderService';
import { useManufacturingOrdersRealtime } from './useManufacturingOrdersRealtime';

export { ManufacturingOrder, CreateManufacturingOrderData } from '@/types/manufacturingOrders';

export const useManufacturingOrders = () => {
  const [manufacturingOrders, setManufacturingOrders] = useState<ManufacturingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const orders = await fetchManufacturingOrders();
      setManufacturingOrders(orders);
    } catch (error) {
      console.error('Error fetching manufacturing orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch manufacturing orders',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Set up real-time subscriptions
  useManufacturingOrdersRealtime(fetchOrders);

  const createOrder = async (data: CreateManufacturingOrderData) => {
    try {
      setIsCreating(true);
      await createManufacturingOrder(data);

      toast({
        title: 'Success',
        description: 'Manufacturing order created successfully',
      });

      await fetchOrders();
    } catch (error: any) {
      console.error('Error in createOrder:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create manufacturing order',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateOrder = async (orderId: string, updates: Partial<ManufacturingOrder>) => {
    try {
      await updateManufacturingOrder(orderId, updates);

      toast({
        title: 'Success',
        description: 'Manufacturing order updated successfully',
      });

      await fetchOrders();
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

      await fetchOrders();
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

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    manufacturingOrders,
    isLoading,
    createOrder,
    isCreating,
    updateOrder,
    deleteOrder,
    refetch: fetchOrders,
  };
};
