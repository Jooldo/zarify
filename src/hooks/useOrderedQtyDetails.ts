
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

  return {
    loading,
    fetchFinishedGoodOrderDetails,
    fetchRawMaterialOrderDetails
  };
};
