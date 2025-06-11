
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OrderDetail {
  order_number: string;
  customer_name: string;
  quantity: number;
  status: string;
  suborder_id: string;
  created_date: string;
}

interface ProductDetail {
  product_code: string;
  product_shortfall: number;
  material_quantity_per_unit: number;
  total_material_needed: number;
  current_stock: number;
  in_manufacturing: number;
  required_quantity: number;
  threshold: number;
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

  const fetchRawMaterialOrderDetails = async (materialId: string): Promise<OrderDetail[]> => {
    try {
      setLoading(true);

      // Find product configs that use this raw material
      const { data: productConfigMaterials, error: pcmError } = await supabase
        .from('product_config_materials')
        .select(`
          product_config_id,
          quantity_required,
          product_config:product_configs(product_code)
        `)
        .eq('raw_material_id', materialId);

      if (pcmError) throw pcmError;

      if (!productConfigMaterials?.length) return [];

      const productConfigIds = productConfigMaterials.map(pcm => pcm.product_config_id);

      // Fetch order items for these product configs
      const { data: orderItems, error: orderError } = await supabase
        .from('order_items')
        .select(`
          quantity,
          status,
          suborder_id,
          product_config_id,
          order:orders(
            order_number,
            created_date,
            customer:customers(name)
          )
        `)
        .in('product_config_id', productConfigIds)
        .in('status', ['Created', 'In Progress']);

      if (orderError) throw orderError;

      // Calculate material requirements from order items
      const orderDetails: OrderDetail[] = [];
      
      orderItems?.forEach(item => {
        const pcm = productConfigMaterials.find(p => p.product_config_id === item.product_config_id);
        if (pcm) {
          const materialQuantityNeeded = item.quantity * pcm.quantity_required;
          orderDetails.push({
            order_number: item.order.order_number,
            customer_name: item.order.customer.name,
            quantity: materialQuantityNeeded,
            status: item.status,
            suborder_id: item.suborder_id,
            created_date: item.order.created_date
          });
        }
      });

      return orderDetails;

    } catch (error) {
      console.error('Error fetching raw material order details:', error);
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

      // Find product configs that use this raw material
      const { data: productConfigMaterials, error: pcmError } = await supabase
        .from('product_config_materials')
        .select(`
          product_config_id,
          quantity_required,
          product_config:product_configs(product_code)
        `)
        .eq('raw_material_id', materialId);

      if (pcmError) throw pcmError;

      if (!productConfigMaterials?.length) return [];

      const productConfigIds = productConfigMaterials.map(pcm => pcm.product_config_id);

      // Fetch finished goods for these product configs
      const { data: finishedGoods, error: fgError } = await supabase
        .from('finished_goods')
        .select(`
          product_code,
          current_stock,
          in_manufacturing,
          required_quantity,
          threshold,
          product_config_id
        `)
        .in('product_config_id', productConfigIds);

      if (fgError) throw fgError;

      // Calculate product details
      const productDetails: ProductDetail[] = [];
      
      finishedGoods?.forEach(fg => {
        const pcm = productConfigMaterials.find(p => p.product_config_id === fg.product_config_id);
        if (pcm) {
          const totalDemand = (fg.required_quantity || 0) + fg.threshold;
          const available = fg.current_stock + fg.in_manufacturing;
          const productShortfall = Math.max(0, totalDemand - available);
          const totalMaterialNeeded = productShortfall * pcm.quantity_required;

          productDetails.push({
            product_code: fg.product_code,
            product_shortfall: productShortfall,
            material_quantity_per_unit: pcm.quantity_required,
            total_material_needed: totalMaterialNeeded,
            current_stock: fg.current_stock,
            in_manufacturing: fg.in_manufacturing,
            required_quantity: fg.required_quantity || 0,
            threshold: fg.threshold
          });
        }
      });

      return productDetails.filter(pd => pd.product_shortfall > 0); // Only show products with shortfall

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
    fetchRawMaterialOrderDetails,
    fetchRawMaterialProductDetails
  };
};
