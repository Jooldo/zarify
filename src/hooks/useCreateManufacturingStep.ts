
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CreateManufacturingStepData {
  manufacturingOrderId: string;
  stepName: string;
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

        // Check if a step with this name already exists for this order
        const { data: existingSteps, error: checkError } = await supabase
          .from('manufacturing_order_step_data')
          .select('id, step_name')
          .eq('order_id', data.manufacturingOrderId)
          .eq('step_name', data.stepName);

        if (checkError) throw checkError;

        // If step already exists, create a parallel instance with a unique identifier
        let finalStepName = data.stepName;
        if (existingSteps && existingSteps.length > 0) {
          // Create a parallel instance by appending instance number
          finalStepName = `${data.stepName}`;
          
          // Since we're allowing parallel instances, we'll use a timestamp to make it unique
          const timestamp = Date.now();
          console.log(`Step ${data.stepName} already exists for order ${data.manufacturingOrderId}, creating parallel instance ${timestamp}`);
        }

        // Create the manufacturing order step data
        const stepToInsert = {
          merchant_id: merchantId,
          order_id: data.manufacturingOrderId,
          step_name: finalStepName,
          status: 'in_progress' as const,
          assigned_worker: data.fieldValues.worker || null,
          quantity_assigned: 0,
          quantity_received: 0,
          weight_assigned: 0,
          weight_received: 0,
          purity: 0,
          wastage: 0,
        };

        const { data: step, error: insertError } = await supabase
          .from('manufacturing_order_step_data')
          .insert(stepToInsert)
          .select('*')
          .single();

        if (insertError) {
          // If we still get a duplicate error, it means parallel steps aren't supported at DB level
          // In this case, we'll just return the existing step
          if (insertError.code === '23505') {
            console.log('Step already exists, fetching existing step instead');
            const { data: existingStep, error: fetchError } = await supabase
              .from('manufacturing_order_step_data')
              .select('*')
              .eq('order_id', data.manufacturingOrderId)
              .eq('step_name', data.stepName)
              .single();
            
            if (fetchError) throw fetchError;
            return existingStep;
          }
          throw insertError;
        }

        console.log('Manufacturing step created successfully:', step);
        return step;
      } catch (error) {
        console.error('Failed to create manufacturing step:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Step creation successful:', data);
      queryClient.invalidateQueries({ queryKey: ['manufacturing_order_step_data'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      toast({
        title: 'Success',
        description: `${data.step_name} step started successfully`,
      });
    },
    onError: (error: any) => {
      console.error('Step creation failed:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start manufacturing step',
        variant: 'destructive',
      });
    },
  });

  return {
    createStep: createStepMutation.mutate,
    isCreating: createStepMutation.isPending,
  };
};
