
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
      console.log('Updating manufacturing step with data:', data);
      
      try {
        // Get merchant ID
        const { data: merchantId, error: merchantError } = await supabase
          .rpc('get_user_merchant_id');

        if (merchantError) {
          console.error('Error getting merchant ID:', merchantError);
          throw merchantError;
        }

        // Update the manufacturing order step if status or progress changed
        if (data.status !== undefined || data.progress !== undefined) {
          const updates: any = {};
          if (data.status !== undefined) updates.status = data.status;
          if (data.progress !== undefined) updates.progress_percentage = data.progress;
          
          // Handle worker assignment from field values
          if (data.fieldValues.worker) {
            updates.assigned_worker_id = data.fieldValues.worker;
          }

          console.log('Updating step with:', updates);

          const { error: updateError } = await supabase
            .from('manufacturing_order_steps')
            .update(updates)
            .eq('id', data.stepId);

          if (updateError) {
            console.error('Error updating order step:', updateError);
            throw updateError;
          }
        }

        // Always update field values - first delete existing ones
        console.log('Deleting existing field values for step:', data.stepId);
        const { error: deleteError } = await supabase
          .from('manufacturing_order_step_values')
          .delete()
          .eq('manufacturing_order_step_id', data.stepId);

        if (deleteError) {
          console.error('Error deleting existing values:', deleteError);
          throw deleteError;
        }

        // Insert new field values (only non-empty ones)
        if (data.fieldValues && Object.keys(data.fieldValues).length > 0) {
          const fieldValuesToInsert = Object.entries(data.fieldValues)
            .filter(([_, value]) => {
              // Only include non-empty values
              return value !== '' && value !== null && value !== undefined;
            })
            .map(([fieldId, value]) => ({
              manufacturing_order_step_id: data.stepId,
              field_id: fieldId,
              field_value: String(value),
              merchant_id: merchantId,
            }));

          console.log('Inserting field values:', fieldValuesToInsert);

          if (fieldValuesToInsert.length > 0) {
            const { error: valuesError } = await supabase
              .from('manufacturing_order_step_values')
              .insert(fieldValuesToInsert);

            if (valuesError) {
              console.error('Error inserting field values:', valuesError);
              throw valuesError;
            }
          }
        }

        console.log('Manufacturing step updated successfully');
        return data;
      } catch (error) {
        console.error('Failed to update manufacturing step:', error);
        throw error;
      }
    },
    onSuccess: async () => {
      console.log('Update successful, refreshing data...');
      
      // Invalidate all related queries
      await queryClient.invalidateQueries({ queryKey: ['manufacturing-order-step-values'] });
      await queryClient.invalidateQueries({ queryKey: ['manufacturing-order-steps'] });
      await queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      
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
