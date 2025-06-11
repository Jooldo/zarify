import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RawMaterial {
  id: string;
  name: string;
  type: string;
  unit: string;
  current_stock: number;
  minimum_stock: number;
  required: number;
  in_procurement: number;
  shortfall: number;
  supplier_name?: string;
  supplier_id?: string;
  last_updated?: string;
  cost_per_unit?: number;
}

export interface CreateRawMaterialData {
  name: string;
  type: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
}

export const useRawMaterials = () => {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRawMaterials = async () => {
    try {
      console.log('Fetching raw materials data...');
      
      // First, get the merchant ID
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) {
        console.error('Error getting merchant ID:', merchantError);
        throw merchantError;
      }

      console.log('Merchant ID:', merchantId);

      // Fetch all raw materials with their suppliers
      const { data: rawMaterialsData, error: rawMaterialsError } = await supabase
        .from('raw_materials')
        .select(`
          *,
          supplier:suppliers(company_name)
        `)
        .eq('merchant_id', merchantId)
        .order('name');

      if (rawMaterialsError) {
        console.error('Error fetching raw materials:', rawMaterialsError);
        throw rawMaterialsError;
      }

      console.log('Raw materials fetched:', rawMaterialsData?.length || 0, 'items');

      // Fetch order items to calculate required quantities for finished goods
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

      // Calculate required quantities for each product config from live orders
      const requiredQuantitiesByConfig = orderItemsData?.reduce((acc, item) => {
        if (item.status === 'Created' || item.status === 'In Progress') {
          acc[item.product_config_id] = (acc[item.product_config_id] || 0) + item.quantity;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      // Fetch finished goods with their current stock and manufacturing info
      const { data: finishedGoodsData, error: finishedGoodsError } = await supabase
        .from('finished_goods')
        .select(`
          id,
          product_code,
          current_stock,
          in_manufacturing,
          threshold,
          product_config_id
        `)
        .eq('merchant_id', merchantId);

      if (finishedGoodsError) {
        console.error('Error fetching finished goods:', finishedGoodsError);
        throw finishedGoodsError;
      }

      console.log('Finished goods fetched:', finishedGoodsData?.length || 0, 'items');

      // Fetch product config materials to map finished goods to raw materials
      const { data: productConfigMaterials, error: pcmError } = await supabase
        .from('product_config_materials')
        .select(`
          product_config_id,
          raw_material_id,
          quantity_required
        `)
        .eq('merchant_id', merchantId);

      if (pcmError) {
        console.error('Error fetching product config materials:', pcmError);
        throw pcmError;
      }

      console.log('Product config materials fetched:', productConfigMaterials?.length || 0, 'items');

      // Calculate required quantities for each raw material based on shortfall
      const materialRequirements = rawMaterialsData?.map(material => {
        let totalRequired = 0;

        // Find all product configs that use this raw material
        const configsUsingMaterial = productConfigMaterials?.filter(
          pcm => pcm.raw_material_id === material.id
        ) || [];

        console.log(`\n=== CALCULATING FOR: ${material.name} ===`);
        console.log('Material ID:', material.id);
        console.log('Configs using this material:', configsUsingMaterial.length);

        // For each config, calculate based on finished goods shortfall
        configsUsingMaterial.forEach(config => {
          const finishedGoodsForConfig = finishedGoodsData?.filter(
            fg => fg.product_config_id === config.product_config_id
          ) || [];

          console.log(`Config ${config.product_config_id} uses ${config.quantity_required} ${material.unit} per unit`);
          console.log(`Found ${finishedGoodsForConfig.length} finished goods for this config`);

          finishedGoodsForConfig.forEach(finishedGood => {
            // Get the required quantity from live orders
            const liveOrderDemand = requiredQuantitiesByConfig[finishedGood.product_config_id] || 0;
            
            // Calculate shortfall for this finished good using live order demand
            const totalDemand = liveOrderDemand + finishedGood.threshold;
            const available = finishedGood.current_stock + finishedGood.in_manufacturing;
            const shortfall = Math.max(0, totalDemand - available);

            if (shortfall > 0) {
              const materialNeeded = shortfall * config.quantity_required;
              totalRequired += materialNeeded;

              console.log(`  Product ${finishedGood.product_code}:`, {
                liveOrderDemand,
                threshold: finishedGood.threshold,
                totalDemand,
                current_stock: finishedGood.current_stock,
                in_manufacturing: finishedGood.in_manufacturing,
                available,
                shortfall,
                materialNeeded: materialNeeded,
                quantityPerUnit: config.quantity_required
              });
            } else {
              console.log(`  Product ${finishedGood.product_code}: No shortfall (demand: ${totalDemand}, available: ${available})`);
            }
          });
        });

        console.log(`TOTAL REQUIRED for ${material.name}: ${totalRequired} ${material.unit}`);
        console.log('Current Stock:', material.current_stock);
        console.log('In Procurement:', material.in_procurement);

        const shortfall = Math.max(0, totalRequired + material.minimum_stock - (material.current_stock + material.in_procurement));
        console.log('Final Shortfall:', shortfall);
        console.log('='.repeat(50));

        return {
          id: material.id,
          name: material.name,
          type: material.type,
          unit: material.unit,
          current_stock: material.current_stock || 0,
          minimum_stock: material.minimum_stock || 0,
          required: totalRequired,
          in_procurement: material.in_procurement || 0,
          shortfall,
          supplier_name: material.supplier?.company_name,
          supplier_id: material.supplier_id,
          last_updated: material.last_updated,
          cost_per_unit: material.cost_per_unit
        };
      }) || [];

      console.log('Final raw materials with requirements:', materialRequirements);

      setRawMaterials(materialRequirements);
    } catch (error) {
      console.error('Error fetching raw materials:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch raw materials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addRawMaterial = async (data: CreateRawMaterialData) => {
    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      const { error } = await supabase
        .from('raw_materials')
        .insert({
          ...data,
          merchant_id: merchantId
        });

      if (error) throw error;

      await fetchRawMaterials();
    } catch (error) {
      console.error('Error adding raw material:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchRawMaterials();
  }, []);

  return { rawMaterials, loading, refetch: fetchRawMaterials, addRawMaterial };
};
