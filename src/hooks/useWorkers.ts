
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
}

export const useWorkers = () => {
  const { data: workers = [], isLoading, error } = useQuery({
    queryKey: ['workers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('status', 'Active')
        .order('name');

      if (error) {
        console.error('Error fetching workers:', error);
        throw error;
      }

      return data as Worker[];
    },
  });

  return {
    workers,
    isLoading,
    error,
  };
};
