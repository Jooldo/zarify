import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RawMaterial {
  id: string;
  merchant_id: string;
  name: string;
  type: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
  cost_per_unit?: number;
  supplier_id?: string;
  required_quantity: number;
  in_procurement: number;
  last_updated: string;
  created_at: string;
  supplier?: {
    company_name: string;
  };
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
        setRawMaterials([]);
        return;
      }

      console.log('Fetching raw materials for merchant:', merchantId);

      const { data, error } = await supabase
        .from('raw_materials')
        .select(`
          *,
          supplier:supplier_id (
            company_name
          )
        `)
        .eq('merchant_id', merchantId)
        .order('name');

      if (error) throw error;

      console.log('Fetched raw materials:', data);
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

  const createRawMaterial = async (data: CreateRawMaterialData) => {
    try {
      // Get the current user's merchant_id
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError || !merchantId) {
        throw new Error('Unable to get merchant ID');
      }

      console.log('Creating raw material:', { ...data, merchantId });

      const { data: newMaterial, error } = await supabase
        .from('raw_materials')
        .insert([{ 
          ...data, 
          merchant_id: merchantId,
          required_quantity: 0,
          in_procurement: 0,
          last_updated: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('Raw material created:', newMaterial);

      toast({
        title: 'Success',
        description: 'Raw material created successfully',
      });

      fetchRawMaterials();
      return newMaterial;
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

  useEffect(() => {
    fetchRawMaterials();
  }, []);

  return {
    rawMaterials,
    loading,
    refetch: fetchRawMaterials,
    createRawMaterial,
  };
};
