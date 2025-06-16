
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

export interface ManufacturingStep {
  id: string;
  step_name: string;
  step_order: number;
  description?: string;
  estimated_duration_hours?: number;
  is_active: boolean;
  merchant_id: string;
  created_at: string;
  updated_at: string;
  qc_required: boolean;
}

export interface ManufacturingOrderStep {
  id: string;
  manufacturing_order_id: string;
  manufacturing_step_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  started_at?: string;
  completed_at?: string;
  progress_percentage?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  manufacturing_steps?: ManufacturingStep;
  workers?: {
    id: string;
    name: string;
  };
}

export interface ManufacturingStepField {
  id: string;
  manufacturing_step_id: string;
  field_id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  is_required: boolean;
  field_options: any;
  merchant_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateManufacturingStepData {
  step_name: string;
  step_order: number;
  description?: string;
  estimated_duration_hours?: number;
  is_active: boolean;
  qc_required: boolean;
}

export interface UpdateManufacturingStepData {
  step_name?: string;
  step_order?: number;
  description?: string;
  estimated_duration_hours?: number;
  is_active?: boolean;
  qc_required?: boolean;
}

export const useManufacturingSteps = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: manufacturingSteps = [], isLoading, error, refetch } = useQuery({
    queryKey: ['manufacturing-steps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturing_steps')
        .select('*')
        .order('step_order');

      if (error) {
        console.error('Error fetching manufacturing steps:', error);
        throw error;
      }

      return data as ManufacturingStep[];
    },
  });

  const { data: orderSteps = [], refetch: refetchOrderSteps } = useQuery({
    queryKey: ['manufacturing-order-steps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturing_order_steps')
        .select('*, manufacturing_steps(*), workers(id, name)')
        .order('created_at');

      if (error) {
        console.error('Error fetching manufacturing order steps:', error);
        throw error;
      }

      return data as ManufacturingOrderStep[];
    },
  });

  const { data: stepFields = [] } = useQuery({
    queryKey: ['manufacturing-step-fields'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturing_step_fields')
        .select('*');

      if (error) {
        console.error('Error fetching manufacturing step fields:', error);
        throw error;
      }

      return data as ManufacturingStepField[];
    },
  });

  const createStepMutation = useMutation({
    mutationFn: async (stepData: CreateManufacturingStepData) => {
      const { data, error } = await supabase
        .from('manufacturing_steps')
        .insert({
          ...stepData,
          merchant_id: (await supabase.auth.getUser()).data.user?.user_metadata?.merchant_id || ''
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating manufacturing step:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing-steps'] });
      toast({
        title: 'Success',
        description: 'Manufacturing step created successfully',
      });
    },
    onError: (error) => {
      console.error('Error creating manufacturing step:', error);
      toast({
        title: 'Error',
        description: 'Failed to create manufacturing step',
        variant: 'destructive',
      });
    },
  });

  const updateStepMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateManufacturingStepData }) => {
      const { data, error } = await supabase
        .from('manufacturing_steps')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating manufacturing step:', error);
        throw error;
      }

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

  const deleteStepMutation = useMutation({
    mutationFn: async (stepId: string) => {
      const { error } = await supabase
        .from('manufacturing_steps')
        .delete()
        .eq('id', stepId);

      if (error) {
        console.error('Error deleting manufacturing step:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturing-steps'] });
      toast({
        title: 'Success',
        description: 'Manufacturing step deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Error deleting manufacturing step:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete manufacturing step',
        variant: 'destructive',
      });
    },
  });

  // Add mutation to create next step
  const createNextStepMutation = useMutation({
    mutationFn: async ({ orderId, currentStepOrder }: { orderId: string; currentStepOrder: number }) => {
      console.log(`[NEXT STEP] Creating next step for order ${orderId}, current step order: ${currentStepOrder}`);
      
      const { data, error } = await supabase.rpc('create_next_manufacturing_step', {
        p_manufacturing_order_id: orderId,
        p_current_step_order: currentStepOrder
      });

      if (error) {
        console.error('Error creating next step:', error);
        throw error;
      }

      console.log(`[NEXT STEP] Next step created with ID: ${data}`);
      return data;
    },
    onSuccess: () => {
      // Refresh both order steps and manufacturing orders
      queryClient.invalidateQueries({ queryKey: ['manufacturing-order-steps'] });
      queryClient.invalidateQueries({ queryKey: ['manufacturing-orders'] });
      
      console.log('[NEXT STEP] Successfully created next step and refreshed queries');
    },
    onError: (error: any) => {
      console.error('[NEXT STEP] Failed to create next step:', error);
      toast({
        title: 'Error',
        description: 'Failed to create next manufacturing step',
        variant: 'destructive',
      });
    },
  });

  // Update step status mutation with next step creation
  const updateStepStatusMutation = useMutation({
    mutationFn: async ({ stepId, status, stepOrder, orderId }: { 
      stepId: string; 
      status: string; 
      stepOrder?: number; 
      orderId?: string; 
    }) => {
      console.log(`[UPDATE STEP] Updating step ${stepId} to status: ${status}`);
      
      const updateData: any = { status };
      
      if (status === 'in_progress') {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.progress_percentage = 100;
      }

      const { data, error } = await supabase
        .from('manufacturing_order_steps')
        .update(updateData)
        .eq('id', stepId)
        .select('*, manufacturing_steps(*)')
        .single();

      if (error) {
        console.error('Error updating step status:', error);
        throw error;
      }

      console.log(`[UPDATE STEP] Step updated successfully:`, data);

      // If step is completed and we have step order and order ID, create next step
      if (status === 'completed' && stepOrder !== undefined && orderId) {
        console.log(`[UPDATE STEP] Step completed, attempting to create next step...`);
        try {
          await createNextStepMutation.mutateAsync({ orderId, currentStepOrder: stepOrder });
        } catch (nextStepError) {
          console.log(`[UPDATE STEP] No next step to create or error:`, nextStepError);
          // Don't throw here as the step update was successful
        }
      }

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
    onError: (error: any) => {
      console.error('Error updating manufacturing step:', error);
      toast({
        title: 'Error',
        description: 'Failed to update manufacturing step',
        variant: 'destructive',
      });
    },
  });

  const createStep = (stepData: CreateManufacturingStepData) => {
    return createStepMutation.mutate(stepData);
  };

  const updateStep = (id: string, updates: UpdateManufacturingStepData) => {
    return updateStepMutation.mutate({ id, updates });
  };

  const deleteStep = (stepId: string) => {
    return deleteStepMutation.mutate(stepId);
  };

  const getStepFields = (stepId: string) => {
    return stepFields.filter(field => field.manufacturing_step_id === stepId);
  };

  return {
    manufacturingSteps,
    orderSteps,
    stepFields,
    isLoading,
    error,
    refetch,
    createStep,
    updateStep,
    deleteStep,
    getStepFields,
    updateStepStatus: updateStepStatusMutation.mutate,
    createNextStep: createNextStepMutation.mutate,
    isUpdatingStep: updateStepStatusMutation.isPending,
    isCreatingNextStep: createNextStepMutation.isPending,
  };
};
