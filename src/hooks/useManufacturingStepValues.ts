
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ManufacturingStepValue {
  id: string;
  order_id: string;
  step_name: string;
  field_key: string;
  field_value: string;
  merchant_id: string;
  created_at: string;
  updated_at: string;
}

export const useManufacturingStepValues = () => {
  const queryClient = useQueryClient();
  
  const { data: stepValues = [], isLoading } = useQuery<ManufacturingStepValue[]>({
    queryKey: ['manufacturing-step-values'],
    queryFn: async () => {
      // For now, return empty array since we don't have the step values table
      return [];
    },
  });

  // Helper function to get a specific step value
  const getStepValue = (stepId: string, fieldId: string) => {
    return stepValues.find(
      value => value.order_id === stepId && value.field_key === fieldId
    )?.field_value || '';
  };

  // Helper function to get all values for a step
  const getStepValues = (stepId: string) => {
    return stepValues.filter(value => value.order_id === stepId);
  };

  return { 
    stepValues, 
    isLoading, 
    getStepValue, 
    getStepValues 
  };
};
