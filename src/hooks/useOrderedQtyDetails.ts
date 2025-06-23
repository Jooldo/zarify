
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RawMaterialProductDetail {
  product_code: string;
  product_name: string;
  quantity_required: number;
  total_material_required: number;
  remaining_quantity: number;
}

export interface FinishedGoodOrderDetail {
  suborder_id: string;
  order_number: string;
  customer_name: string;
  quantity: number;
  fulfilled_quantity: number;
  remaining_quantity: number;
  status: string;
  order_date: string; // Changed from created_date to order_date
}

// Export the OrderDetail type that was missing
export type OrderDetail = FinishedGoodOrderDetail;

export const useOrderedQtyDetails = () => {
  const [loading, setLoading] = useState(false);

  const fetchFinishedGoodOrderDetails = async (productCode: string): Promise<FinishedGoodOrderDetail[]> => {
    setLoading(true);
    try {
      console.log('🔍 Fetching order details for finished good:', productCode);
      
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          suborder_id,
          quantity,
          fulfilled_quantity,
          status,
          orders!inner(
            order_number,
            created_date,
            customers!inner(name)
          ),
          product_configs!inner(product_code)
        `)
        .eq('product_configs.product_code', productCode)
        .in('status', ['Created', 'In Progress', 'Partially Fulfilled']);

      if (error) {
        console.error('Error fetching order details:', error);
        throw error;
      }

      const details = data?.map(item => ({
        suborder_id: item.suborder_id,
        order_number: item.orders.order_number,
        customer_name: item.orders.customers.name,
        quantity: item.quantity,
        fulfilled_quantity: item.fulfilled_quantity || 0,
        remaining_quantity: item.quantity - (item.fulfilled_quantity || 0),
        status: item.status,
        order_date: item.orders.created_date // Map created_date to order_date
      })) || [];

      console.log('📊 Order details found:', details.length);
      return details;
    } catch (error) {
      console.error('Error in fetchFinishedGoodOrderDetails:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchRawMaterialProductDetails = async (rawMaterialId: string): Promise<RawMaterialProductDetail[]> => {
    setLoading(true);
    try {
      console.log('🔍 Fetching product details for raw material based on finished goods shortfall:', rawMaterialId);
      
      // Get the merchant ID
      const { data: merchantId, error: merchantError } = await supabase.rpc('get_user_merchant_id');
      if (merchantError) throw merchantError;

      // Get finished goods that use this raw material with correct relationship
      const { data: finishedGoodsUsingMaterial, error: finishedGoodsError } = await supabase
        .from('product_config_materials')
        .select(`
          quantity_required,
          product_configs!inner(
            product_code,
            category,
            subcategory,
            finished_goods(
              current_stock,
              threshold,
              required_quantity
            )
          )
        `)
        .eq('raw_material_id', rawMaterialId)
        .eq('merchant_id', merchantId);

      if (finishedGoodsError) {
        console.error('Error fetching finished goods:', finishedGoodsError);
        throw finishedGoodsError;
      }

      const productDetails: RawMaterialProductDetail[] = [];

      finishedGoodsUsingMaterial?.forEach(item => {
        const productCode = item.product_configs.product_code;
        const finishedGoodsArray = item.product_configs.finished_goods;
        
        // Handle the case where finished_goods might be an array
        const finishedGood = Array.isArray(finishedGoodsArray) ? finishedGoodsArray[0] : finishedGoodsArray;
        
        if (!finishedGood) {
          console.log(`No finished good found for product code: ${productCode}`);
          return;
        }
        
        // Calculate shortfall without manufacturing considerations
        const liveOrderDemand = finishedGood.required_quantity || 0;
        
        console.log(`🔍 Finished good ${productCode}:`);
        console.log(`   Live order demand: ${liveOrderDemand}`);
        console.log(`   Current stock: ${finishedGood.current_stock}`);
        console.log(`   Threshold: ${finishedGood.threshold}`);
        
        const totalDemand = liveOrderDemand + finishedGood.threshold;
        const available = finishedGood.current_stock; // No manufacturing to add
        const shortfall = Math.max(0, totalDemand - available);

        console.log(`   Total demand: ${totalDemand}`);
        console.log(`   Available stock: ${available}`);
        console.log(`   Shortfall: ${shortfall}`);

        // Only include products that have a shortfall
        if (shortfall > 0) {
          const materialRequired = shortfall * item.quantity_required;
          console.log(`   Material required: ${materialRequired} (shortfall ${shortfall} × ${item.quantity_required})`);
          
          productDetails.push({
            product_code: productCode,
            product_name: `${item.product_configs.category} ${item.product_configs.subcategory}-${productCode.split('-').pop()}`,
            quantity_required: item.quantity_required,
            total_material_required: materialRequired,
            remaining_quantity: shortfall
          });
        } else {
          console.log(`   No shortfall - material not required for ${productCode}`);
        }
      });

      console.log('📊 Raw material product details based on shortfall:', productDetails);
      return productDetails;
    } catch (error) {
      console.error('Error in fetchRawMaterialProductDetails:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchFinishedGoodOrderDetails,
    fetchRawMaterialProductDetails
  };
};
