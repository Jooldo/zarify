
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

interface StoredPreviousStepData {
  stepName: string;
  stepOrder: number;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  workerName: string;
  fieldValues: Record<string, string>;
  missing: boolean;
}

export const useStoredPreviousStepsData = (stepId: string | null) => {
  return useQuery({
    queryKey: ['stored_previous_steps_data', stepId],
    queryFn: async () => {
      if (!stepId) return [];

      const { data, error } = await supabase
        .from('manufacturing_step_previous_data')
        .select('previous_steps_data')
        .eq('manufacturing_order_step_id', stepId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching stored previous steps data:', error);
        throw error;
      }

      if (!data) return [];

      return (data.previous_steps_data as StoredPreviousStepData[]) || [];
    },
    enabled: !!stepId,
  });
};
