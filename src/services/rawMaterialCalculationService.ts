
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

      // Special debugging for M Chain
      const isMChain = material.name === 'M Chain' || material.name.includes('M Chain') || material.name.toLowerCase().includes('m chain');
      
      if (isMChain) {
        console.log('🔍 === DEBUGGING M CHAIN ===');
        console.log('Material ID:', material.id);
        console.log('Material Name:', material.name);
      }

      // Find all product configs that use this raw material
      const configsUsingMaterial = productConfigMaterials?.filter(
        pcm => pcm.raw_material_id === material.id
      ) || [];

      if (isMChain) {
        console.log('Product configs using M Chain:', configsUsingMaterial.length);
        console.log('Config details:', configsUsingMaterial);
      }

      configsUsingMaterial.forEach((config, configIndex) => {
        const finishedGoodsForConfig = finishedGoodsData?.filter(
          fg => fg.product_config_id === config.product_config_id
        ) || [];

        if (isMChain) {
          console.log(`Config ${configIndex + 1} - Finished goods found:`, finishedGoodsForConfig.length);
          console.log('Finished goods details:', finishedGoodsForConfig);
        }

        finishedGoodsForConfig.forEach((finishedGood, fgIndex) => {
          // Use the required_quantity that should now be updated from live orders
          const liveOrderDemand = finishedGood.required_quantity || 0;
          
          // Calculate shortfall for this finished good
          const totalDemand = liveOrderDemand + finishedGood.threshold;
          const available = finishedGood.current_stock + finishedGood.in_manufacturing;
          const shortfall = Math.max(0, totalDemand - available);

          if (isMChain) {
            console.log(`  FG ${fgIndex + 1} (${finishedGood.product_code}):`);
            console.log(`    Live Order Demand: ${liveOrderDemand}`);
            console.log(`    Threshold: ${finishedGood.threshold}`);
            console.log(`    Total Demand: ${totalDemand}`);
            console.log(`    Current Stock: ${finishedGood.current_stock}`);
            console.log(`    In Manufacturing: ${finishedGood.in_manufacturing}`);
            console.log(`    Available: ${available}`);
            console.log(`    Shortfall: ${shortfall}`);
            console.log(`    Quantity Required per unit: ${config.quantity_required}`);
          }

          if (shortfall > 0) {
            const materialNeeded = shortfall * config.quantity_required;
            totalRequired += materialNeeded;
            
            if (isMChain) {
              console.log(`    Material needed for this FG: ${materialNeeded}`);
              console.log(`    Running total required: ${totalRequired}`);
            }
          }
        });
      });

      // Calculate shortfall for this material
      const materialShortfall = Math.max(0, totalRequired + material.minimum_stock - (material.current_stock + material.in_procurement));

      if (isMChain) {
        console.log('=== M CHAIN FINAL CALCULATION ===');
        console.log('Total Required:', totalRequired);
        console.log('Minimum Stock:', material.minimum_stock);
        console.log('Current Stock:', material.current_stock);
        console.log('In Procurement:', material.in_procurement);
        console.log('Material Shortfall:', materialShortfall);
        console.log('=== END M CHAIN DEBUG ===');
      }

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
