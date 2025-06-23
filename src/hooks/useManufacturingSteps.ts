
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type MerchantStep = Tables<'merchant_step_config'>;
export type ManufacturingOrderStepData = Tables<'manufacturing_order_step_data'>;

export const useManufacturingSteps = () => {
  const queryClient = useQueryClient();
  
  const { data: manufacturingSteps = [], isLoading: isLoadingSteps } = useQuery<MerchantStep[]>({
    queryKey: ['merchant-step-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merchant_step_config')
        .select('*')
        .order('step_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: orderSteps = [], isLoading: isLoadingOrderSteps } = useQuery<ManufacturingOrderStepData[]>({
    queryKey: ['manufacturing_order_step_data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturing_order_step_data')
        .select('*');
      if (error) {
        console.error("Error fetching order step data", error);
        throw error;
      }
      return data || [];
    },
  });

  const { data: stepFields = [], isLoading: isLoadingStepFields } = useQuery<any[]>({
    queryKey: ['merchant_step_field_config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merchant_step_field_config')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Real-time subscription for manufacturing order step data
  useEffect(() => {
    const channelName = `manufacturing-step-data-realtime-${Date.now()}-${Math.random()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'manufacturing_order_step_data'
        },
        (payload) => {
          console.log('Real-time update for manufacturing_order_step_data:', payload);
          queryClient.invalidateQueries({ queryKey: ['manufacturing_order_step_data'] });
          queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const getStepFields = (stepName: string) => {
    return stepFields.filter(field => field.step_name === stepName);
  };
  
  const isLoading = isLoadingSteps || isLoadingOrderSteps || isLoadingStepFields;

  const updateStep = async (stepId: string, updates: Partial<MerchantStep>) => {
    const { error } = await supabase
      .from('merchant_step_config')
      .update(updates)
      .eq('id', stepId);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: ['merchant-step-config'] });
  };
  
  const saveStepFields = async (stepName: string, fields: any[]) => {
    // This function would handle field configuration
    // For now, we'll use the merchant_step_field_config table
    await queryClient.invalidateQueries({ queryKey: ['merchant_step_field_config'] });
  };

  return { 
    manufacturingSteps, 
    orderSteps, 
    stepFields, 
    isLoading, 
    getStepFields, 
    updateStep, 
    saveStepFields 
  };
};
