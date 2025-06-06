
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ProductConfig = Database['public']['Tables']['product_configs']['Row'] & {
  threshold?: number;
  product_config_materials?: {
    raw_material_id: string;
    quantity_required: number;
    unit: string;
    raw_material?: {
      name: string;
      type: string;
    };
  }[];
  finished_goods?: {
    threshold: number;
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
            unit,
            raw_material:raw_materials (
              name,
              type
            )
          ),
          finished_goods (
            threshold
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching product configs:', error);
        return;
      }

      // Transform the data to include threshold at the top level
      const transformedData = (data || []).map(config => ({
        ...config,
        threshold: config.finished_goods?.[0]?.threshold || null
      }));

      setProductConfigs(transformedData);
    } catch (error) {
      console.error('Error fetching product configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMerchantId = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_merchant_id');
      
      if (error) {
        console.error('Error getting merchant ID:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting merchant ID:', error);
      throw error;
    }
  };

  const createProductConfig = async (configData: {
    category: string;
    subcategory: string;
    sizeValue: string;
    weightRange: string;
    threshold?: number;
    productCode: string;
    isActive: boolean;
    rawMaterials: Array<{
      material: string;
      quantity: number;
      unit: string;
    }>;
  }) => {
    try {
      // Get merchant ID first
      const merchantId = await getMerchantId();
      
      // Store size value directly as inches (no conversion needed)
      const sizeValueInInches = parseFloat(configData.sizeValue);
      
      // Insert product config
      const { data: config, error: configError } = await supabase
        .from('product_configs')
        .insert({
          category: configData.category,
          subcategory: configData.subcategory,
          size_value: sizeValueInInches,
          weight_range: configData.weightRange,
          product_code: configData.productCode,
          is_active: configData.isActive,
          merchant_id: merchantId
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
            raw_material_id: material.material,
            quantity_required: material.quantity,
            unit: material.unit,
            merchant_id: merchantId
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

      // Create finished goods entry with threshold if provided
      if (configData.threshold !== undefined && configData.threshold > 0) {
        const { error: finishedGoodsError } = await supabase
          .from('finished_goods')
          .insert({
            product_config_id: config.id,
            product_code: configData.productCode,
            threshold: configData.threshold,
            current_stock: 0,
            required_quantity: 0,
            merchant_id: merchantId
          });

        if (finishedGoodsError) {
          console.error('Error creating finished goods entry:', finishedGoodsError);
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

  const deleteProductConfig = async (configId: string) => {
    try {
      // First delete related materials
      const { error: materialsError } = await supabase
        .from('product_config_materials')
        .delete()
        .eq('product_config_id', configId);

      if (materialsError) {
        console.error('Error deleting product config materials:', materialsError);
        throw materialsError;
      }

      // Delete related finished goods entry
      const { error: finishedGoodsError } = await supabase
        .from('finished_goods')
        .delete()
        .eq('product_config_id', configId);

      if (finishedGoodsError) {
        console.error('Error deleting finished goods entry:', finishedGoodsError);
      }

      // Then delete the config
      const { error } = await supabase
        .from('product_configs')
        .delete()
        .eq('id', configId);

      if (error) {
        console.error('Error deleting product config:', error);
        throw error;
      }

      // Refresh the list
      await fetchProductConfigs();
    } catch (error) {
      console.error('Error deleting product config:', error);
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
    deleteProductConfig,
    refetch: fetchProductConfigs
  };
};
