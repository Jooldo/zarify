
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
}

export const useRawMaterials = () => {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRawMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('raw_materials')
        .select(`
          *,
          supplier:suppliers(company_name)
        `)
        .order('name');

      if (error) throw error;
      setRawMaterials(data || []);
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

  return { rawMaterials, loading, refetch: fetchRawMaterials, updateRawMaterial };
};
