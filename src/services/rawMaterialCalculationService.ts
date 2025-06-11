
import { supabase } from '@/integrations/supabase/client';

export interface MaterialCalculationResult {
  id: string;
  required: number;
  shortfall: number;
}

export const calculateAndUpdateRawMaterialRequirements = async (): Promise<MaterialCalculationResult[]> => {
  try {
    console.log('🔄 Starting raw material calculations and database updates...');
    
    // Get the merchant ID
    const { data: merchantId, error: merchantError } = await supabase
      .rpc('get_user_merchant_id');

    if (merchantError) {
      console.error('Error getting merchant ID:', merchantError);
      throw merchantError;
    }

    // Fetch all raw materials
    const { data: rawMaterialsData, error: rawMaterialsError } = await supabase
      .from('raw_materials')
      .select('*')
      .eq('merchant_id', merchantId);

    if (rawMaterialsError) {
      console.error('Error fetching raw materials:', rawMaterialsError);
      throw rawMaterialsError;
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

    // Calculate required quantities for each raw material
    const calculationResults: MaterialCalculationResult[] = [];
    
    for (const material of rawMaterialsData || []) {
      let totalRequired = 0;

      // Find all product configs that use this raw material
      const configsUsingMaterial = productConfigMaterials?.filter(
        pcm => pcm.raw_material_id === material.id
      ) || [];

      // For each config, calculate based on finished goods shortfall
      configsUsingMaterial.forEach(config => {
        const finishedGoodsForConfig = finishedGoodsData?.filter(
          fg => fg.product_config_id === config.product_config_id
        ) || [];

        finishedGoodsForConfig.forEach(finishedGood => {
          // Use the required_quantity that should be set from live orders
          const liveOrderDemand = finishedGood.required_quantity || 0;
          
          // Calculate shortfall for this finished good
          const totalDemand = liveOrderDemand + finishedGood.threshold;
          const available = finishedGood.current_stock + finishedGood.in_manufacturing;
          const shortfall = Math.max(0, totalDemand - available);

          if (shortfall > 0) {
            const materialNeeded = shortfall * config.quantity_required;
            totalRequired += materialNeeded;
          }
        });
      });

      // Calculate shortfall for this material
      const materialShortfall = Math.max(0, totalRequired + material.minimum_stock - (material.current_stock + material.in_procurement));

      calculationResults.push({
        id: material.id,
        required: totalRequired,
        shortfall: materialShortfall
      });
    }

    // Update all materials in the database
    console.log('📊 Updating calculated values in database...');
    
    const updatePromises = calculationResults.map(result => 
      supabase
        .from('raw_materials')
        .update({ 
          required: result.required,
          last_updated: new Date().toISOString() 
        })
        .eq('id', result.id)
    );

    const updateResults = await Promise.all(updatePromises);
    
    // Check for any update errors
    const updateErrors = updateResults.filter(result => result.error);
    if (updateErrors.length > 0) {
      console.error('Some calculation updates failed:', updateErrors);
      throw new Error(`Failed to update ${updateErrors.length} materials`);
    }

    console.log('✅ All material calculations updated successfully');
    return calculationResults;

  } catch (error) {
    console.error('Error in calculateAndUpdateRawMaterialRequirements:', error);
    throw error;
  }
};

export const getRawMaterialsWithCalculations = async () => {
  try {
    // First run the calculations to ensure data is fresh
    await calculateAndUpdateRawMaterialRequirements();
    
    // Then fetch the updated data
    const { data: merchantId, error: merchantError } = await supabase
      .rpc('get_user_merchant_id');

    if (merchantError) throw merchantError;

    const { data: rawMaterialsData, error: rawMaterialsError } = await supabase
      .from('raw_materials')
      .select(`
        *,
        supplier:suppliers(company_name)
      `)
      .eq('merchant_id', merchantId)
      .order('name');

    if (rawMaterialsError) throw rawMaterialsError;

    // Calculate shortfall on the fly since it depends on current values
    const materialsWithShortfall = rawMaterialsData?.map(material => {
      const shortfall = Math.max(0, material.required + material.minimum_stock - (material.current_stock + material.in_procurement));
      
      return {
        ...material,
        shortfall,
        supplier_name: material.supplier?.company_name
      };
    }) || [];

    return materialsWithShortfall;

  } catch (error) {
    console.error('Error in getRawMaterialsWithCalculations:', error);
    throw error;
  }
};
