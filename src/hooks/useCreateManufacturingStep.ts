
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

        // Get the next instance number for this step
        const { data: nextInstanceNumber, error: instanceError } = await supabase
          .rpc('get_next_step_instance_number', {
            p_order_id: data.manufacturingOrderId,
            p_step_name: data.stepName
          });

        if (instanceError) throw instanceError;

        console.log(`Creating ${data.stepName} instance #${nextInstanceNumber} for order ${data.manufacturingOrderId}`);
        
        // Log the source instance information for debugging
        if (data.fieldValues.sourceInstanceNumber) {
          console.log(`This step originates from instance #${data.fieldValues.sourceInstanceNumber}`);
        }

        // Get manufacturing steps to determine step order
        const { data: manufacturingSteps, error: stepsError } = await supabase
          .from('merchant_step_config')
          .select('step_name, step_order')
          .eq('merchant_id', merchantId)
          .eq('is_active', true);

        if (stepsError) throw stepsError;

        // Determine origin_step_id propagation
        let originStepId = data.fieldValues.origin_step_id || null;
        
        // If parent has origin_step_id, check if we should propagate it
        if (data.fieldValues.parent_instance_id && !originStepId) {
          // Get parent step data
          const { data: parentStep, error: parentError } = await supabase
            .from('manufacturing_order_step_data')
            .select('origin_step_id, step_name')
            .eq('id', data.fieldValues.parent_instance_id)
            .single();

          if (!parentError && parentStep?.origin_step_id) {
            // Get origin step details to determine step order
            const { data: originStep, error: originError } = await supabase
              .from('manufacturing_order_step_data')
              .select('step_name')
              .eq('id', parentStep.origin_step_id)
              .single();

            if (!originError && originStep) {
              const currentStepConfig = manufacturingSteps.find(s => s.step_name === data.stepName);
              const originStepConfig = manufacturingSteps.find(s => s.step_name === originStep.step_name);
              
              // Only propagate origin_step_id if current step order <= origin step order
              if (currentStepConfig && originStepConfig && 
                  currentStepConfig.step_order <= originStepConfig.step_order) {
                originStepId = parentStep.origin_step_id;
                console.log(`Propagating origin_step_i ${originStepId} to ${data.stepName} (step order ${currentStepConfig.step_order} <= ${originStepConfig.step_order})`);
              } else {
                console.log(`Not propagating origin_step_id - ${data.stepName} has progressed beyond origin step`);
              }
            }
          }
        }

        // Create the manufacturing order step data with instance tracking
        const stepToInsert = {
          merchant_id: merchantId,
          order_id: data.manufacturingOrderId,
          step_name: data.stepName,
          instance_number: nextInstanceNumber,
          parent_instance_id: data.fieldValues.parent_instance_id || null,
          status: data.fieldValues.status || 'in_progress',
          assigned_worker: data.fieldValues.worker || null,
          quantity_assigned: data.fieldValues.quantity_assigned || 0,
          quantity_received: 0,
          weight_assigned: data.fieldValues.weight_assigned || 0,
          weight_received: 0,
          purity: 0,
          wastage: 0,
          is_rework: data.fieldValues.is_rework || false,
          origin_step_id: originStepId,
          // Store source instance information if provided
          notes: data.fieldValues.sourceInstanceNumber 
            ? `Created from instance #${data.fieldValues.sourceInstanceNumber}` 
            : (data.fieldValues.is_rework ? 'Created as rework instance' : null),
        };

        console.log('Step data to insert:', stepToInsert);

        const { data: step, error: insertError } = await supabase
          .from('manufacturing_order_step_data')
          .insert(stepToInsert)
          .select('*')
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
      queryClient.invalidateQueries({ queryKey: ['manufacturing_order_step_data'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      const stepType = data.is_rework ? 'rework' : 'regular';
      toast({
        title: 'Success',
        description: `${data.step_name} ${stepType} step #${data.instance_number} started successfully`,
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
