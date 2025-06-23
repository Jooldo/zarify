
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OrderedQtyDetail {
  id: string;
  order_number: string;
  product_name: string;
  quantity_required: number;
  status: string;
  created_at: string;
  due_date?: string;
}

export const useOrderedQtyDetails = (productCode: string) => {
  return useQuery({
    queryKey: ['ordered-qty-details', productCode],
    queryFn: async () => {
      if (!productCode) return [];

      console.log('Fetching ordered quantity details for:', productCode);

      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      // Fetch manufacturing orders directly without joins since relationships don't exist
      const { data: manufacturingOrders, error: manufacturingOrdersError } = await supabase
        .from('manufacturing_orders')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('product_name', productCode) // Use product_name instead of joining
        .in('status', ['pending', 'in_progress', 'completed']);

      if (manufacturingOrdersError) {
        console.error('Error fetching manufacturing orders:', manufacturingOrdersError);
        throw manufacturingOrdersError;
      }

      const orderedQtyDetails: OrderedQtyDetail[] = (manufacturingOrders || []).map(order => ({
        id: order.id,
        order_number: order.order_number,
        product_name: order.product_name,
        quantity_required: order.quantity_required,
        status: order.status,
        created_at: order.created_at,
        due_date: order.due_date,
      }));

      console.log('Ordered quantity details:', orderedQtyDetails);
      return orderedQtyDetails;
    },
    enabled: !!productCode,
    staleTime: 30000, // 30 seconds
  });
};
