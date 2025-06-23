
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

export interface OrderDetail {
  id: string;
  order_number: string;
  customer_name: string;
  order_date: string;
  quantity: number;
  fulfilled_quantity: number;
  remaining_quantity: number;
  status: string;
  suborder_id: string;
}

export interface RawMaterialProductDetail {
  product_code: string;
  product_name: string;
  quantity_required: number;
  remaining_quantity: number;
  total_material_required: number;
}

export const useOrderedQtyDetails = (productCode?: string) => {
  const query = useQuery({
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

  const fetchFinishedGoodOrderDetails = async (productCode: string): Promise<OrderDetail[]> => {
    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      // Get all order items with remaining quantities for this product
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          orders!inner(
            order_number,
            created_date,
            customer_id
          ),
          product_configs!inner(
            product_code
          )
        `)
        .eq('merchant_id', merchantId)
        .eq('product_configs.product_code', productCode)
        .in('status', ['Created', 'In Progress', 'Partially Fulfilled']);

      if (orderItemsError) {
        console.error('Error fetching order items:', orderItemsError);
        return [];
      }

      // Get customer details
      const customerIds = [...new Set(orderItems?.map(item => item.orders?.customer_id).filter(Boolean))];
      const { data: customers } = await supabase
        .from('customers')
        .select('id, name')
        .in('id', customerIds);

      const customerMap = customers?.reduce((acc, customer) => {
        acc[customer.id] = customer.name;
        return acc;
      }, {} as Record<string, string>) || {};

      const orderDetails: OrderDetail[] = orderItems?.map(item => {
        const remainingQuantity = item.quantity - (item.fulfilled_quantity || 0);
        return {
          id: item.id,
          order_number: item.orders?.order_number || '',
          customer_name: customerMap[item.orders?.customer_id] || 'Unknown',
          order_date: item.orders?.created_date || '',
          quantity: item.quantity,
          fulfilled_quantity: item.fulfilled_quantity || 0,
          remaining_quantity: remainingQuantity,
          status: item.status,
          suborder_id: item.suborder_id,
        };
      }).filter(detail => detail.remaining_quantity > 0) || [];

      return orderDetails;
    } catch (error) {
      console.error('Error fetching finished good order details:', error);
      return [];
    }
  };

  const fetchRawMaterialProductDetails = async (materialId: string): Promise<RawMaterialProductDetail[]> => {
    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      // Get product configs that use this material
      const { data: productConfigMaterials, error: pcmError } = await supabase
        .from('product_config_materials')
        .select(`
          product_config_id,
          quantity_required,
          product_configs!inner(
            product_code,
            category,
            subcategory
          )
        `)
        .eq('merchant_id', merchantId)
        .eq('raw_material_id', materialId);

      if (pcmError) {
        console.error('Error fetching product config materials:', pcmError);
        return [];
      }

      // Get finished goods with their requirements
      const { data: finishedGoods, error: fgError } = await supabase
        .from('finished_goods')
        .select('*')
        .eq('merchant_id', merchantId)
        .gt('required_quantity', 0);

      if (fgError) {
        console.error('Error fetching finished goods:', fgError);
        return [];
      }

      const productDetails: RawMaterialProductDetail[] = [];

      productConfigMaterials?.forEach(pcm => {
        const finishedGood = finishedGoods?.find(fg => fg.product_config_id === pcm.product_config_id);
        if (finishedGood && finishedGood.required_quantity > 0) {
          const totalMaterialRequired = finishedGood.required_quantity * pcm.quantity_required;
          
          productDetails.push({
            product_code: pcm.product_configs?.product_code || '',
            product_name: `${pcm.product_configs?.category} ${pcm.product_configs?.subcategory}`,
            quantity_required: pcm.quantity_required,
            remaining_quantity: finishedGood.required_quantity,
            total_material_required: totalMaterialRequired,
          });
        }
      });

      return productDetails;
    } catch (error) {
      console.error('Error fetching raw material product details:', error);
      return [];
    }
  };

  return {
    ...query,
    loading: query.isLoading,
    fetchFinishedGoodOrderDetails,
    fetchRawMaterialProductDetails,
  };
};
