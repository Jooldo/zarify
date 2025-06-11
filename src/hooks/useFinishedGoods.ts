
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
  tag_enabled?: boolean;
  product_config: {
    category: string;
    subcategory: string;
    size_value: number;
    weight_range: string | null;
    is_active: boolean;
  };
}

export const useFinishedGoods = () => {
  const [finishedGoods, setFinishedGoods] = useState<FinishedGood[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFinishedGoods = async () => {
    try {
      console.log('Fetching finished goods data...');
      
      // First, get the merchant ID
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) {
        console.error('Error getting merchant ID:', merchantError);
        throw merchantError;
      }

      console.log('Merchant ID:', merchantId);

      // Fetch all order items with status 'Created' or 'In Progress' to calculate required quantities
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from('order_items')
        .select(`
          product_config_id,
          quantity,
          status
        `)
        .eq('merchant_id', merchantId)
        .in('status', ['Created', 'In Progress']);

      if (orderItemsError) {
        console.error('Error fetching order items:', orderItemsError);
        throw orderItemsError;
      }

      console.log('Pending order items fetched:', orderItemsData?.length || 0, 'items');

      // Calculate required quantities for each product config
      const requiredQuantities = orderItemsData?.reduce((acc, item) => {
        if (item.status === 'Created' || item.status === 'In Progress') {
          acc[item.product_config_id] = (acc[item.product_config_id] || 0) + item.quantity;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      console.log('Calculated required quantities from orders:', requiredQuantities);

      // Fetch all finished goods with their product configs for this merchant
      const { data: finishedGoodsData, error: finishedGoodsError } = await supabase
        .from('finished_goods')
        .select(`
          *,
          product_config:product_configs(category, subcategory, size_value, weight_range, is_active)
        `)
        .eq('merchant_id', merchantId)
        .order('product_code');

      if (finishedGoodsError) {
        console.error('Error fetching finished goods:', finishedGoodsError);
        throw finishedGoodsError;
      }

      console.log('Finished goods fetched:', finishedGoodsData?.length || 0, 'items');

      // Update finished goods with calculated required quantities and update database
      const finishedGoodsWithRequiredQty = [];
      
      for (const item of finishedGoodsData || []) {
        const orderDemand = requiredQuantities[item.product_config_id] || 0;
        
        console.log(`Product ${item.product_code}: order_demand=${orderDemand}, current_stock=${item.current_stock}, threshold=${item.threshold}, in_manufacturing=${item.in_manufacturing}`);
        
        // Always update the required_quantity in the database to reflect current order demands
        console.log(`Updating required_quantity for ${item.product_code} to ${orderDemand}`);
        
        const { error: updateError } = await supabase
          .from('finished_goods')
          .update({ required_quantity: orderDemand })
          .eq('id', item.id);

        if (updateError) {
          console.error(`Error updating required_quantity for ${item.product_code}:`, updateError);
        }
        
        finishedGoodsWithRequiredQty.push({
          ...item,
          required_quantity: orderDemand
        });
      }

      console.log('Final finished goods with updated required quantities:', finishedGoodsWithRequiredQty);

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
