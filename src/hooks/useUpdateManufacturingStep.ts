
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

export const useUpdateManufacturingStep = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStepMutation = useMutation({
    mutationFn: async ({ stepId, updates }: { stepId: string; updates: Partial<Tables<'manufacturing_order_steps'>> }) => {
      console.log('Updating step with ID:', stepId);
      
      const { data, error } = await supabase
        .from('manufacturing_order_steps')
        .update(updates)
        .eq('id', stepId)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating manufacturing step:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['manufacturing_order_steps_with_steps'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing_steps'] });
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
