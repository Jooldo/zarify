
import { supabase } from '@/integrations/supabase/client';

export interface CreateBatchStepData {
  sourceOrderStepId: string;
  targetStepId: string;
  fieldValues: Record<string, any>;
  merchantId: string;
}

export const createBatchFromStep = async (data: CreateBatchStepData) => {
  console.log('Creating batch from step:', data);
  
  try {
    // Get the source order step details
    const { data: sourceStep, error: sourceError } = await supabase
      .from('manufacturing_order_steps')
      .select(`
        *,
        manufacturing_steps(*),
        manufacturing_orders(*)
      `)
      .eq('id', data.sourceOrderStepId)
      .single();

    if (sourceError) throw sourceError;

    // Get target step details
    const { data: targetStep, error: targetError } = await supabase
      .from('manufacturing_steps')
      .select('*')
      .eq('id', data.targetStepId)
      .single();

    if (targetError) throw targetError;

    // Create new order step for the batch
    const { data: newOrderStep, error: createError } = await supabase
      .from('manufacturing_order_steps')
      .insert({
        manufacturing_order_id: sourceStep.manufacturing_order_id,
        manufacturing_step_id: data.targetStepId,
        step_order: targetStep.step_order,
        status: 'in_progress',
        merchant_id: data.merchantId,
        started_at: new Date().toISOString()
      })
      .select(`
        *,
        manufacturing_steps(*),
        workers(name)
      `)
      .single();

    if (createError) throw createError;

    // Store field values for the new step
    if (data.fieldValues && Object.keys(data.fieldValues).length > 0) {
      const fieldValuesToInsert = Object.entries(data.fieldValues).map(([fieldId, value]) => ({
        manufacturing_order_step_id: newOrderStep.id,
        field_id: fieldId,
        field_value: typeof value === 'string' ? value : JSON.stringify(value),
        merchant_id: data.merchantId,
      }));

      const { error: valuesError } = await supabase
        .from('manufacturing_order_step_values')
        .insert(fieldValuesToInsert);

      if (valuesError) throw valuesError;
    }

    console.log('Batch step created successfully:', newOrderStep);
    return newOrderStep;
  } catch (error) {
    console.error('Failed to create batch from step:', error);
    throw error;
  }
};
