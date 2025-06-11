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

      // Check if 3MM BOLL CHAIN Tanuu exists in raw materials
      const targetRawMaterial = rawMaterialsData?.find(rm => 
        rm.name.toLowerCase().includes('3mm boll chain tanuu')
      );
      console.log('🎯 Target raw material found:', targetRawMaterial ? {
        id: targetRawMaterial.id,
        name: targetRawMaterial.name
      } : 'NOT FOUND');

      // DEBUG: Fetch ALL product config materials to see what's in the table
      const { data: allProductConfigMaterials, error: allPcmError } = await supabase
        .from('product_config_materials')
        .select('*')
        .eq('merchant_id', merchantId);

      if (allPcmError) {
        console.error('Error fetching all product config materials:', allPcmError);
      } else {
        console.log('🔧 ALL Product config materials in database:', allProductConfigMaterials);
        console.log('🔧 Total product config materials count:', allProductConfigMaterials?.length || 0);
        
        if (targetRawMaterial) {
          const materialsUsingTarget = allProductConfigMaterials?.filter(
            pcm => pcm.raw_material_id === targetRawMaterial.id
          ) || [];
          console.log('🔧 Materials using 3MM BOLL CHAIN Tanuu:', materialsUsingTarget);
        }
      }

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

      // Find AGR-HIM-111G specifically
      const agrHimProduct = finishedGoodsData?.find(fg => fg.product_code === 'AGR-HIM-111G');
      if (agrHimProduct) {
        console.log('🎯 AGR-HIM-111G found:', {
          id: agrHimProduct.id,
          product_config_id: agrHimProduct.product_config_id,
          required_quantity: agrHimProduct.required_quantity,
          current_stock: agrHimProduct.current_stock,
          threshold: agrHimProduct.threshold,
          shortfall: Math.max(0, (agrHimProduct.required_quantity + agrHimProduct.threshold) - (agrHimProduct.current_stock + agrHimProduct.in_manufacturing))
        });

        // DEBUG: Check if there are any product config materials for this specific product config
        const materialsForAgrHim = allProductConfigMaterials?.filter(
          pcm => pcm.product_config_id === agrHimProduct.product_config_id
        ) || [];
        console.log('🔧 Materials configured for AGR-HIM-111G product config:', materialsForAgrHim);
      }

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

      // Find connections to 3MM BOLL CHAIN Tanuu specifically
      if (targetRawMaterial) {
        const connectionsToTarget = productConfigMaterials?.filter(
          pcm => pcm.raw_material_id === targetRawMaterial.id
        ) || [];
        console.log('🔗 Connections to 3MM BOLL CHAIN Tanuu:', connectionsToTarget);
        
        connectionsToTarget.forEach(connection => {
          const relatedFG = finishedGoodsData?.find(fg => fg.product_config_id === connection.product_config_id);
          if (relatedFG) {
            console.log(`  📋 Connected to FG: ${relatedFG.product_code}`, {
              product_config_id: connection.product_config_id,
              quantity_required_per_unit: connection.quantity_required,
              fg_required_quantity: relatedFG.required_quantity,
              fg_current_stock: relatedFG.current_stock,
              fg_threshold: relatedFG.threshold
            });
          }
        });
      }

      // Calculate required quantities for each raw material based on finished goods shortfall
      const materialRequirements = rawMaterialsData?.map(material => {
        let totalRequired = 0;

        // Find all product configs that use this raw material
        const configsUsingMaterial = productConfigMaterials?.filter(
          pcm => pcm.raw_material_id === material.id
        ) || [];

        const isTargetMaterial = material.name.toLowerCase().includes('3mm boll chain tanuu');
        if (isTargetMaterial) {
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

          if (isTargetMaterial) {
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

              if (isTargetMaterial) {
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
              if (isTargetMaterial) {
                console.log(`  ✅ Product ${finishedGood.product_code}: No shortfall (demand: ${totalDemand}, available: ${available})`);
              }
            }
          });
        });

        if (isTargetMaterial) {
          console.log(`📊 TOTAL REQUIRED for ${material.name}: ${totalRequired} ${material.unit}`);
          console.log('Current Stock:', material.current_stock);
          console.log('In Procurement:', material.in_procurement);
        }

        const shortfall = Math.max(0, totalRequired + material.minimum_stock - (material.current_stock + material.in_procurement));
        
        if (isTargetMaterial) {
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

      console.log('✅ Final raw materials with requirements:', materialRequirements);

      // Final check on 3MM BOLL CHAIN Tanuu result
      const finalTargetMaterial = materialRequirements.find(m => 
        m.name.toLowerCase().includes('3mm boll chain tanuu')
      );
      if (finalTargetMaterial) {
        console.log('🏁 FINAL 3MM BOLL CHAIN Tanuu result:', {
          name: finalTargetMaterial.name,
          required: finalTargetMaterial.required,
          current_stock: finalTargetMaterial.current_stock,
          shortfall: finalTargetMaterial.shortfall
        });
      } else {
        console.log('❌ 3MM BOLL CHAIN Tanuu not found in final results');
      }

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
