
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MerchantStep {
  id: string;
  merchant_id: string;
  step_name: string;
  step_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MerchantStepFieldConfig {
  id: string;
  merchant_id: string;
  step_name: string;
  field_key: string;
  is_visible: boolean;
  unit?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateStepData {
  step_name: string;
  step_order: number;
}

export interface FieldConfigUpdate {
  step_name: string;
  field_key: string;
  is_visible: boolean;
  unit?: string;
}

export const useMerchantStepConfig = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: steps = [], isLoading: stepsLoading } = useQuery<MerchantStep[]>({
    queryKey: ['merchant-step-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merchant_step_config')
        .select('*')
        .order('step_order');

      if (error) throw error;
      return data || [];
    },
  });

  const { data: fieldConfigs = [], isLoading: fieldConfigsLoading } = useQuery<MerchantStepFieldConfig[]>({
    queryKey: ['merchant-step-field-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merchant_step_field_config')
        .select('*')
        .order('step_name, field_key');

      if (error) throw error;
      return data || [];
    },
  });

  const createStepMutation = useMutation({
    mutationFn: async (stepData: CreateStepData) => {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      const { data, error } = await supabase
        .from('merchant_step_config')
        .insert({
          merchant_id: merchantId,
          step_name: stepData.step_name,
          step_order: stepData.step_order,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Manufacturing step created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['merchant-step-config'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create manufacturing step',
        variant: 'destructive',
      });
    },
  });

  const deleteStepMutation = useMutation({
    mutationFn: async (stepId: string) => {
      const { error } = await supabase
        .from('merchant_step_config')
        .delete()
        .eq('id', stepId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Manufacturing step deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['merchant-step-config'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-step-field-config'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete manufacturing step',
        variant: 'destructive',
      });
    },
  });

  const getVisibleFieldsForStep = (stepName: string) => {
    return fieldConfigs
      .filter(config => config.step_name === stepName && config.is_visible)
      .map(config => config.field_key);
  };

  const isFieldVisible = (stepName: string, fieldKey: string) => {
    const config = fieldConfigs.find(
      c => c.step_name === stepName && c.field_key === fieldKey
    );
    return config?.is_visible || false;
  };

  const getFieldUnit = (stepName: string, fieldKey: string) => {
    const config = fieldConfigs.find(
      c => c.step_name === stepName && c.field_key === fieldKey
    );
    return config?.unit || '';
  };

  return {
    steps,
    fieldConfigs,
    isLoading: stepsLoading || fieldConfigsLoading,
    createStep: createStepMutation.mutate,
    deleteStep: deleteStepMutation.mutate,
    getVisibleFieldsForStep,
    isFieldVisible,
    getFieldUnit,
    isCreatingStep: createStepMutation.isPending,
    isDeletingStep: deleteStepMutation.isPending,
  };
};
