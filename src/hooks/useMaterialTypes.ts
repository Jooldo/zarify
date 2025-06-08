
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
      
      // Get the current user's merchant_id first
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) {
        console.error('Error getting merchant ID:', merchantError);
        throw merchantError;
      }

      if (!merchantId) {
        console.log('No merchant ID found for user');
        setMaterialTypes([]);
        return;
      }

      console.log('Fetching material types for merchant:', merchantId);

      const { data, error } = await supabase
        .from('material_types')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      console.log('Fetched material types:', data);
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
      // Get the current user's merchant_id
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError || !merchantId) {
        throw new Error('Unable to get merchant ID');
      }

      console.log('Creating material type:', { name, description, merchantId });

      const { data, error } = await supabase
        .from('material_types')
        .insert([{ 
          name: name.trim(), 
          description: description?.trim() || '',
          merchant_id: merchantId
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('Material type created:', data);

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
