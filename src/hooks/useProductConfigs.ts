
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductConfig {
  id: string;
  merchant_id: string;
  product_code: string;
  category: string;
  subcategory: string;
  size_value: number;
  weight_range?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useProductConfigs = () => {
  const { data: productConfigs = [], isLoading, error } = useQuery({
    queryKey: ['product-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_configs')
        .select('*')
        .eq('is_active', true)
        .order('product_code');

      if (error) {
        console.error('Error fetching product configs:', error);
        throw error;
      }

      return data as ProductConfig[];
    },
  });

  const findProductConfigByCode = (productCode: string) => {
    return productConfigs.find(config => config.product_code === productCode);
  };

  return {
    productConfigs,
    isLoading,
    error,
    findProductConfigByCode,
  };
};
