
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useManufacturingStepLogging } from './useManufacturingStepLogging';

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

export const useUpdateManufacturingStep = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { logStepStart, logStepComplete, logStepProgress, logStepAssignment } = useManufacturingStepLogging();

  return useMutation({
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
};
