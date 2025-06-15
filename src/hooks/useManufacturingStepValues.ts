
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';

export interface ManufacturingOrderStepValue {
  id: string;
  manufacturing_order_step_id: string;
  field_id: string;
  field_value: string;
  created_at: string;
  updated_at: string;
}

export const useManufacturingStepValues = () => {
  const { data: stepValues = [], isLoading } = useQuery({
    queryKey: ['manufacturing-order-step-values'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturing_order_step_values')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ManufacturingOrderStepValue[];
    },
  });

  const getStepValues = React.useCallback((stepId: string) => {
    return stepValues.filter(value => value.manufacturing_order_step_id === stepId);
  }, [stepValues]);

  const getStepValue = React.useCallback((stepId: string, fieldId: string) => {
    const value = stepValues.find(v => 
      v.manufacturing_order_step_id === stepId && v.field_id === fieldId
    );
    return value?.field_value;
  }, [stepValues]);

  return {
    stepValues,
    isLoading,
    getStepValues,
    getStepValue,
  };
};
