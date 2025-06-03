
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ProductConfig = Database['public']['Tables']['product_configs']['Row'] & {
  product_config_materials?: {
    raw_material_id: string;
    quantity_required: number;
    unit: string;
  }[];
};

type ProductConfigInsert = Database['public']['Tables']['product_configs']['Insert'];

export const useProductConfigs = () => {
  const [productConfigs, setProductConfigs] = useState<ProductConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProductConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('product_configs')
        .select(`
          *,
          product_config_materials (
            raw_material_id,
            quantity_required,
            unit
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching product configs:', error);
        return;
      }

      setProductConfigs(data || []);
    } catch (error) {
      console.error('Error fetching product configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProductConfig = async (configData: {
    category: string;
    subcategory: string;
    size: string;
    sizeValue: string;
    productCode: string;
    isActive: boolean;
    rawMaterials: Array<{
      material: string;
      quantity: number;
      unit: string;
    }>;
  }) => {
    try {
      // Insert product config
      const { data: config, error: configError } = await supabase
        .from('product_configs')
        .insert({
          category: configData.category,
          subcategory: configData.subcategory,
          size: `${configData.size} (${configData.sizeValue}m)`,
          size_value: parseFloat(configData.sizeValue),
          product_code: configData.productCode,
          is_active: configData.isActive
        })
        .select()
        .single();

      if (configError) {
        console.error('Error creating product config:', configError);
        throw configError;
      }

      // Insert raw materials for this config
      if (configData.rawMaterials.length > 0) {
        const materialEntries = configData.rawMaterials
          .filter(material => material.material && material.quantity > 0)
          .map(material => ({
            product_config_id: config.id,
            raw_material_id: material.material, // This should be the raw material ID
            quantity_required: material.quantity,
            unit: material.unit
          }));

        if (materialEntries.length > 0) {
          const { error: materialsError } = await supabase
            .from('product_config_materials')
            .insert(materialEntries);

          if (materialsError) {
            console.error('Error creating product config materials:', materialsError);
          }
        }
      }

      // Refresh the list
      await fetchProductConfigs();
      return config;
    } catch (error) {
      console.error('Error creating product config:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProductConfigs();
  }, []);

  return {
    productConfigs,
    loading,
    createProductConfig,
    refetch: fetchProductConfigs
  };
};
