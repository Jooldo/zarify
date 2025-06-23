
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

        // Create the manufacturing order step data with instance tracking
        const stepToInsert = {
          merchant_id: merchantId,
          order_id: data.manufacturingOrderId,
          step_name: data.stepName,
          instance_number: nextInstanceNumber,
          parent_instance_id: data.fieldValues.parent_instance_id || null, // Use the parent instance ID
          status: 'in_progress' as const,
          assigned_worker: data.fieldValues.worker || null,
          quantity_assigned: 0,
          quantity_received: 0,
          weight_assigned: 0,
          weight_received: 0,
          purity: 0,
          wastage: 0,
          // Store source instance information if provided
          notes: data.fieldValues.sourceInstanceNumber 
            ? `Created from instance #${data.fieldValues.sourceInstanceNumber}` 
            : null,
        };

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
      toast({
        title: 'Success',
        description: `${data.step_name} step #${data.instance_number} started successfully`,
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
