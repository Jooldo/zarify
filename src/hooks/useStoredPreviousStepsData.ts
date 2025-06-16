
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

      // Safely cast the JSONB data to our expected type
      const previousStepsData = data.previous_steps_data as unknown;
      
      // Type guard to ensure we have an array
      if (!Array.isArray(previousStepsData)) {
        console.warn('Previous steps data is not an array:', previousStepsData);
        return [];
      }

      // Validate and type the array elements
      return previousStepsData.filter((item): item is StoredPreviousStepData => {
        return (
          typeof item === 'object' &&
          item !== null &&
          'stepName' in item &&
          'stepOrder' in item &&
          'status' in item &&
          'fieldValues' in item &&
          'missing' in item
        );
      });
    },
    enabled: !!stepId,
  });
};
