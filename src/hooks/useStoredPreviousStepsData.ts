
import { useQuery } from '@tanstack/react-query';

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

      console.log('Stored previous steps data not available - using empty array');
      
      // Since the table doesn't exist in the database, return empty array
      return [];
    },
    enabled: !!stepId,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
};
