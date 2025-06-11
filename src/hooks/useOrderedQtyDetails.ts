
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductDetail {
  product_code: string;
  product_name: string;
  required_quantity: number;
  current_stock: number;
  in_manufacturing: number;
  threshold: number;
  shortfall: number;
  material_quantity_per_unit: number;
  total_material_required: number;
}

interface OrderDetail {
  order_number: string;
  customer_name: string;
  quantity: number;
  status: string;
  suborder_id: string;
  created_date: string;
}

export const useOrderedQtyDetails = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchFinishedGoodOrderDetails = async (productCode: string): Promise<OrderDetail[]> => {
    try {
      setLoading(true);
      
      // Get the product config ID for this product code
      const { data: productConfig, error: configError } = await supabase
        .from('product_configs')
        .select('id')
        .eq('product_code', productCode)
        .single();

      if (configError) throw configError;

      // Fetch order items with pending status for this product
      const { data: orderItems, error: orderError } = await supabase
        .from('order_items')
        .select(`
          quantity,
          status,
          suborder_id,
          order:orders(
            order_number,
            created_date,
            customer:customers(name)
          )
        `)
        .eq('product_config_id', productConfig.id)
        .in('status', ['Created', 'In Progress']);

      if (orderError) throw orderError;

      return orderItems?.map(item => ({
        order_number: item.order.order_number,
        customer_name: item.order.customer.name,
        quantity: item.quantity,
        status: item.status,
        suborder_id: item.suborder_id,
        created_date: item.order.created_date
      })) || [];

    } catch (error) {
      console.error('Error fetching finished good order details:', error);
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

  const fetchRawMaterialProductDetails = async (materialId: string): Promise<ProductDetail[]> => {
    try {
      setLoading(true);

      // Find product configs that use this raw material with their finished goods data
      const { data: productConfigMaterials, error: pcmError } = await supabase
        .from('product_config_materials')
        .select(`
          product_config_id,
          quantity_required,
          product_config:product_configs!inner(
            product_code,
            category,
            subcategory,
            threshold,
            finished_good:finished_goods(
              current_stock,
              in_manufacturing,
              required_quantity
            )
          )
        `)
        .eq('raw_material_id', materialId);

      if (pcmError) throw pcmError;

      if (!productConfigMaterials?.length) return [];

      const productDetails: ProductDetail[] = productConfigMaterials.map(pcm => {
        const fg = pcm.product_config.finished_good[0];
        const currentStock = fg?.current_stock || 0;
        const inManufacturing = fg?.in_manufacturing || 0;
        const requiredQuantity = fg?.required_quantity || 0;
        const threshold = pcm.product_config.threshold || 0;
        
        // Calculate shortfall: (Required Qty + Threshold) - (Current Stock + In Manufacturing)
        const totalAvailable = currentStock + inManufacturing;
        const totalNeeded = requiredQuantity + threshold;
        const shortfall = Math.max(0, totalNeeded - totalAvailable);
        
        // Calculate total material required based on shortfall
        const totalMaterialRequired = shortfall > 0 ? shortfall * pcm.quantity_required : 0;

        return {
          product_code: pcm.product_config.product_code,
          product_name: `${pcm.product_config.category} - ${pcm.product_config.subcategory}`,
          required_quantity: requiredQuantity,
          current_stock: currentStock,
          in_manufacturing: inManufacturing,
          threshold: threshold,
          shortfall: shortfall,
          material_quantity_per_unit: pcm.quantity_required,
          total_material_required: totalMaterialRequired
        };
      });

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

  return {
    loading,
    fetchFinishedGoodOrderDetails,
    fetchRawMaterialProductDetails
  };
};
