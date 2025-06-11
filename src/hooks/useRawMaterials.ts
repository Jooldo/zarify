
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
      console.log('🔍 Starting raw materials fetch...');
      
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

      console.log('📦 Raw materials fetched:', rawMaterialsData?.length || 0, 'items');

      // Fetch finished goods with their requirements from live orders
      const { data: finishedGoodsData, error: finishedGoodsError } = await supabase
        .from('finished_goods')
        .select(`
          id,
          product_code,
          current_stock,
          in_manufacturing,
          threshold,
          product_config_id,
          required_quantity
        `)
        .eq('merchant_id', merchantId);

      if (finishedGoodsError) {
        console.error('Error fetching finished goods:', finishedGoodsError);
        throw finishedGoodsError;
      }

      console.log('🏭 Finished goods fetched:', finishedGoodsData?.length || 0, 'items');

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

      console.log('🔗 Product config materials fetched:', productConfigMaterials?.length || 0, 'items');

      // Calculate required quantities for each raw material and prepare updates
      const materialUpdates: { id: string; required: number }[] = [];
      const materialRequirements = rawMaterialsData?.map(material => {
        let totalRequired = 0;

        // Find all product configs that use this raw material
        const configsUsingMaterial = productConfigMaterials?.filter(
          pcm => pcm.raw_material_id === material.id
        ) || [];

        const isTargetMaterial = material.name.toLowerCase().includes('3mm boll chain tanuu');
        const isMChain = material.name === 'M Chain';
        
        if (isTargetMaterial || isMChain) {
          console.log(`\n🎯 === CALCULATING FOR: ${material.name} ===`);
          console.log('Material ID:', material.id);
          console.log('Configs using this material:', configsUsingMaterial.length);
          console.log('Configs details:', configsUsingMaterial);
        }

        // For each config, calculate based on finished goods shortfall
        configsUsingMaterial.forEach(config => {
          const finishedGoodsForConfig = finishedGoodsData?.filter(
            fg => fg.product_config_id === config.product_config_id
          ) || [];

          if (isTargetMaterial || isMChain) {
            console.log(`📋 Config ${config.product_config_id} uses ${config.quantity_required} ${material.unit} per unit`);
            console.log(`Found ${finishedGoodsForConfig.length} finished goods for this config`);
            console.log('Finished goods for this config:', finishedGoodsForConfig);
          }

          finishedGoodsForConfig.forEach(finishedGood => {
            // Use the required_quantity that should now be set from live orders
            const liveOrderDemand = finishedGood.required_quantity || 0;
            
            // Calculate shortfall for this finished good
            const totalDemand = liveOrderDemand + finishedGood.threshold;
            const available = finishedGood.current_stock + finishedGood.in_manufacturing;
            const shortfall = Math.max(0, totalDemand - available);

            if (shortfall > 0) {
              const materialNeeded = shortfall * config.quantity_required;
              totalRequired += materialNeeded;

              if (isTargetMaterial || isMChain) {
                console.log(`  🎯 Product ${finishedGood.product_code}:`, {
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
              }
            } else {
              if (isTargetMaterial || isMChain) {
                console.log(`  ✅ Product ${finishedGood.product_code}: No shortfall (demand: ${totalDemand}, available: ${available})`);
              }
            }
          });
        });

        if (isTargetMaterial || isMChain) {
          console.log(`📊 TOTAL REQUIRED for ${material.name}: ${totalRequired} ${material.unit}`);
          console.log('Current Stock:', material.current_stock);
          console.log('In Procurement:', material.in_procurement);
        }

        // Only update if the required quantity is different from what's in the database
        if (totalRequired !== material.required) {
          materialUpdates.push({ id: material.id, required: totalRequired });
        }

        const shortfall = Math.max(0, totalRequired + material.minimum_stock - (material.current_stock + material.in_procurement));
        
        if (isTargetMaterial || isMChain) {
          console.log('Final Shortfall:', shortfall);
          console.log('='.repeat(50));
        }

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

      // Update the database with new required quantities
      if (materialUpdates.length > 0) {
        console.log('🔄 Updating required quantities in database:', materialUpdates);
        
        const updatePromises = materialUpdates.map(update => 
          supabase
            .from('raw_materials')
            .update({ required: update.required, last_updated: new Date().toISOString() })
            .eq('id', update.id)
        );

        const updateResults = await Promise.all(updatePromises);
        
        // Check for any update errors
        const updateErrors = updateResults.filter(result => result.error);
        if (updateErrors.length > 0) {
          console.error('Some updates failed:', updateErrors);
        } else {
          console.log('✅ All required quantities updated successfully');
        }
      }

      console.log('✅ Final raw materials with requirements:', materialRequirements);

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
