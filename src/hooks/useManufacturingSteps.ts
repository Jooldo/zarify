import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type ManufacturingStep = Tables<'manufacturing_steps'>;
export type ManufacturingStepField = Tables<'manufacturing_step_fields'>;
export type ManufacturingOrderStep = Tables<'manufacturing_order_steps'> & {
  manufacturing_steps: ManufacturingStep | null;
  workers?: { name: string | null } | null;
};

export const useManufacturingSteps = () => {
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

  const { data: orderSteps = [], isLoading: isLoadingOrderSteps } = useQuery({
    queryKey: ['manufacturing_order_steps_with_steps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturing_order_steps')
        .select('*, manufacturing_steps(*), workers(name)');
      if (error) {
        console.error("Error fetching order steps with manufacturing steps", error);
        throw error;
      }
      return data || [];
    },
  });

  const { data: stepFields = [], isLoading: isLoadingStepFields } = useQuery<Tables<'manufacturing_step_fields'>[]>({
    queryKey: ['manufacturing_step_fields'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturing_step_fields')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const getStepFields = (stepId: string) => {
    return stepFields.filter(field => field.manufacturing_step_id === stepId);
  };
  
  const isLoading = isLoadingSteps || isLoadingOrderSteps || isLoadingStepFields;

  return { manufacturingSteps, orderSteps, stepFields, isLoading, getStepFields };
};
