
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useManufacturingStepLogging } from './useManufacturingStepLogging';
import { useMerchant } from '@/hooks/useMerchant';

interface UpdateStepData {
  stepId: string;
  updates: {
    status?: 'pending' | 'in_progress' | 'completed';
    progress_percentage?: number;
    assigned_worker_id?: string;
    notes?: string;
    started_at?: string;
    completed_at?: string;
  };
  stepName?: string;
  orderNumber?: string;
  workerName?: string;
}

interface UpdateStepParams {
  stepId: string;
  fieldValues?: Record<string, any>;
  status?: 'pending' | 'in_progress' | 'completed';
  progress?: number;
  assignedWorkerId?: string;
  notes?: string;
  stepName?: string;
  orderNumber?: string;
  workerName?: string;
}

export const useUpdateManufacturingStep = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { merchant } = useMerchant();
  const { logStepStart, logStepComplete, logStepProgress, logStepAssignment } = useManufacturingStepLogging();

  const mutation = useMutation({
    mutationFn: async ({ stepId, updates, stepName, orderNumber, workerName }: UpdateStepData) => {
      const { data, error } = await supabase
        .from('manufacturing_order_steps')
        .update(updates)
        .eq('id', stepId)
        .select(`
          *,
          manufacturing_orders!inner(order_number, product_name),
          manufacturing_steps!inner(step_name)
        `)
        .single();

      if (error) throw error;

      // Log activities based on what was updated
      const currentStepName = stepName || data.manufacturing_steps.step_name;
      const currentOrderNumber = orderNumber || data.manufacturing_orders.order_number;

      if (updates.status === 'in_progress' && updates.started_at) {
        await logStepStart(stepId, data.manufacturing_order_id, currentStepName, currentOrderNumber);
      }

      if (updates.status === 'completed' && updates.completed_at) {
        await logStepComplete(stepId, data.manufacturing_order_id, currentStepName, currentOrderNumber);
      }

      if (updates.progress_percentage !== undefined) {
        await logStepProgress(stepId, data.manufacturing_order_id, currentStepName, currentOrderNumber, updates.progress_percentage);
      }

      if (updates.assigned_worker_id && workerName) {
        await logStepAssignment(stepId, data.manufacturing_order_id, currentStepName, currentOrderNumber, workerName);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing-order-steps'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing-step-previous-data'] });
      toast({
        title: 'Success',
        description: 'Manufacturing step updated successfully',
      });
    },
    onError: (error: any) => {
      console.error('Error updating manufacturing step:', error);
      toast({
        title: 'Error',
        description: 'Failed to update manufacturing step',
        variant: 'destructive',
      });
    },
  });

  const updateStep = async (params: UpdateStepParams) => {
    if (!merchant?.id) {
      console.error('No merchant ID available');
      toast({
        title: 'Error',
        description: 'Merchant information not available',
        variant: 'destructive',
      });
      return;
    }

    const updates: UpdateStepData['updates'] = {};
    
    if (params.status) {
      updates.status = params.status;
      if (params.status === 'in_progress') {
        updates.started_at = new Date().toISOString();
      } else if (params.status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }
    }
    
    if (params.progress !== undefined) {
      updates.progress_percentage = params.progress;
    }
    
    if (params.assignedWorkerId) {
      updates.assigned_worker_id = params.assignedWorkerId;
    }
    
    if (params.notes) {
      updates.notes = params.notes;
    }

    // Save field values if provided
    if (params.fieldValues) {
      try {
        console.log('Saving field values:', params.fieldValues);
        
        // First, delete existing values for this step
        const { error: deleteError } = await supabase
          .from('manufacturing_order_step_values')
          .delete()
          .eq('manufacturing_order_step_id', params.stepId);

        if (deleteError) {
          console.error('Error deleting existing values:', deleteError);
        }

        // Then insert new values with proper merchant_id
        const valuesToInsert = Object.entries(params.fieldValues)
          .filter(([_, value]) => value !== undefined && value !== null && value !== '')
          .map(([fieldId, value]) => ({
            manufacturing_order_step_id: params.stepId,
            field_id: fieldId,
            field_value: String(value),
            merchant_id: merchant.id
          }));

        console.log('Values to insert:', valuesToInsert);

        if (valuesToInsert.length > 0) {
          const { error: valuesError } = await supabase
            .from('manufacturing_order_step_values')
            .insert(valuesToInsert);

          if (valuesError) {
            console.error('Error saving field values:', valuesError);
            throw valuesError;
          } else {
            console.log('Field values saved successfully');
          }
        }
      } catch (error) {
        console.error('Error managing field values:', error);
        toast({
          title: 'Error',
          description: 'Failed to save field values',
          variant: 'destructive',
        });
        throw error;
      }
    }

    return mutation.mutate({
      stepId: params.stepId,
      updates,
      stepName: params.stepName,
      orderNumber: params.orderNumber,
      workerName: params.workerName
    });
  };

  return {
    updateStep,
    isUpdating: mutation.isPending,
    mutation
  };
};
