
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

export interface RawMaterialProductDetail {
  product_code: string;
  product_name: string;
  quantity_required: number;
  total_material_required: number;
  remaining_quantity: number;
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

      // Fetch ALL order items for this product config (not filtered by status)
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

  const fetchRawMaterialProductDetails = async (materialId: string): Promise<RawMaterialProductDetail[]> => {
    setLoading(true);
    try {
      console.log('🔍 Fetching product details for raw material based on finished goods shortfall:', materialId);
      
      // Get the merchant ID
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) {
        console.error('Error getting merchant ID:', merchantError);
        throw merchantError;
      }

      // Get all product configs that use this raw material
      const { data: productConfigMaterials, error: pcmError } = await supabase
        .from('product_config_materials')
        .select(`
          product_config_id,
          quantity_required,
          product_configs!inner(
            product_code,
            category,
            subcategory,
            size_value,
            weight_range
          )
        `)
        .eq('merchant_id', merchantId)
        .eq('raw_material_id', materialId);

      if (pcmError) {
        console.error('Error fetching product config materials:', pcmError);
        throw pcmError;
      }

      // Get finished goods with their stock information for these product configs
      const productConfigIds = productConfigMaterials?.map(pcm => pcm.product_config_id) || [];
      
      if (productConfigIds.length === 0) {
        return [];
      }

      const { data: finishedGoods, error: fgError } = await supabase
        .from('finished_goods')
        .select('product_config_id, required_quantity, current_stock, in_manufacturing, threshold, product_code')
        .eq('merchant_id', merchantId)
        .in('product_config_id', productConfigIds);

      if (fgError) {
        console.error('Error fetching finished goods:', fgError);
        throw fgError;
      }

      // Calculate material requirements based on finished goods shortfall
      const productDetails: RawMaterialProductDetail[] = productConfigMaterials?.map(pcm => {
        const finishedGood = finishedGoods?.find(fg => fg.product_config_id === pcm.product_config_id);
        
        if (!finishedGood) {
          return null;
        }

        // Calculate shortfall for this finished good
        const liveOrderDemand = finishedGood.required_quantity || 0;
        const totalDemand = liveOrderDemand + finishedGood.threshold;
        const available = finishedGood.current_stock + finishedGood.in_manufacturing;
        const shortfall = Math.max(0, totalDemand - available);

        console.log(`🔍 Finished good ${finishedGood.product_code}:`);
        console.log(`   Live order demand: ${liveOrderDemand}`);
        console.log(`   Threshold: ${finishedGood.threshold}`);
        console.log(`   Total demand: ${totalDemand}`);
        console.log(`   Available (stock + manufacturing): ${available}`);
        console.log(`   Shortfall: ${shortfall}`);

        if (shortfall <= 0) {
          return null; // No material needed if no shortfall
        }

        const materialRequired = shortfall * pcm.quantity_required;
        const productName = `${pcm.product_configs.category}-${pcm.product_configs.subcategory}-${pcm.product_configs.size_value}${pcm.product_configs.weight_range ? `-${pcm.product_configs.weight_range}` : ''}`;
        
        console.log(`   Material required: ${materialRequired} (shortfall ${shortfall} × ${pcm.quantity_required})`);

        return {
          product_code: pcm.product_configs.product_code,
          product_name: productName,
          quantity_required: pcm.quantity_required,
          total_material_required: materialRequired,
          remaining_quantity: shortfall
        };
      }).filter(detail => detail !== null) || [];

      console.log('📊 Raw material product details based on shortfall:', productDetails);
      
      return productDetails;
    } catch (error) {
      console.error('Error fetching raw material product details:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch product details',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { loading, fetchFinishedGoodOrderDetails, fetchRawMaterialProductDetails };
};
