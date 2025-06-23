
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MasterField {
  id: string;
  field_key: string;
  label: string;
  data_type: 'number' | 'decimal' | 'text' | 'date' | 'boolean' | 'worker';
  description?: string;
  is_active: boolean;
}

export const useMasterFields = () => {
  const { data: masterFields = [], isLoading, error } = useQuery<MasterField[]>({
    queryKey: ['master-fields'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('master_field_list')
        .select('*')
        .eq('is_active', true)
        .order('field_key');

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes since this rarely changes
  });

  return {
    masterFields,
    isLoading,
    error,
  };
};
