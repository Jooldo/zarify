
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { createBatchFromStep, CreateBatchStepData } from '@/services/manufacturingBatchService';

export const useCreateBatchFromStep = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createBatchMutation = useMutation({
    mutationFn: async (data: CreateBatchStepData) => {
      return await createBatchFromStep(data);
    },
    onSuccess: (data) => {
      console.log('Batch creation successful:', data);
      
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['manufacturing-order-steps'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing_order_steps_with_steps'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing-order-step-values'] });
      
      toast({
        title: 'Success',
        description: `New ${data.manufacturing_steps?.step_name} batch started successfully`,
      });
    },
    onError: (error: any) => {
      console.error('Batch creation failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to start new manufacturing batch',
        variant: 'destructive',
      });
    },
  });

  return {
    createBatch: createBatchMutation.mutate,
    isCreating: createBatchMutation.isPending,
  };
};
