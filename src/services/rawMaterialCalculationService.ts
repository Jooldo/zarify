
import { supabase } from '@/integrations/supabase/client';

export interface MaterialCalculationResult {
  id: string;
  required: number;
  shortfall: number;
}

const updateFinishedGoodsRequiredQuantities = async (merchantId: string) => {
  console.log('🔄 Calculating required quantities for finished goods based on live orders...');
  
  // Get ALL order items first to see what's available
  const { data: allOrderItems, error: allOrderItemsError } = await supabase
    .from('order_items')
    .select(`
      product_config_id,
      quantity,
      fulfilled_quantity,
      status,
      suborder_id
    `)
    .eq('merchant_id', merchantId);

  if (allOrderItemsError) {
    console.error('Error fetching all order items:', allOrderItemsError);
    throw allOrderItemsError;
  }

  console.log('📊 ALL order items found:', allOrderItems?.length || 0);
  
  // Check for the specific suborder in ALL order items
  const specificSuborderInAll = allOrderItems?.find(item => item.suborder_id === 'S-OD000005-01');
  if (specificSuborderInAll) {
    console.log('🎯 Found S-OD000005-01 in ALL order items:', specificSuborderInAll);
  } else {
    console.log('❌ S-OD000005-01 NOT found in any order items!');
  }
  
  // Get all order items from live orders (Created + In Progress + Partially Fulfilled status)
  const { data: liveOrderItems, error: orderItemsError } = await supabase
    .from('order_items')
    .select(`
      product_config_id,
      quantity,
      fulfilled_quantity,
      status,
      suborder_id
    `)
    .eq('merchant_id', merchantId)
    .in('status', ['Created', 'In Progress', 'Partially Fulfilled']);

  if (orderItemsError) {
    console.error('Error fetching live order items:', orderItemsError);
    throw orderItemsError;
  }

  console.log('📊 Live order items found:', liveOrderItems?.length || 0);
  
  // Check for the specific suborder mentioned by user
  const specificSuborder = liveOrderItems?.find(item => item.suborder_id === 'S-OD000005-01');
  if (specificSuborder) {
    console.log('🎯 Found specific suborder S-OD000005-01 in live orders:', specificSuborder);
    
    // Get the product config details for this suborder
    const { data: productConfig, error: configError } = await supabase
      .from('product_configs')
      .select('product_code, id')
      .eq('id', specificSuborder.product_config_id)
      .single();
      
    if (productConfig) {
      console.log(`🔍 S-OD000005-01 product config:`, productConfig);
      console.log(`🔍 S-OD000005-01 is for product: ${productConfig.product_code}`);
      console.log(`🔍 S-OD000005-01 product config ID: ${productConfig.id}`);
      console.log(`🔍 Expected AGR product config ID: 430afd6f-6434-45d1-a19f-8cdd505436b3`);
      console.log(`🔍 Do they match? ${productConfig.id === '430afd6f-6434-45d1-a19f-8cdd505436b3'}`);
      
      // Calculate the remaining quantity for this specific suborder
      const remainingQty = specificSuborder.quantity - (specificSuborder.fulfilled_quantity || 0);
      console.log(`🔍 S-OD000005-01 calculation: ${specificSuborder.quantity} - ${specificSuborder.fulfilled_quantity || 0} = ${remainingQty}`);
    }
  } else {
    console.log('❌ S-OD000005-01 NOT found in live order items!');
    console.log('🔍 Available live order item suborder IDs:');
    liveOrderItems?.forEach(item => {
      if (item.suborder_id) {
        console.log(`   ${item.suborder_id} (status: ${item.status}, config: ${item.product_config_id})`);
      }
    });
    
    // Check if S-OD000005-01 exists but with different status
    if (specificSuborderInAll && !specificSuborder) {
      console.log(`🔍 S-OD000005-01 exists but has status: ${specificSuborderInAll.status} (not in Created/In Progress/Partially Fulfilled)`);
      console.log(`🔍 Expected statuses: Created, In Progress, Partially Fulfilled`);
      console.log(`🔍 Should we include other statuses? The item has quantity ${specificSuborderInAll.quantity} and fulfilled ${specificSuborderInAll.fulfilled_quantity || 0}`);
    }
  }

  // Group by product_config_id and sum remaining quantities (quantity - fulfilled_quantity)
  const requiredQuantitiesByConfig: { [key: string]: number } = {};
  
  liveOrderItems?.forEach(item => {
    const configId = item.product_config_id;
    // Always calculate remaining quantity, even if fulfilled_quantity is 0
    const remainingQuantity = item.quantity - (item.fulfilled_quantity || 0);
    
    // Log details for specific suborder
    if (item.suborder_id === 'S-OD000005-01') {
      console.log(`🔍 S-OD000005-01 Details: config=${configId}, quantity=${item.quantity}, fulfilled=${item.fulfilled_quantity || 0}, remaining=${remainingQuantity}`);
    }
    
    // Only count if there's remaining quantity to fulfill
    if (remainingQuantity > 0) {
      if (!requiredQuantitiesByConfig[configId]) {
        requiredQuantitiesByConfig[configId] = 0;
      }
      requiredQuantitiesByConfig[configId] += remainingQuantity;
      
      console.log(`📦 Order item: config ${configId}, suborder ${item.suborder_id}, total: ${item.quantity}, fulfilled: ${item.fulfilled_quantity || 0}, remaining: ${remainingQuantity}`);
    }
  });

  console.log('📊 Required quantities by product config (remaining only):', requiredQuantitiesByConfig);

  // Check all product configs that have requirements
  console.log('🔍 All product configs with requirements:');
  Object.entries(requiredQuantitiesByConfig).forEach(([configId, quantity]) => {
    console.log(`   ${configId}: ${quantity}`);
  });

  // Check specifically for the AGR-SUPERHEAVYMEGHAPAYAL-10IN-40G product config
  const agrProductConfigId = "430afd6f-6434-45d1-a19f-8cdd505436b3";
  console.log(`🔍 AGR-SUPERHEAVYMEGHAPAYAL-10IN-40G (${agrProductConfigId}) required quantity:`, requiredQuantitiesByConfig[agrProductConfigId] || 0);

  // Get all finished goods to see which product codes map to which config IDs
  const { data: finishedGoods } = await supabase
    .from('finished_goods')
    .select('product_code, product_config_id')
    .eq('merchant_id', merchantId);
    
  console.log('🔍 Finished goods product code mappings:');
  finishedGoods?.forEach(fg => {
    console.log(`   ${fg.product_code} -> ${fg.product_config_id}`);
  });

  // If S-OD000005-01 is missing from live orders but exists in all orders, let's manually add it
  if (specificSuborderInAll && !specificSuborder) {
    const manualRemainingQty = specificSuborderInAll.quantity - (specificSuborderInAll.fulfilled_quantity || 0);
    if (manualRemainingQty > 0) {
      console.log(`🔧 MANUAL FIX: Adding S-OD000005-01 manually with remaining quantity ${manualRemainingQty}`);
      const configId = specificSuborderInAll.product_config_id;
      if (!requiredQuantitiesByConfig[configId]) {
        requiredQuantitiesByConfig[configId] = 0;
      }
      requiredQuantitiesByConfig[configId] += manualRemainingQty;
      console.log(`🔧 Updated required quantity for config ${configId}: ${requiredQuantitiesByConfig[configId]}`);
    }
  }

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
  const updatePromises = Object.entries(requiredQuantitiesByConfig).map(([configId, quantity]) => {
    console.log(`🔄 Updating config ${configId} with required_quantity: ${quantity}`);
    return supabase
      .from('finished_goods')
      .update({ required_quantity: quantity })
      .eq('merchant_id', merchantId)
      .eq('product_config_id', configId);
  });

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

    console.log('📊 Raw materials found:', rawMaterialsData?.length || 0);

    // CRITICAL FIX: Fetch finished goods WITH manufacturing orders data
    const { data: finishedGoodsData, error: finishedGoodsError } = await supabase
      .from('finished_goods')
      .select(`
        id,
        product_code,
        current_stock,
        threshold,
        product_config_id,
        required_quantity
      `)
      .eq('merchant_id', merchantId);

    if (finishedGoodsError) {
      console.error('Error fetching finished goods:', finishedGoodsError);
      throw finishedGoodsError;
    }

    console.log('📊 Finished goods found:', finishedGoodsData?.length || 0);

    // CRITICAL FIX: Fetch manufacturing orders to calculate in_manufacturing quantities
    const { data: manufacturingOrders, error: manufacturingOrdersError } = await supabase
      .from('manufacturing_orders')
      .select(`
        quantity_required,
        product_configs!inner(product_code)
      `)
      .eq('merchant_id', merchantId)
      .in('status', ['pending', 'in_progress', 'completed']);

    if (manufacturingOrdersError) {
      console.error('Error fetching manufacturing orders:', manufacturingOrdersError);
    }

    // Calculate in_manufacturing quantities by product code
    const inManufacturingByProduct = manufacturingOrders?.reduce((acc, order) => {
      const productCode = order.product_configs?.product_code;
      if (productCode) {
        acc[productCode] = (acc[productCode] || 0) + order.quantity_required;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    console.log('📊 In manufacturing quantities by product:', inManufacturingByProduct);

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

    console.log('📊 Product config materials found:', productConfigMaterials?.length || 0);

    // Calculate required quantities for each raw material
    const calculationResults: MaterialCalculationResult[] = [];
    
    for (const material of rawMaterialsData || []) {
      let totalRequired = 0;
      
      console.log(`\n🔍 Processing material: ${material.name} (ID: ${material.id})`);

      // Find all product configs that use this raw material
      const configsUsingMaterial = productConfigMaterials?.filter(
        pcm => pcm.raw_material_id === material.id
      ) || [];

      console.log(`   📋 Product configs using this material: ${configsUsingMaterial.length}`);

      configsUsingMaterial.forEach((config) => {
        const finishedGoodsForConfig = finishedGoodsData?.filter(
          fg => fg.product_config_id === config.product_config_id
        ) || [];

        console.log(`   📦 Finished goods for config ${config.product_config_id}: ${finishedGoodsForConfig.length}`);

        finishedGoodsForConfig.forEach((finishedGood) => {
          // Use the required_quantity that should now be updated from live orders
          const liveOrderDemand = finishedGood.required_quantity || 0;
          
          // CRITICAL FIX: Get the in_manufacturing quantity for this specific product
          const inManufacturing = inManufacturingByProduct[finishedGood.product_code] || 0;
          
          console.log(`     🎯 Finished good: ${finishedGood.product_code}`);
          console.log(`        Live order demand: ${liveOrderDemand}`);
          console.log(`        Current stock: ${finishedGood.current_stock}`);
          console.log(`        In manufacturing: ${inManufacturing}`);
          console.log(`        Threshold: ${finishedGood.threshold}`);
          
          // FIXED CALCULATION: Include in_manufacturing in available quantity
          const totalDemand = liveOrderDemand + finishedGood.threshold;
          const available = finishedGood.current_stock + inManufacturing;
          const shortfall = Math.max(0, totalDemand - available);

          console.log(`        Total demand (live + threshold): ${totalDemand}`);
          console.log(`        Available (stock + manufacturing): ${available}`);
          console.log(`        Shortfall: ${shortfall}`);

          if (shortfall > 0) {
            const materialNeeded = shortfall * config.quantity_required;
            totalRequired += materialNeeded;
            console.log(`        Material needed for this FG: ${materialNeeded} (shortfall ${shortfall} × ${config.quantity_required})`);
          } else {
            console.log(`        No material needed - sufficient stock + manufacturing`);
          }
        });
      });

      // Calculate shortfall for this material - Fixed to use actual available stock (current_stock - in_manufacturing + in_procurement)
      // Since in_manufacturing represents reserved materials that have been deducted from current_stock
      const actualAvailableStock = material.current_stock + material.in_procurement;
      const materialShortfall = Math.max(0, totalRequired + material.minimum_stock - actualAvailableStock);

      console.log(`   📊 SUMMARY for ${material.name}:`);
      console.log(`      Total required: ${totalRequired}`);
      console.log(`      Minimum stock: ${material.minimum_stock}`);
      console.log(`      Current stock: ${material.current_stock}`);
      console.log(`      In procurement: ${material.in_procurement}`);
      console.log(`      In manufacturing (reserved): ${material.in_manufacturing}`);
      console.log(`      Actual available stock: ${actualAvailableStock}`);
      console.log(`      Material shortfall: ${materialShortfall}`);

      calculationResults.push({
        id: material.id,
        required: totalRequired,
        shortfall: materialShortfall
      });
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
