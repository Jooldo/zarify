
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StoredPreviousStepData {
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
    queryKey: ['manufacturing-step-previous-data', stepId],
    queryFn: async () => {
      if (!stepId) return [];

      console.log('Fetching stored previous steps data for step:', stepId);

      const { data, error } = await supabase
        .from('manufacturing_step_previous_data')
        .select('previous_steps_data')
        .eq('manufacturing_order_step_id', stepId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching stored previous steps data:', error);
        throw error;
      }

      if (!data?.previous_steps_data) {
        console.log('No stored previous steps data found');
        return [];
      }

      // Type guard to ensure we have the right data structure
      const isValidStepData = (item: any): item is StoredPreviousStepData => {
        return (
          typeof item === 'object' &&
          item !== null &&
          typeof item.stepName === 'string' &&
          typeof item.stepOrder === 'number' &&
          typeof item.status === 'string' &&
          typeof item.workerName === 'string' &&
          typeof item.missing === 'boolean' &&
          typeof item.fieldValues === 'object'
        );
      };

      try {
        const stepsArray = Array.isArray(data.previous_steps_data) 
          ? data.previous_steps_data 
          : [];

        const validSteps = stepsArray.filter(isValidStepData);
        
        console.log('Processed stored previous steps data:', validSteps);
        return validSteps;
      } catch (parseError) {
        console.error('Error parsing previous steps data:', parseError);
        return [];
      }
    },
    enabled: !!stepId,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
};
