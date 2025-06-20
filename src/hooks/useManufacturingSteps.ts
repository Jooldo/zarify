
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type ManufacturingStep = Tables<'manufacturing_steps'>;
export type ManufacturingStepField = Omit<Tables<'manufacturing_step_fields'>, 'field_options'> & {
  field_options: { unit?: string; options?: string[] } | null;
};
export type ManufacturingOrderStep = Tables<'manufacturing_order_steps'> & {
  manufacturing_steps: ManufacturingStep | null;
  workers?: { name: string | null } | null;
};
export type ManufacturingStepWithOrderStep = ManufacturingStep & {
    order_step: ManufacturingOrderStep | null;
};

export const useManufacturingSteps = () => {
  const queryClient = useQueryClient();
  
  const { data: manufacturingSteps = [], isLoading: isLoadingSteps } = useQuery<Tables<'manufacturing_steps'>[]>({
    queryKey: ['manufacturing_steps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturing_steps')
        .select('*')
        .order('step_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: orderSteps = [], isLoading: isLoadingOrderSteps } = useQuery<ManufacturingOrderStep[]>({
    queryKey: ['manufacturing_order_steps_with_steps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturing_order_steps')
        .select('*, manufacturing_steps(*), workers(name)');
      if (error) {
        console.error("Error fetching order steps with manufacturing steps", error);
        throw error;
      }
      return (data as ManufacturingOrderStep[]) || [];
    },
  });

  const { data: stepFields = [], isLoading: isLoadingStepFields } = useQuery<ManufacturingStepField[]>({
    queryKey: ['manufacturing_step_fields'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturing_step_fields')
        .select('*');
      if (error) throw error;
      return (data as ManufacturingStepField[]) || [];
    }
  });

  // Real-time subscription for manufacturing order steps
  useEffect(() => {
    const channelName = `manufacturing-steps-realtime-${Date.now()}-${Math.random()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'manufacturing_order_steps'
        },
        (payload) => {
          console.log('Real-time update for manufacturing_order_steps:', payload);
          queryClient.invalidateQueries({ queryKey: ['manufacturing_order_steps_with_steps'] });
          queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const getStepFields = (stepId: string) => {
    return stepFields.filter(field => field.manufacturing_step_id === stepId);
  };
  
  const isLoading = isLoadingSteps || isLoadingOrderSteps || isLoadingStepFields;

  const updateStep = async (stepId: string, updates: Partial<Tables<'manufacturing_steps'>>) => {
    const { error } = await supabase
      .from('manufacturing_steps')
      .update(updates)
      .eq('id', stepId);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: ['manufacturing_steps'] });
  };
  
  const saveStepFields = async (stepId: string, fields: any[]) => {
    const step = manufacturingSteps.find(s => s.id === stepId);
    let merchant_id = step?.merchant_id;

    if (!merchant_id) {
        const { data: fetchedStep, error: fetchError } = await supabase.from('manufacturing_steps').select('merchant_id').eq('id', stepId).single();
        if(fetchError || !fetchedStep) throw fetchError || new Error("Step not found");
        merchant_id = fetchedStep.merchant_id;
    }
      
    await supabase.from('manufacturing_step_fields').delete().eq('manufacturing_step_id', stepId);

    if (fields.length > 0) {
        const newFields = fields.map(field => ({
            manufacturing_step_id: stepId,
            merchant_id: merchant_id,
            field_id: field.id,
            field_name: field.name,
            field_label: field.label,
            field_type: field.type,
            is_required: field.required,
            field_options: field.options || {}
        }));
        const { error: insertError } = await supabase.from('manufacturing_step_fields').insert(newFields);
        if (insertError) throw insertError;
    }
    
    await queryClient.invalidateQueries({ queryKey: ['manufacturing_step_fields'] });
    await queryClient.invalidateQueries({ queryKey: ['manufacturing_steps'] });
  };

  return { manufacturingSteps, orderSteps, stepFields, isLoading, getStepFields, updateStep, saveStepFields };
};
