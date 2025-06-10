
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Merchant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateMerchantData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export const useMerchant = () => {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMerchant = async () => {
    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      const { data: merchantData, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', merchantId)
        .single();

      if (error) throw error;

      setMerchant(merchantData);
    } catch (error) {
      console.error('Error fetching merchant:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch merchant information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMerchant = async (data: UpdateMerchantData) => {
    try {
      if (!merchant) return;

      const { error } = await supabase
        .from('merchants')
        .update(data)
        .eq('id', merchant.id);

      if (error) throw error;

      await fetchMerchant();
      
      toast({
        title: 'Success',
        description: 'Merchant information updated successfully',
      });
    } catch (error) {
      console.error('Error updating merchant:', error);
      toast({
        title: 'Error',
        description: 'Failed to update merchant information',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchMerchant();
  }, []);

  return { merchant, loading, refetch: fetchMerchant, updateMerchant };
};
