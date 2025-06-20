
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type ManufacturingStepValue = Tables<'manufacturing_order_step_values'>;

export const useManufacturingStepValues = () => {
  const queryClient = useQueryClient();
  
  const { data: stepValues = [], isLoading } = useQuery<ManufacturingStepValue[]>({
    queryKey: ['manufacturing-order-step-values'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturing_order_step_values')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  // Helper function to get a specific step value
  const getStepValue = (stepId: string, fieldId: string) => {
    return stepValues.find(
      value => value.manufacturing_order_step_id === stepId && value.field_id === fieldId
    )?.field_value || '';
  };

  // Helper function to get all values for a step
  const getStepValues = (stepId: string) => {
    return stepValues.filter(value => value.manufacturing_order_step_id === stepId);
  };

  // Real-time subscription for step values
  useEffect(() => {
    const channel = supabase
      .channel('step-values-realtime-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'manufacturing_order_step_values'
        },
        (payload) => {
          console.log('Real-time update for step values:', payload);
          queryClient.invalidateQueries({ queryKey: ['manufacturing-order-step-values'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { 
    stepValues, 
    isLoading, 
    getStepValue, 
    getStepValues 
  };
};
