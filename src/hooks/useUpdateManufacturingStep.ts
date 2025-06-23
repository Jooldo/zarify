
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
  assigned_worker?: string;
  dueDate?: string;
  notes?: string;
  updates?: Partial<Tables<'manufacturing_order_step_data'>>;
}

export const useUpdateManufacturingStep = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStepMutation = useMutation({
    mutationFn: async ({ stepId, fieldValues, status, progress, assigned_worker, dueDate, notes, updates, stepName, orderNumber }: UpdateStepParams) => {
      console.log('Updating step with ID:', stepId);
      console.log('Field values:', fieldValues);
      console.log('Status:', status);
      console.log('Progress:', progress);
      
      // Prepare the updates object
      const stepUpdates: Partial<Tables<'manufacturing_order_step_data'>> = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      if (status) {
        stepUpdates.status = status;
      }

      if (assigned_worker) {
        stepUpdates.assigned_worker = assigned_worker;
      }

      if (dueDate) {
        stepUpdates.due_date = dueDate;
      }

      if (notes) {
        stepUpdates.notes = notes;
      }

      if (status === 'completed') {
        stepUpdates.completed_at = new Date().toISOString();
      }

      if (status === 'in_progress' && !stepUpdates.started_at) {
        stepUpdates.started_at = new Date().toISOString();
      }

      // Handle field values - map them to the correct database columns
      if (fieldValues) {
        Object.entries(fieldValues).forEach(([fieldKey, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            // Map field keys to database columns
            switch (fieldKey) {
              case 'quantity_assigned':
                stepUpdates.quantity_assigned = parseFloat(value) || 0;
                break;
              case 'quantity_received':
                stepUpdates.quantity_received = parseFloat(value) || 0;
                break;
              case 'weight_assigned':
                stepUpdates.weight_assigned = parseFloat(value) || 0;
                break;
              case 'weight_received':
                stepUpdates.weight_received = parseFloat(value) || 0;
                break;
              case 'purity':
                stepUpdates.purity = parseFloat(value) || 0;
                break;
              case 'wastage':
                stepUpdates.wastage = parseFloat(value) || 0;
                break;
              case 'assigned_worker':
                stepUpdates.assigned_worker = value;
                break;
              case 'due_date':
                stepUpdates.due_date = value;
                break;
              default:
                // For any other custom fields, we could extend this logic
                console.log(`Unhandled field: ${fieldKey} with value: ${value}`);
                break;
            }
          }
        });
      }

      console.log('Final step updates:', stepUpdates);

      // Update the manufacturing order step
      const { data, error } = await supabase
        .from('manufacturing_order_step_data')
        .update(stepUpdates)
        .eq('id', stepId)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating manufacturing step:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['manufacturing_order_step_data'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      queryClient.invalidateQueries({ queryKey: ['merchant_step_config'] });

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
