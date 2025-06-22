
import { supabase } from '@/integrations/supabase/client';

export interface CreateBatchFromStepData {
  sourceOrderId: string;
  sourceStepId: string;
  targetStepId: string;
  fieldValues: Record<string, any>;
  batchQuantity?: number;
}

export const createBatchFromStep = async (data: CreateBatchFromStepData) => {
  try {
    console.log('Creating new batch from step:', data);
    
    // Get merchant ID
    const { data: merchantId, error: merchantError } = await supabase
      .rpc('get_user_merchant_id');

    if (merchantError) throw merchantError;

    // Get the target step details
    const { data: targetStepData, error: stepError } = await supabase
      .from('manufacturing_steps')
      .select('step_order')
      .eq('id', data.targetStepId)
      .single();

    if (stepError) throw stepError;

    // Create the new manufacturing order step as a new batch/path
    const stepToInsert = {
      manufacturing_order_id: data.sourceOrderId,
      manufacturing_step_id: data.targetStepId,
      step_order: targetStepData.step_order,
      status: 'in_progress' as const,
      assigned_worker_id: data.fieldValues.worker || null,
      progress_percentage: 0,
      merchant_id: merchantId,
      // Add metadata to indicate this is a new batch from another step
      notes: `New batch started from step ${data.sourceStepId}`,
    };

    const { data: newStep, error: insertError } = await supabase
      .from('manufacturing_order_steps')
      .insert(stepToInsert)
      .select(`
        *,
        manufacturing_steps (
          step_name,
          step_order,
          description,
          qc_required,
          estimated_duration_hours
        ),
        workers (
          id,
          name
        )
      `)
      .single();

    if (insertError) throw insertError;

    // Store field values for the new batch
    if (data.fieldValues && Object.keys(data.fieldValues).length > 0) {
      const fieldValuesToInsert = Object.entries(data.fieldValues).map(([fieldId, value]) => ({
        manufacturing_order_step_id: newStep.id,
        field_id: fieldId,
        field_value: typeof value === 'string' ? value : JSON.stringify(value),
        merchant_id: merchantId,
      }));

      const { error: valuesError } = await supabase
        .from('manufacturing_order_step_values')
        .insert(fieldValuesToInsert);

      if (valuesError) throw valuesError;
    }

    console.log('New batch created successfully:', newStep);
    return newStep;
  } catch (error) {
    console.error('Failed to create batch from step:', error);
    throw error;
  }
};
