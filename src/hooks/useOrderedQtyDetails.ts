
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface OrderDetail {
  order_number: string;
  customer_name: string;
  order_date: string;
  quantity: number;
  fulfilled_quantity: number;
  remaining_quantity: number;
  status: string;
  suborder_id: string;
}

export const useOrderedQtyDetails = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchFinishedGoodOrderDetails = async (productCode: string): Promise<OrderDetail[]> => {
    setLoading(true);
    try {
      console.log('🔍 Fetching order details for product:', productCode);
      
      // Get the merchant ID
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) {
        console.error('Error getting merchant ID:', merchantError);
        throw merchantError;
      }

      // First, get the product config ID for this product code
      const { data: finishedGood, error: fgError } = await supabase
        .from('finished_goods')
        .select('product_config_id')
        .eq('merchant_id', merchantId)
        .eq('product_code', productCode)
        .single();

      if (fgError) {
        console.error('Error fetching finished good:', fgError);
        throw fgError;
      }

      console.log('🔍 Product config ID for', productCode, ':', finishedGood.product_config_id);

      // Fetch order items for this product config with remaining quantities
      // Include all statuses but filter for items with remaining quantity > 0
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select(`
          suborder_id,
          quantity,
          fulfilled_quantity,
          status,
          order_id,
          orders!inner(
            order_number,
            created_date,
            customers!inner(name)
          )
        `)
        .eq('merchant_id', merchantId)
        .eq('product_config_id', finishedGood.product_config_id);

      if (orderItemsError) {
        console.error('Error fetching order items:', orderItemsError);
        throw orderItemsError;
      }

      console.log('📊 All order items found for', productCode, ':', orderItems?.length || 0);

      // Filter and transform the data to show only items with remaining quantities
      const orderDetails: OrderDetail[] = orderItems
        ?.map(item => {
          const remainingQuantity = item.quantity - (item.fulfilled_quantity || 0);
          return {
            order_number: item.orders.order_number,
            customer_name: item.orders.customers.name,
            order_date: item.orders.created_date,
            quantity: item.quantity,
            fulfilled_quantity: item.fulfilled_quantity || 0,
            remaining_quantity: remainingQuantity,
            status: item.status,
            suborder_id: item.suborder_id
          };
        })
        .filter(detail => detail.remaining_quantity > 0) // Only show items with remaining quantities
        .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime()) || [];

      console.log('📊 Order details with remaining quantities:', orderDetails);
      console.log('🔍 Total remaining quantity:', orderDetails.reduce((sum, detail) => sum + detail.remaining_quantity, 0));

      return orderDetails;
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch order details',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { loading, fetchFinishedGoodOrderDetails };
};
