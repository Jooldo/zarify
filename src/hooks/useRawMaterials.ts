
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getRawMaterialsWithSmartCaching, forceRecalculation } from '@/services/cachedCalculationService';
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
      console.log('🔍 Fetching raw materials with smart caching...');
      setLoading(true);
      
      const materialsWithCalculations = await getRawMaterialsWithSmartCaching();
      
      console.log('✅ Raw materials fetched:', materialsWithCalculations.length, 'items');
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

  const updateCalculations = async () => {
    try {
      console.log('🔄 Manually forcing calculation update...');
      setLoading(true);
      
      await forceRecalculation();
      await fetchRawMaterials(); // Refresh the data after calculations
      
      toast({
        title: 'Success',
        description: 'Raw material calculations updated successfully',
      });
    } catch (error) {
      console.error('Error updating calculations:', error);
      toast({
        title: 'Error',
        description: 'Failed to update calculations',
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
    addRawMaterial,
    updateCalculations 
  };
};
