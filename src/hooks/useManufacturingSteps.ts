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
        .eq('is_active', true)
        .order('step_order', { ascending: true });

      if (error) throw error;
      
      // Ensure proper ID casting and add debug logging
      const processedData = data.map(step => {
        console.log('Processing step:', step);
        console.log('Step ID raw:', step.id, 'Type:', typeof step.id);
        
        return {
          ...step,
          id: String(step.id), // Ensure ID is always a string
        } as ManufacturingStep;
      });
      
      console.log('Processed manufacturing steps:', processedData);
      return processedData;
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
      
      // Ensure proper ID casting
      const processedData = data.map(field => ({
        ...field,
        id: String(field.id),
        manufacturing_step_id: String(field.manufacturing_step_id),
      })) as ManufacturingStepField[];
      
      console.log('Processed step fields:', processedData);
      return processedData;
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
            id,
            step_name,
            step_order,
            description,
            qc_required,
            estimated_duration_hours,
            merchant_id,
            is_active,
            created_at,
            updated_at
          ),
          workers (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Ensure proper ID casting for nested data
      const processedData = data.map(orderStep => {
        const processed = {
          ...orderStep,
          id: String(orderStep.id),
          manufacturing_order_id: String(orderStep.manufacturing_order_id),
          manufacturing_step_id: String(orderStep.manufacturing_step_id),
        };
        
        if (processed.manufacturing_steps) {
          processed.manufacturing_steps = {
            ...processed.manufacturing_steps,
            id: String(processed.manufacturing_steps.id),
          };
        }
        
        return processed;
      }) as ManufacturingOrderStep[];
      
      console.log('Processed order steps:', processedData);
      return processedData;
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
      console.log('Saving step fields:', stepId, fields);
      
      // Get merchant ID first
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

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
          merchant_id: merchantId,
        }));

        const { error: insertError } = await supabase
          .from('manufacturing_step_fields')
          .insert(fieldsToInsert);

        if (insertError) throw insertError;
      }

      console.log('Step fields saved successfully');
      return true;
    },
    onSuccess: () => {
      // Invalidate all related queries immediately
      queryClient.invalidateQueries({ queryKey: ['manufacturing-step-fields'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing-steps'] });
      toast({
        title: 'Success',
        description: 'Step fields saved successfully',
      });
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
      console.log('Updating manufacturing step:', stepId, updates);
      
      const { data, error } = await supabase
        .from('manufacturing_steps')
        .update(updates)
        .eq('id', stepId)
        .select()
        .single();

      if (error) throw error;
      console.log('Manufacturing step updated successfully');
      return data;
    },
    onSuccess: () => {
      // Invalidate all related queries immediately
      queryClient.invalidateQueries({ queryKey: ['manufacturing-steps'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing-step-fields'] });
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
