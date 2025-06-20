
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
  in_manufacturing: number; // New field
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
      console.log('🔍 Fetching raw materials with manufacturing reservations...');
      setLoading(true);
      
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      // Fetch raw materials with supplier info - now includes in_manufacturing
      const { data: rawMaterialsData, error: rawMaterialsError } = await supabase
        .from('raw_materials')
        .select(`
          *,
          supplier:suppliers(company_name)
        `)
        .eq('merchant_id', merchantId)
        .order('name');

      if (rawMaterialsError) throw rawMaterialsError;

      // Use the database values directly and calculate shortfall with manufacturing considerations
      const materialsWithCalculations = rawMaterialsData?.map(material => {
        // Calculate shortfall considering in_manufacturing quantities
        const totalAvailable = material.current_stock + material.in_procurement + (material.in_manufacturing || 0);
        const shortfall = (material.required + material.minimum_stock) - totalAvailable;

        if (material.name.includes('Chain') || material.name.includes('M Chain')) {
          console.log(`🔍 DEBUG M Chain material: ${material.name}`);
          console.log(`   Required from DB: ${material.required}`);
          console.log(`   Current stock: ${material.current_stock}`);
          console.log(`   In procurement: ${material.in_procurement}`);
          console.log(`   In manufacturing: ${material.in_manufacturing || 0}`);
          console.log(`   Minimum stock: ${material.minimum_stock}`);
          console.log(`   Total available: ${totalAvailable}`);
          console.log(`   Calculated shortfall: ${shortfall}`);
        }

        return {
          ...material,
          required: material.required || 0,
          in_manufacturing: material.in_manufacturing || 0,
          shortfall,
          supplier_name: material.supplier?.company_name
        };
      }) || [];

      console.log('✅ Raw materials fetched with manufacturing reservations:', materialsWithCalculations.length, 'items');
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
