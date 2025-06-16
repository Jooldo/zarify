
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ManufacturingOrderStepValue {
  id: string;
  manufacturing_order_step_id: string;
  field_id: string;
  field_value: string;
  created_at: string;
  updated_at: string;
}

export const useManufacturingStepValues = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const saveStepValueMutation = useMutation({
    mutationFn: async ({ stepId, fieldId, value }: { stepId: string; fieldId: string; value: string }) => {
      const { data, error } = await supabase
        .from('manufacturing_order_step_values')
        .upsert({
          manufacturing_order_step_id: stepId,
          field_id: fieldId,
          field_value: value,
        }, {
          onConflict: 'manufacturing_order_step_id,field_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing-order-step-values'] });
    },
    onError: (error: any) => {
      console.error('Error saving step value:', error);
      toast({
        title: 'Error',
        description: 'Failed to save step value',
        variant: 'destructive',
      });
    },
  });

  const getStepValues = (stepId: string) => {
    return stepValues.filter(value => value.manufacturing_order_step_id === stepId);
  };

  const getStepValue = (stepId: string, fieldId: string) => {
    const value = stepValues.find(v => 
      v.manufacturing_order_step_id === stepId && v.field_id === fieldId
    );
    return value?.field_value || '';
  };

  const saveStepValue = async (stepId: string, fieldId: string, value: string) => {
    return saveStepValueMutation.mutateAsync({ stepId, fieldId, value });
  };

  return {
    stepValues,
    isLoading,
    getStepValues,
    getStepValue,
    saveStepValue,
  };
};
