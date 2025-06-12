
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
  qc_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface ManufacturingStepField {
  id: string;
  manufacturing_step_id: string;
  field_id: string;
  field_name: string;
  field_label: string;
  field_type: 'worker' | 'date' | 'number' | 'text' | 'status' | 'multiselect';
  is_required: boolean;
  field_options?: any;
  merchant_id: string;
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

  const { data: stepFields = [], isLoading: isLoadingStepFields } = useQuery({
    queryKey: ['manufacturing-step-fields'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturing_step_fields')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ManufacturingStepField[];
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
            description,
            qc_required
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

  const saveStepFieldsMutation = useMutation({
    mutationFn: async ({ 
      stepId, 
      fields 
    }: { 
      stepId: string; 
      fields: any[] 
    }) => {
      // First, delete existing fields for this step
      const { error: deleteError } = await supabase
        .from('manufacturing_step_fields')
        .delete()
        .eq('manufacturing_step_id', stepId);

      if (deleteError) throw deleteError;

      // Then, insert new fields
      if (fields.length > 0) {
        const fieldsToInsert = fields.map(field => ({
          manufacturing_step_id: stepId,
          field_id: field.id,
          field_name: field.name,
          field_label: field.label,
          field_type: field.type,
          is_required: field.required,
          field_options: field.options || null,
        }));

        const { error: insertError } = await supabase
          .from('manufacturing_step_fields')
          .insert(fieldsToInsert);

        if (insertError) throw insertError;
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing-step-fields'] });
    },
    onError: (error) => {
      console.error('Error saving step fields:', error);
      toast({
        title: 'Error',
        description: 'Failed to save step field configuration',
        variant: 'destructive',
      });
    },
  });

  const updateStepMutation = useMutation({
    mutationFn: async ({ 
      stepId, 
      updates 
    }: { 
      stepId: string; 
      updates: Partial<ManufacturingStep> 
    }) => {
      const { data, error } = await supabase
        .from('manufacturing_steps')
        .update(updates)
        .eq('id', stepId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing-steps'] });
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

  const updateStep = (stepId: string, updates: Partial<ManufacturingStep>) => {
    return updateStepMutation.mutate({ stepId, updates });
  };

  const saveStepFields = (stepId: string, fields: any[]) => {
    return saveStepFieldsMutation.mutate({ stepId, fields });
  };

  return {
    manufacturingSteps,
    stepFields,
    orderSteps,
    isLoading: isLoading || isLoadingOrderSteps || isLoadingStepFields,
    updateOrderStep,
    updateStep,
    saveStepFields,
    isUpdating: updateOrderStepMutation.isPending || updateStepMutation.isPending || saveStepFieldsMutation.isPending,
  };
};
