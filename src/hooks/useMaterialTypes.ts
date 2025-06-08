
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MaterialType {
  id: string;
  merchant_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useMaterialTypes = () => {
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMaterialTypes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('material_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      setMaterialTypes(data || []);
    } catch (error) {
      console.error('Error fetching material types:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch material types',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createMaterialType = async (name: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from('material_types')
        .insert([{ name, description }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Material type created successfully',
      });

      fetchMaterialTypes();
      return data;
    } catch (error) {
      console.error('Error creating material type:', error);
      toast({
        title: 'Error',
        description: 'Failed to create material type',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchMaterialTypes();
  }, []);

  return {
    materialTypes,
    loading,
    refetch: fetchMaterialTypes,
    createMaterialType,
  };
};
