
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      console.log('🔍 Fetching raw materials with dynamic calculation...');
      setLoading(true);
      
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      // Fetch raw materials with supplier info
      const { data: rawMaterialsData, error: rawMaterialsError } = await supabase
        .from('raw_materials')
        .select(`
          *,
          supplier:suppliers(company_name)
        `)
        .eq('merchant_id', merchantId)
        .order('name');

      if (rawMaterialsError) throw rawMaterialsError;

      // Fetch order items from live orders (Created + In Progress status)
      const { data: liveOrderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select(`
          product_config_id,
          quantity,
          status
        `)
        .eq('merchant_id', merchantId)
        .in('status', ['Created', 'In Progress']);

      if (orderItemsError) throw orderItemsError;

      // Fetch product config materials to map finished goods to raw materials
      const { data: productConfigMaterials, error: pcmError } = await supabase
        .from('product_config_materials')
        .select(`
          product_config_id,
          raw_material_id,
          quantity_required
        `)
        .eq('merchant_id', merchantId);

      if (pcmError) throw pcmError;

      // Fetch finished goods data
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

      if (finishedGoodsError) throw finishedGoodsError;

      // Group order items by product_config_id and sum quantities
      const requiredQuantitiesByConfig: { [key: string]: number } = {};
      liveOrderItems?.forEach(item => {
        const configId = item.product_config_id;
        if (!requiredQuantitiesByConfig[configId]) {
          requiredQuantitiesByConfig[configId] = 0;
        }
        requiredQuantitiesByConfig[configId] += item.quantity;
      });

      // Calculate required quantities for each raw material
      const materialsWithCalculations = rawMaterialsData?.map(material => {
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
            // Use the required_quantity from live orders
            const liveOrderDemand = requiredQuantitiesByConfig[finishedGood.product_config_id] || 0;
            
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
        const shortfall = Math.max(0, totalRequired + material.minimum_stock - (material.current_stock + material.in_procurement));

        return {
          ...material,
          required: totalRequired,
          shortfall,
          supplier_name: material.supplier?.company_name
        };
      }) || [];

      console.log('✅ Raw materials calculated:', materialsWithCalculations.length, 'items');
      setRawMaterials(materialsWithCalculations);
      
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

  return { 
    rawMaterials, 
    loading, 
    refetch: fetchRawMaterials, 
    addRawMaterial
  };
};
