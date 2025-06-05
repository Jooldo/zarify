
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FinishedGood {
  id: string;
  product_code: string;
  product_config_id: string;
  current_stock: number;
  threshold: number;
  required_quantity: number;
  in_manufacturing: number;
  last_produced?: string;
  product_config: {
    category: string;
    subcategory: string;
    size_value: number;
    weight_range: string | null;
  };
}

export const useFinishedGoods = () => {
  const [finishedGoods, setFinishedGoods] = useState<FinishedGood[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFinishedGoods = async () => {
    try {
      console.log('Fetching finished goods data...');
      
      // First, fetch all finished goods with their product configs
      const { data: finishedGoodsData, error: finishedGoodsError } = await supabase
        .from('finished_goods')
        .select(`
          *,
          product_config:product_configs(category, subcategory, size_value, weight_range)
        `)
        .order('product_code');

      if (finishedGoodsError) throw finishedGoodsError;

      console.log('Finished goods fetched:', finishedGoodsData?.length || 0, 'items');

      // Fetch all order items with status 'Created' or 'In Progress' to calculate required quantities
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from('order_items')
        .select(`
          product_config_id,
          quantity
        `)
        .in('status', ['Created', 'In Progress']);

      if (orderItemsError) throw orderItemsError;

      console.log('Pending order items fetched:', orderItemsData?.length || 0, 'items');

      // Calculate required quantities for each product config
      const requiredQuantities = orderItemsData?.reduce((acc, item) => {
        acc[item.product_config_id] = (acc[item.product_config_id] || 0) + item.quantity;
        return acc;
      }, {} as Record<string, number>) || {};

      console.log('Calculated required quantities from orders:', requiredQuantities);

      // Map the finished goods with calculated required quantities
      const finishedGoodsWithRequiredQty = finishedGoodsData?.map(item => {
        const orderDemand = requiredQuantities[item.product_config_id] || 0;
        
        console.log(`Product ${item.product_code}: order_demand=${orderDemand}, current_stock=${item.current_stock}, threshold=${item.threshold}, in_manufacturing=${item.in_manufacturing}`);
        
        return {
          ...item,
          required_quantity: orderDemand
        };
      }) || [];

      console.log('Final finished goods with required quantities:', finishedGoodsWithRequiredQty);

      setFinishedGoods(finishedGoodsWithRequiredQty);
    } catch (error) {
      console.error('Error fetching finished goods:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch finished goods',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinishedGoods();
  }, []);

  return { finishedGoods, loading, refetch: fetchFinishedGoods };
};
