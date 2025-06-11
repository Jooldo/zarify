
import { supabase } from '@/integrations/supabase/client';

export interface MaterialCalculationResult {
  id: string;
  required: number;
  shortfall: number;
}

const updateFinishedGoodsRequiredQuantities = async (merchantId: string) => {
  console.log('🔄 Calculating required quantities for finished goods based on live orders...');
  
  // Get all order items from live orders (Created + In Progress status)
  const { data: liveOrderItems, error: orderItemsError } = await supabase
    .from('order_items')
    .select(`
      product_config_id,
      quantity,
      status
    `)
    .eq('merchant_id', merchantId)
    .in('status', ['Created', 'In Progress']);

  if (orderItemsError) {
    console.error('Error fetching live order items:', orderItemsError);
    throw orderItemsError;
  }

  // Group by product_config_id and sum quantities
  const requiredQuantitiesByConfig: { [key: string]: number } = {};
  
  liveOrderItems?.forEach(item => {
    const configId = item.product_config_id;
    if (!requiredQuantitiesByConfig[configId]) {
      requiredQuantitiesByConfig[configId] = 0;
    }
    requiredQuantitiesByConfig[configId] += item.quantity;
  });

  console.log('📊 Required quantities by product config:', requiredQuantitiesByConfig);

  // Update all finished goods - set required_quantity to 0 first, then update based on live orders
  const { error: resetError } = await supabase
    .from('finished_goods')
    .update({ required_quantity: 0 })
    .eq('merchant_id', merchantId);

  if (resetError) {
    console.error('Error resetting required quantities:', resetError);
    throw resetError;
  }

  // Update finished goods with calculated required quantities
  const updatePromises = Object.entries(requiredQuantitiesByConfig).map(([configId, quantity]) =>
    supabase
      .from('finished_goods')
      .update({ required_quantity: quantity })
      .eq('merchant_id', merchantId)
      .eq('product_config_id', configId)
  );

  const updateResults = await Promise.all(updatePromises);
  const updateErrors = updateResults.filter(result => result.error);
  
  if (updateErrors.length > 0) {
    console.error('Some finished goods updates failed:', updateErrors);
    throw new Error(`Failed to update ${updateErrors.length} finished goods`);
  }

  console.log('✅ Finished goods required quantities updated successfully');
};

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

    // First, update finished goods required quantities based on live orders
    await updateFinishedGoodsRequiredQuantities(merchantId);

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

      configsUsingMaterial.forEach((config) => {
        const finishedGoodsForConfig = finishedGoodsData?.filter(
          fg => fg.product_config_id === config.product_config_id
        ) || [];

        finishedGoodsForConfig.forEach((finishedGood) => {
          // Use the required_quantity that should now be updated from live orders
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

      console.log(`📊 Material: ${material.name}, Calculated Required: ${totalRequired}, Shortfall: ${materialShortfall}`);
    }

    // Update all materials in the database with the calculated required values
    console.log('📊 Updating calculated values in raw_materials database table...');
    
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
      console.error('Some raw material updates failed:', updateErrors);
      throw new Error(`Failed to update ${updateErrors.length} raw materials`);
    }

    console.log('✅ All raw material required values updated successfully in database');
    return calculationResults;

  } catch (error) {
    console.error('Error in calculateAndUpdateRawMaterialRequirements:', error);
    throw error;
  }
};

// Legacy function - now just calls the cached version
export const getRawMaterialsWithCalculations = async () => {
  // Import here to avoid circular dependency
  const { getRawMaterialsWithSmartCaching } = await import('./cachedCalculationService');
  return getRawMaterialsWithSmartCaching();
};
