
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

interface UpdateStepParams {
  stepId: string;
  fieldValues?: Record<string, any>;
  status?: string;
  progress?: number;
  stepName?: string;
  orderNumber?: string;
  updates?: Partial<Tables<'manufacturing_order_steps'>>;
}

export const useUpdateManufacturingStep = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStepMutation = useMutation({
    mutationFn: async ({ stepId, fieldValues, status, progress, updates, stepName, orderNumber }: UpdateStepParams) => {
      console.log('Updating step with ID:', stepId);
      console.log('Field values:', fieldValues);
      console.log('Status:', status);
      console.log('Progress:', progress);
      
      // Prepare the updates object
      const stepUpdates: Partial<Tables<'manufacturing_order_steps'>> = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      if (status) {
        stepUpdates.status = status;
      }

      if (progress !== undefined) {
        stepUpdates.progress_percentage = progress;
      }

      if (status === 'completed') {
        stepUpdates.completed_at = new Date().toISOString();
      }

      if (status === 'in_progress' && !stepUpdates.started_at) {
        stepUpdates.started_at = new Date().toISOString();
      }

      // Update the manufacturing order step
      const { data, error } = await supabase
        .from('manufacturing_order_steps')
        .update(stepUpdates)
        .eq('id', stepId)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating manufacturing step:', error);
        throw error;
      }

      // Save field values if provided
      if (fieldValues && Object.keys(fieldValues).length > 0) {
        console.log('Saving field values:', fieldValues);
        
        // Get merchant ID
        const { data: merchantId, error: merchantError } = await supabase
          .rpc('get_user_merchant_id');

        if (merchantError) {
          console.error('Error getting merchant ID:', merchantError);
          throw merchantError;
        }

        // Delete existing field values for this step
        await supabase
          .from('manufacturing_order_step_values')
          .delete()
          .eq('manufacturing_order_step_id', stepId);

        // Insert new field values
        const fieldValueInserts = Object.entries(fieldValues).map(([fieldId, value]) => ({
          manufacturing_order_step_id: stepId,
          field_id: fieldId,
          field_value: String(value),
          merchant_id: merchantId
        }));

        if (fieldValueInserts.length > 0) {
          const { error: fieldError } = await supabase
            .from('manufacturing_order_step_values')
            .insert(fieldValueInserts);

          if (fieldError) {
            console.error('Error saving field values:', fieldError);
            throw fieldError;
          }
        }
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['manufacturing_order_steps_with_steps'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing_steps'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing-order-step-values'] });

      // Show success toast
      const { stepName, orderNumber } = variables;
      if (stepName && orderNumber) {
        toast({
          title: 'Success',
          description: `${stepName} updated successfully for ${orderNumber}`,
        });
      } else {
        toast({
          title: 'Success',
          description: 'Manufacturing step updated successfully',
        });
      }
    },
    onError: (error: any) => {
      console.error('Error in updateStepMutation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update manufacturing step',
        variant: 'destructive',
      });
    },
  });

  return {
    updateStep: updateStepMutation.mutate,
    isUpdating: updateStepMutation.isPending,
  };
};
