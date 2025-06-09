
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProductionStepHistory } from './useProductionTasks';

export const useProductionStepHistory = (taskId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stepHistory = [], isLoading, error } = useQuery({
    queryKey: ['production-step-history', taskId],
    queryFn: async () => {
      if (!taskId) return [];

      const { data, error } = await supabase
        .from('production_step_history')
        .select('*')
        .eq('production_task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching step history:', error);
        throw error;
      }

      return data as ProductionStepHistory[];
    },
    enabled: !!taskId,
  });

  const createStepHistoryMutation = useMutation({
    mutationFn: async (stepHistory: Omit<ProductionStepHistory, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('production_step_history')
        .insert([stepHistory])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-step-history'] });
    },
    onError: (error) => {
      console.error('Error creating step history:', error);
      toast({
        title: 'Error',
        description: 'Failed to create step history',
        variant: 'destructive',
      });
    },
  });

  const updateStepHistoryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ProductionStepHistory> }) => {
      const { data, error } = await supabase
        .from('production_step_history')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-step-history'] });
    },
    onError: (error) => {
      console.error('Error updating step history:', error);
      toast({
        title: 'Error',
        description: 'Failed to update step history',
        variant: 'destructive',
      });
    },
  });

  return {
    stepHistory,
    isLoading,
    error,
    createStepHistory: createStepHistoryMutation.mutate,
    updateStepHistory: updateStepHistoryMutation.mutate,
    isCreating: createStepHistoryMutation.isPending,
    isUpdating: updateStepHistoryMutation.isPending,
  };
};
