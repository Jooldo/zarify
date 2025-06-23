
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type ManufacturingStep = Tables<'merchant_step_config'>;
export type ManufacturingStepField = Tables<'merchant_step_field_config'>;

// Add these type exports that were missing
export type MerchantStepConfig = Tables<'merchant_step_config'>;
export type MerchantStepFieldConfig = Tables<'merchant_step_field_config'>;

export type ManufacturingOrderStep = Tables<'manufacturing_order_step_data'> & {
  workers?: { name: string | null } | null;
};

export const useManufacturingSteps = () => {
  const queryClient = useQueryClient();
  
  const { data: manufacturingSteps = [], isLoading: isLoadingSteps } = useQuery<ManufacturingStep[]>({
    queryKey: ['merchant_step_config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merchant_step_config')
        .select('*')
        .eq('is_active', true)
        .order('step_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: orderSteps = [], isLoading: isLoadingOrderSteps, refetch: refetchOrderSteps } = useQuery<ManufacturingOrderStep[]>({
    queryKey: ['manufacturing_order_step_data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturing_order_step_data')
        .select(`
          *,
          workers (name)
        `);
      if (error) {
        console.error("Error fetching order step data", error);
        throw error;
      }
      return (data as ManufacturingOrderStep[]) || [];
    },
  });

  const { data: stepFields = [], isLoading: isLoadingStepFields } = useQuery<ManufacturingStepField[]>({
    queryKey: ['merchant_step_field_config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merchant_step_field_config')
        .select('*')
        .eq('is_visible', true);
      if (error) throw error;
      return (data as ManufacturingStepField[]) || [];
    }
  });

  // Real-time subscription for manufacturing order step data
  useEffect(() => {
    const channelName = `manufacturing-steps-realtime-${Date.now()}-${Math.random()}`;
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

  const updateStep = async (stepId: string, updates: Partial<ManufacturingStep>) => {
    const { error } = await supabase
      .from('merchant_step_config')
      .update(updates)
      .eq('id', stepId);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: ['merchant_step_config'] });
  };
  
  const saveStepFields = async (stepName: string, fields: any[]) => {
    const { data: merchantId, error: merchantError } = await supabase
      .rpc('get_user_merchant_id');
    
    if (merchantError) throw merchantError;
      
    await supabase.from('merchant_step_field_config').delete().eq('step_name', stepName);

    if (fields.length > 0) {
        const newFields = fields.map(field => ({
            step_name: stepName,
            merchant_id: merchantId,
            field_key: field.id,
            unit: field.unit || null,
            is_visible: field.required || false
        }));
        const { error: insertError } = await supabase.from('merchant_step_field_config').insert(newFields);
        if (insertError) throw insertError;
    }
    
    await queryClient.invalidateQueries({ queryKey: ['merchant_step_field_config'] });
    await queryClient.invalidateQueries({ queryKey: ['merchant_step_config'] });
  };

  // Create a refetch function that invalidates all related queries
  const refetch = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['merchant_step_config'] }),
      queryClient.invalidateQueries({ queryKey: ['manufacturing_order_step_data'] }),
      queryClient.invalidateQueries({ queryKey: ['merchant_step_field_config'] }),
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] })
    ]);
  };

  return { 
    manufacturingSteps, 
    orderSteps, 
    stepFields, 
    isLoading, 
    getStepFields, 
    updateStep, 
    saveStepFields, 
    refetch 
  };
};
