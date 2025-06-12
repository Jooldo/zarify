
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CreateManufacturingStepData {
  manufacturingOrderId: string;
  stepId: string;
  fieldValues: Record<string, any>;
}

export const useCreateManufacturingStep = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createStepMutation = useMutation({
    mutationFn: async (data: CreateManufacturingStepData) => {
      console.log('Creating manufacturing step:', data);
      
      try {
        // Get merchant ID
        const { data: merchantId, error: merchantError } = await supabase
          .rpc('get_user_merchant_id');

        if (merchantError) throw merchantError;

        // Create the manufacturing order step
        const stepToInsert = {
          manufacturing_order_id: data.manufacturingOrderId,
          manufacturing_step_id: data.stepId,
          status: 'in_progress' as const,
          assigned_worker_id: data.fieldValues.worker || null,
          progress_percentage: 0,
          merchant_id: merchantId,
        };

        const { data: step, error: insertError } = await supabase
          .from('manufacturing_order_steps')
          .insert(stepToInsert)
          .select(`
            *,
            manufacturing_steps (
              step_name,
              step_order,
              description,
              qc_required,
              estimated_duration_hours
            ),
            workers (
              id,
              name
            )
          `)
          .single();

        if (insertError) throw insertError;

        console.log('Manufacturing step created successfully:', step);
        return step;
      } catch (error) {
        console.error('Failed to create manufacturing step:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Step creation successful:', data);
      queryClient.invalidateQueries({ queryKey: ['manufacturing-order-steps'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      toast({
        title: 'Success',
        description: `${data.manufacturing_steps?.step_name} step started successfully`,
      });
    },
    onError: (error: any) => {
      console.error('Step creation failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to start manufacturing step',
        variant: 'destructive',
      });
    },
  });

  return {
    createStep: createStepMutation.mutate,
    isCreating: createStepMutation.isPending,
  };
};
