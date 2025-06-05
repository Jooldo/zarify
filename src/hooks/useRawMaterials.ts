import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RawMaterial {
  id: string;
  name: string;
  type: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
  supplier_id?: string;
  cost_per_unit?: number;
  required: number;
  in_procurement: number;
  request_status: 'None' | 'Pending' | 'Approved' | 'Received';
  last_updated: string;
  supplier?: {
    company_name: string;
  };
  required_quantity: number;
  shortfall: number;
  production_requirements: number;
}

export interface CreateRawMaterialData {
  name: string;
  type: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
  supplier_id?: string;
  cost_per_unit?: number;
}

export const useRawMaterials = () => {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRawMaterials = async () => {
    try {
      console.log('Fetching raw materials data...');
      
      // Fetch raw materials with suppliers
      const { data: rawMaterialsData, error: rawMaterialsError } = await supabase
        .from('raw_materials')
        .select(`
          *,
          supplier:suppliers(company_name)
        `)
        .order('name');

      if (rawMaterialsError) throw rawMaterialsError;

      console.log('Raw materials fetched:', rawMaterialsData?.length || 0, 'items');

      // Fetch finished goods with their product configs
      const { data: finishedGoodsData, error: finishedGoodsError } = await supabase
        .from('finished_goods')
        .select(`
          *,
          product_config:product_configs(id, product_code)
        `)
        .order('product_code');

      if (finishedGoodsError) throw finishedGoodsError;

      console.log('Finished goods fetched:', finishedGoodsData?.length || 0, 'items');

      // Fetch product config materials relationships
      const { data: productConfigMaterialsData, error: productConfigMaterialsError } = await supabase
        .from('product_config_materials')
        .select(`
          product_config_id,
          raw_material_id,
          quantity_required,
          unit
        `);

      if (productConfigMaterialsError) throw productConfigMaterialsError;

      console.log('Product config materials fetched:', productConfigMaterialsData?.length || 0, 'relationships');

      // Calculate required quantities and shortfalls for each raw material
      const rawMaterialsWithCalculations = rawMaterialsData?.map(material => {
        console.log(`Calculating requirements for material: ${material.name}`);
        
        let production_requirements = 0;

        // Find all product configs that use this raw material
        const materialUsages = productConfigMaterialsData?.filter(
          pcm => pcm.raw_material_id === material.id
        ) || [];

        console.log(`Found ${materialUsages.length} product configs using ${material.name}`);

        materialUsages.forEach(usage => {
          // Find the corresponding finished good
          const finishedGood = finishedGoodsData?.find(
            fg => fg.product_config_id === usage.product_config_id
          );

          if (finishedGood) {
            // Calculate finished good shortfall
            const finishedGoodShortfall = Math.max(
              0, 
              (finishedGood.required_quantity + finishedGood.threshold) - finishedGood.current_stock
            );

            console.log(`Finished good ${finishedGood.product_code}: shortfall = ${finishedGoodShortfall}, material qty per unit = ${usage.quantity_required}`);

            // Add to production requirements
            production_requirements += finishedGoodShortfall * usage.quantity_required;
          }
        });

        // Calculate total required quantity (production + minimum stock)
        const required_quantity = production_requirements + material.minimum_stock;

        // Calculate shortfall (required - available)
        const available = material.current_stock + material.in_procurement;
        const shortfall = Math.max(0, required_quantity - available);

        console.log(`Material ${material.name}: production_req=${production_requirements}, min_stock=${material.minimum_stock}, required=${required_quantity}, available=${available}, shortfall=${shortfall}`);

        return {
          ...material,
          required_quantity,
          shortfall,
          production_requirements
        };
      }) || [];

      console.log('Raw materials with calculations:', rawMaterialsWithCalculations);
      setRawMaterials(rawMaterialsWithCalculations);
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

  const createRawMaterial = async (materialData: CreateRawMaterialData): Promise<void> => {
    try {
      // Get the current user's merchant_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('merchant_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Unable to get user profile');
      }

      const { data, error } = await supabase
        .from('raw_materials')
        .insert({
          ...materialData,
          merchant_id: profile.merchant_id,
          in_procurement: 0,
          request_status: 'None' as const,
          last_updated: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Raw material created successfully',
      });

      // Refresh the data
      await fetchRawMaterials();
    } catch (error) {
      console.error('Error creating raw material:', error);
      toast({
        title: 'Error',
        description: 'Failed to create raw material',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateRawMaterial = async (id: string, updates: {
    current_stock?: number;
    minimum_stock?: number;
    required?: number;
    in_procurement?: number;
  }) => {
    try {
      const { error } = await supabase
        .from('raw_materials')
        .update({
          ...updates,
          last_updated: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Raw material updated successfully',
      });

      // Refresh the data
      await fetchRawMaterials();
    } catch (error) {
      console.error('Error updating raw material:', error);
      toast({
        title: 'Error',
        description: 'Failed to update raw material',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchRawMaterials();
  }, []);

  return { rawMaterials, loading, refetch: fetchRawMaterials, updateRawMaterial, createRawMaterial };
};
