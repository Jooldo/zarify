
import { supabase } from '@/integrations/supabase/client';
import { calculateAndUpdateRawMaterialRequirements } from './rawMaterialCalculationService';

interface CacheMetadata {
  last_calculated: string;
  orders_hash: string;
  stock_hash: string;
}

const CACHE_KEY = 'raw_material_calculations_cache';

// Generate a hash for orders data to detect changes
const generateOrdersHash = async (merchantId: string): Promise<string> => {
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('product_config_id, quantity, status, updated_at')
    .eq('merchant_id', merchantId)
    .in('status', ['Created', 'In Progress']);

  const ordersString = JSON.stringify(orderItems || []);
  return btoa(ordersString).slice(0, 16); // Simple hash
};

// Generate a hash for stock data to detect changes
const generateStockHash = async (merchantId: string): Promise<string> => {
  const { data: stockData } = await supabase
    .from('finished_goods')
    .select('current_stock, in_manufacturing, updated_at')
    .eq('merchant_id', merchantId);

  const { data: rawMaterialData } = await supabase
    .from('raw_materials')
    .select('current_stock, in_procurement, updated_at')
    .eq('merchant_id', merchantId);

  const stockString = JSON.stringify([stockData, rawMaterialData]);
  return btoa(stockString).slice(0, 16); // Simple hash
};

// Check if calculations need to be updated
export const shouldRecalculate = async (): Promise<boolean> => {
  try {
    const { data: merchantId, error: merchantError } = await supabase
      .rpc('get_user_merchant_id');

    if (merchantError) throw merchantError;

    // Get current hashes
    const [currentOrdersHash, currentStockHash] = await Promise.all([
      generateOrdersHash(merchantId),
      generateStockHash(merchantId)
    ]);

    // Get cached metadata
    const cachedMetadata = localStorage.getItem(CACHE_KEY);
    
    if (!cachedMetadata) {
      console.log('📊 No cache found, recalculation needed');
      return true;
    }

    const cache: CacheMetadata = JSON.parse(cachedMetadata);
    
    // Check if data has changed
    const ordersChanged = cache.orders_hash !== currentOrdersHash;
    const stockChanged = cache.stock_hash !== currentStockHash;
    
    // Check if cache is older than 1 hour (fallback)
    const lastCalculated = new Date(cache.last_calculated);
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const cacheExpired = lastCalculated < hourAgo;

    if (ordersChanged || stockChanged || cacheExpired) {
      console.log('📊 Data changed or cache expired, recalculation needed', {
        ordersChanged,
        stockChanged,
        cacheExpired
      });
      return true;
    }

    console.log('📊 Using cached calculations - no changes detected');
    return false;

  } catch (error) {
    console.error('Error checking cache status:', error);
    return true; // Recalculate on error
  }
};

// Update cache metadata after successful calculation
export const updateCacheMetadata = async (): Promise<void> => {
  try {
    const { data: merchantId, error: merchantError } = await supabase
      .rpc('get_user_merchant_id');

    if (merchantError) throw merchantError;

    const [ordersHash, stockHash] = await Promise.all([
      generateOrdersHash(merchantId),
      generateStockHash(merchantId)
    ]);

    const cacheMetadata: CacheMetadata = {
      last_calculated: new Date().toISOString(),
      orders_hash: ordersHash,
      stock_hash: stockHash
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheMetadata));
    console.log('📊 Cache metadata updated');

  } catch (error) {
    console.error('Error updating cache metadata:', error);
  }
};

// Force recalculation (for manual refresh)
export const forceRecalculation = async () => {
  localStorage.removeItem(CACHE_KEY);
  console.log('📊 Cache cleared, forcing recalculation');
  return await calculateAndUpdateRawMaterialRequirements();
};

// Get raw materials with smart caching
export const getRawMaterialsWithSmartCaching = async () => {
  try {
    const needsRecalculation = await shouldRecalculate();
    
    if (needsRecalculation) {
      console.log('🔄 Running calculations due to data changes...');
      await calculateAndUpdateRawMaterialRequirements();
      await updateCacheMetadata();
    }
    
    // Fetch the current data (either freshly calculated or cached)
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

    // Calculate shortfall on the fly since it depends on current values - REMOVE Math.max to allow negative values (surplus)
    const materialsWithShortfall = rawMaterialsData?.map(material => {
      const shortfall = material.required + material.minimum_stock - (material.current_stock + material.in_procurement);
      
      return {
        ...material,
        shortfall,
        supplier_name: material.supplier?.company_name
      };
    }) || [];

    return materialsWithShortfall;

  } catch (error) {
    console.error('Error in getRawMaterialsWithSmartCaching:', error);
    throw error;
  }
};
