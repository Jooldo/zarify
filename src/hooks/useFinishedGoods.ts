
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { calculateAndUpdateRawMaterialRequirements } from '@/services/rawMaterialCalculationService';

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
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchFinishedGoods = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Starting fetchFinishedGoods - triggering calculation first...');
      
      // First, trigger the calculation to update required_quantity in the database
      await calculateAndUpdateRawMaterialRequirements();
      
      console.log('✅ Calculation completed, now fetching fresh data...');
      
      // First, get the merchant ID
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) {
        console.error('Error getting merchant ID:', merchantError);
        setError(merchantError);
        throw merchantError;
      }

      console.log('Merchant ID:', merchantId);

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
        setError(finishedGoodsError);
        throw finishedGoodsError;
      }

      console.log('📊 Raw finished goods data from database:', finishedGoodsData);

      // Since manufacturing orders are removed, set in_manufacturing to 0
      const inManufacturingByProduct: Record<string, number> = {};

      console.log('Finished goods fetched:', finishedGoodsData?.length || 0, 'items');

      // Use the required_quantity directly from the database and set in_manufacturing to 0
      const finishedGoodsWithRequiredQty = finishedGoodsData?.map(item => {
        const inManufacturingQuantity = 0; // Manufacturing orders removed
        
        console.log(`Product ${item.product_code}: database_required_quantity=${item.required_quantity}, current_stock=${item.current_stock}, threshold=${item.threshold}, in_manufacturing=${inManufacturingQuantity}`);
        
        return {
          ...item,
          required_quantity: item.required_quantity || 0,
          in_manufacturing: inManufacturingQuantity
        };
      }) || [];

      console.log('📊 Final finished goods with required quantities:', finishedGoodsWithRequiredQty);

      setFinishedGoods(finishedGoodsWithRequiredQty);
    } catch (err) {
      const typedError = err as Error;
      console.error('Error fetching finished goods:', typedError);
      setError(typedError);
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

  return { finishedGoods, loading, error, refetch: fetchFinishedGoods };
};
