
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ManufacturingStep {
  id: string;
  step_name: string;
  step_order: number;
  description?: string;
  estimated_duration_hours: number;
  merchant_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ManufacturingOrderStep {
  id: string;
  manufacturing_order_id: string;
  manufacturing_step_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped';
  assigned_worker_id?: string;
  started_at?: string;
  completed_at?: string;
  progress_percentage: number;
  notes?: string;
  merchant_id: string;
  created_at: string;
  updated_at: string;
  manufacturing_steps?: ManufacturingStep;
  workers?: {
    id: string;
    name: string;
  };
}

export const useManufacturingSteps = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: manufacturingSteps = [], isLoading } = useQuery({
    queryKey: ['manufacturing-steps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturing_steps')
        .select('*')
        .order('step_order', { ascending: true });

      if (error) throw error;
      return data as ManufacturingStep[];
    },
  });

  const { data: orderSteps = [], isLoading: isLoadingOrderSteps } = useQuery({
    queryKey: ['manufacturing-order-steps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturing_order_steps')
        .select(`
          *,
          manufacturing_steps (
            step_name,
            step_order,
            description
          ),
          workers (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ManufacturingOrderStep[];
    },
  });

  const updateOrderStepMutation = useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<ManufacturingOrderStep> 
    }) => {
      const { data, error } = await supabase
        .from('manufacturing_order_steps')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing-order-steps'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      toast({
        title: 'Success',
        description: 'Manufacturing step updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating manufacturing step:', error);
      toast({
        title: 'Error',
        description: 'Failed to update manufacturing step',
        variant: 'destructive',
      });
    },
  });

  const updateOrderStep = (id: string, updates: Partial<ManufacturingOrderStep>) => {
    return updateOrderStepMutation.mutate({ id, updates });
  };

  return {
    manufacturingSteps,
    orderSteps,
    isLoading: isLoading || isLoadingOrderSteps,
    updateOrderStep,
    isUpdating: updateOrderStepMutation.isPending,
  };
};
