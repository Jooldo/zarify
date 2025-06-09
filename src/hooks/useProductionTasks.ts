
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProductionTask {
  id: string;
  merchant_id: string;
  product_config_id: string;
  order_number: string;
  customer_name: string;
  quantity: number;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  current_step: 'pending' | 'jhalai' | 'quellai' | 'meena' | 'vibrator' | 'quality-check' | 'completed';
  status?: 'Created' | 'Progress' | 'QC' | 'Partially Completed' | 'Completed' | 'Received';
  assigned_worker_id?: string;
  assigned_worker_name?: string;
  estimated_time?: number;
  started_at?: string;
  expected_date?: string;
  notes?: string;
  received_weight?: number;
  received_quantity?: number;
  completed_weight?: number;
  completed_quantity?: number;
  parent_task_id?: string;
  is_child_task?: boolean;
  created_at?: string;
  updated_at?: string;
  // Joined data
  product_configs?: {
    product_code: string;
    category: string;
    subcategory: string;
  };
}

export interface ProductionStepHistory {
  id: string;
  merchant_id: string;
  production_task_id: string;
  step_name: string;
  assigned_worker_id?: string;
  assigned_worker_name?: string;
  start_date?: string;
  completed_date?: string;
  input_weight?: number;
  output_weight?: number;
  input_quantity?: number;
  output_quantity?: number;
  remarks?: string;
  status?: 'Created' | 'Progress' | 'QC' | 'Partially Completed' | 'Completed' | 'Received';
  created_at?: string;
  updated_at?: string;
}

export const useProductionTasks = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['production-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_tasks')
        .select(`
          *,
          product_configs (
            product_code,
            category,
            subcategory
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching production tasks:', error);
        throw error;
      }

      return data as ProductionTask[];
    },
  });

  // Group tasks by current step
  const tasksByStep = tasks.reduce((acc, task) => {
    if (!acc[task.current_step]) {
      acc[task.current_step] = [];
    }
    acc[task.current_step].push(task);
    return acc;
  }, {} as Record<string, ProductionTask[]>);

  const createTaskMutation = useMutation({
    mutationFn: async (newTask: Partial<ProductionTask>) => {
      const { data, error } = await supabase
        .from('production_tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-tasks'] });
      toast({
        title: 'Success',
        description: 'Production task created successfully',
      });
    },
    onError: (error) => {
      console.error('Error creating production task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create production task',
        variant: 'destructive',
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ProductionTask> }) => {
      const { data, error } = await supabase
        .from('production_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-tasks'] });
      toast({
        title: 'Success',
        description: 'Production task updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating production task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update production task',
        variant: 'destructive',
      });
    },
  });

  const moveTaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      toStep,
      additionalUpdates = {}
    }: {
      taskId: string;
      toStep: string;
      additionalUpdates?: Partial<ProductionTask>;
    }) => {
      const { data, error } = await supabase
        .from('production_tasks')
        .update({
          current_step: toStep,
          ...additionalUpdates
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-tasks'] });
    },
    onError: (error) => {
      console.error('Error moving production task:', error);
      toast({
        title: 'Error',
        description: 'Failed to move production task',
        variant: 'destructive',
      });
    },
  });

  return {
    tasks,
    tasksByStep,
    isLoading,
    error,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    moveTask: moveTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isMoving: moveTaskMutation.isPending,
  };
};
