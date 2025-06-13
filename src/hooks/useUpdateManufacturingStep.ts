
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UpdateManufacturingStepData {
  stepId: string;
  fieldValues: Record<string, any>;
  status?: string;
  progress?: number;
}

export const useUpdateManufacturingStep = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStepMutation = useMutation({
    mutationFn: async (data: UpdateManufacturingStepData) => {
      console.log('Updating manufacturing step:', data);
      
      try {
        // Get merchant ID
        const { data: merchantId, error: merchantError } = await supabase
          .rpc('get_user_merchant_id');

        if (merchantError) throw merchantError;

        // Update the manufacturing order step if status or progress changed
        if (data.status !== undefined || data.progress !== undefined) {
          const updates: any = {};
          if (data.status !== undefined) updates.status = data.status;
          if (data.progress !== undefined) updates.progress_percentage = data.progress;
          if (data.fieldValues.worker) updates.assigned_worker_id = data.fieldValues.worker;

          const { error: updateError } = await supabase
            .from('manufacturing_order_steps')
            .update(updates)
            .eq('id', data.stepId);

          if (updateError) throw updateError;
        }

        // Update field values
        if (data.fieldValues && Object.keys(data.fieldValues).length > 0) {
          // Delete existing values for this step
          const { error: deleteError } = await supabase
            .from('manufacturing_order_step_values')
            .delete()
            .eq('manufacturing_order_step_id', data.stepId);

          if (deleteError) throw deleteError;

          // Insert new values - handle empty values properly
          const fieldValuesToInsert = Object.entries(data.fieldValues)
            .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
            .map(([fieldId, value]) => ({
              manufacturing_order_step_id: data.stepId,
              field_id: fieldId,
              field_value: String(value), // Always convert to string
              merchant_id: merchantId,
            }));

          if (fieldValuesToInsert.length > 0) {
            const { error: valuesError } = await supabase
              .from('manufacturing_order_step_values')
              .insert(fieldValuesToInsert);

            if (valuesError) throw valuesError;
          }
        }

        console.log('Manufacturing step updated successfully');
        return data;
      } catch (error) {
        console.error('Failed to update manufacturing step:', error);
        throw error;
      }
    },
    onSuccess: async (data) => {
      console.log('Update successful, invalidating queries...');
      
      // Invalidate and refetch all related queries immediately
      await queryClient.invalidateQueries({ queryKey: ['manufacturing-order-step-values'] });
      await queryClient.invalidateQueries({ queryKey: ['manufacturing-order-steps'] });
      await queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      
      // Force immediate refetch
      await queryClient.refetchQueries({ 
        queryKey: ['manufacturing-order-step-values'],
      });
      
      console.log('All queries refreshed');
      
      toast({
        title: 'Success',
        description: 'Manufacturing step updated successfully',
      });
    },
    onError: (error: any) => {
      console.error('Step update failed:', error);
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
