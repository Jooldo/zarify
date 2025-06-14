
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
  const [error, setError] = useState<Error | null>(null); // Added error state
  const { toast } = useToast();

  const fetchFinishedGoods = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      console.log('Fetching finished goods data...');
      
      // First, get the merchant ID
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) {
        console.error('Error getting merchant ID:', merchantError);
        setError(merchantError); // Set error state
        throw merchantError;
      }

      console.log('Merchant ID:', merchantId);

      // Fetch all finished goods with their product configs for this merchant
      // The required_quantity should now be updated by the calculation service
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
        setError(finishedGoodsError); // Set error state
        throw finishedGoodsError;
      }

      console.log('Finished goods fetched:', finishedGoodsData?.length || 0, 'items');

      // Use the required_quantity directly from the database (updated by calculation service)
      const finishedGoodsWithRequiredQty = finishedGoodsData?.map(item => {
        console.log(`Product ${item.product_code}: required_quantity=${item.required_quantity}, current_stock=${item.current_stock}, threshold=${item.threshold}, in_manufacturing=${item.in_manufacturing}`);
        
        return {
          ...item,
          required_quantity: item.required_quantity || 0
        };
      }) || [];

      console.log('Final finished goods with required quantities:', finishedGoodsWithRequiredQty);

      setFinishedGoods(finishedGoodsWithRequiredQty);
    } catch (err) {
      const typedError = err as Error;
      console.error('Error fetching finished goods:', typedError);
      setError(typedError); // Ensure error state is set with the caught error
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

  return { finishedGoods, loading, error, refetch: fetchFinishedGoods }; // Return error state
};

