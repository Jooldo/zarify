
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MasterField {
  id: string;
  field_key: string;
  label: string;
  data_type: 'number' | 'boolean' | 'worker' | 'text' | 'date' | 'decimal';
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useMasterFields = () => {
  const { data: masterFields = [], isLoading } = useQuery<MasterField[]>({
    queryKey: ['master_field_list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('master_field_list')
        .select('*')
        .eq('is_active', true)
        .order('field_key');

      if (error) throw error;
      
      // Transform the data to match our interface, ensuring data_type is properly typed
      const transformedData: MasterField[] = (data || []).map(field => ({
        ...field,
        data_type: field.data_type as MasterField['data_type']
      }));
      
      return transformedData;
    },
  });

  return { masterFields, isLoading };
};
