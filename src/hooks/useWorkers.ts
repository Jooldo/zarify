
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Worker {
  id: string;
  name: string;
  role?: string;
  contact_number?: string;
  status: 'Active' | 'Inactive';
  joined_date?: string;
  notes?: string;
  merchant_id: string;
}

export const useWorkers = () => {
  const { data: workers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['workers'],
    queryFn: async () => {
      console.log('Fetching workers...');
      
      // Get current user's merchant ID
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) {
        console.error('Error getting merchant ID:', merchantError);
        throw merchantError;
      }

      console.log('Merchant ID:', merchantId);

      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('status', 'Active')
        .order('name');

      if (error) {
        console.error('Error fetching workers:', error);
        throw error;
      }

      console.log('Fetched workers:', data?.length || 0);
      return data as Worker[];
    },
  });

  return {
    workers,
    isLoading,
    error,
    refetch,
  };
};
