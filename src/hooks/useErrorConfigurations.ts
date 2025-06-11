
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ErrorConfiguration {
  id: string;
  error_code: string;
  error_type: 'validation' | 'network' | 'auth' | 'system' | 'permission' | 'timeout';
  title: string;
  message: string;
  description?: string;
  possible_causes?: string[];
  action_items?: string[];
  is_retryable: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const useErrorConfigurations = () => {
  return useQuery({
    queryKey: ['error-configurations'],
    queryFn: async (): Promise<ErrorConfiguration[]> => {
      // Use type assertion to bypass TypeScript limitation with new table
      const { data, error } = await (supabase as any)
        .from('error_configurations')
        .select('*')
        .order('error_code');

      if (error) {
        console.error('Error fetching error configurations:', error);
        throw error;
      }

      return (data || []) as ErrorConfiguration[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useErrorConfiguration = (errorCode: string) => {
  return useQuery({
    queryKey: ['error-configuration', errorCode],
    queryFn: async (): Promise<ErrorConfiguration | null> => {
      // Use type assertion to bypass TypeScript limitation with new table
      const { data, error } = await (supabase as any)
        .from('error_configurations')
        .select('*')
        .eq('error_code', errorCode)
        .maybeSingle();

      if (error) {
        console.error('Error fetching error configuration:', error);
        throw error;
      }

      return data as ErrorConfiguration | null;
    },
    enabled: !!errorCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
