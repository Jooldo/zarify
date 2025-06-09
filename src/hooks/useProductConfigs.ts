
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProductConfigMaterial {
  id: string;
  product_config_id: string;
  raw_material_id: string;
  quantity_required: number;
  unit: string;
  merchant_id: string;
  created_at?: string;
  raw_materials?: {
    id: string;
    name: string;
    type: string;
    unit: string;
  };
}

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
  threshold?: number;
  product_config_materials?: ProductConfigMaterial[];
}

// Interface for creating product configs (only includes database fields)
interface CreateProductConfigData {
  product_code: string;
  category: string;
  subcategory: string;
  size_value: number;
  weight_range?: string;
  is_active?: boolean;
  threshold?: number;
}

export const useProductConfigs = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: productConfigs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['product-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_configs')
        .select(`
          *,
          product_config_materials (
            id,
            raw_material_id,
            quantity_required,
            unit,
            merchant_id,
            created_at,
            raw_materials (
              id,
              name,
              type,
              unit
            )
          )
        `)
        .eq('is_active', true)
        .order('product_code');

      if (error) {
        console.error('Error fetching product configs:', error);
        throw error;
      }

      return data as ProductConfig[];
    },
  });

  const checkProductCodeExists = async (productCode: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('product_configs')
      .select('id')
      .eq('product_code', productCode)
      .limit(1);

    if (error) {
      console.error('Error checking product code:', error);
      return false;
    }

    return data && data.length > 0;
  };

  const createProductConfigMutation = useMutation({
    mutationFn: async (configData: CreateProductConfigData) => {
      // Check if product code already exists
      const exists = await checkProductCodeExists(configData.product_code);
      if (exists) {
        throw new Error(`Product code "${configData.product_code}" already exists. Please modify the configuration to generate a unique code.`);
      }

      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      const { data, error } = await supabase
        .from('product_configs')
        .insert({
          ...configData,
          merchant_id: merchantId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-configs'] });
      queryClient.invalidateQueries({ queryKey: ['finished-goods'] });
      toast({
        title: 'Success',
        description: 'Product configuration created successfully',
      });
    },
    onError: (error) => {
      console.error('Error creating product config:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create product configuration';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const deleteProductConfigMutation = useMutation({
    mutationFn: async (configId: string) => {
      const { error } = await supabase
        .from('product_configs')
        .delete()
        .eq('id', configId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-configs'] });
      queryClient.invalidateQueries({ queryKey: ['finished-goods'] });
      toast({
        title: 'Success',
        description: 'Product configuration deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Error deleting product config:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product configuration',
        variant: 'destructive',
      });
    },
  });

  const findProductConfigByCode = (productCode: string) => {
    return productConfigs.find(config => config.product_code === productCode);
  };

  const createProductConfig = (configData: CreateProductConfigData) => {
    return createProductConfigMutation.mutate(configData);
  };

  const deleteProductConfig = async (configId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      deleteProductConfigMutation.mutate(configId, {
        onSuccess: () => resolve(),
        onError: (error) => reject(error),
      });
    });
  };

  return {
    productConfigs,
    isLoading,
    loading: isLoading, // Alias for backward compatibility
    error,
    findProductConfigByCode,
    createProductConfig,
    deleteProductConfig,
    refetch,
    checkProductCodeExists,
  };
};
