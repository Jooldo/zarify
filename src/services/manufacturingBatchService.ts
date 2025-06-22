
import { supabase } from '@/integrations/supabase/client';

export interface CreateBatchStepData {
  sourceOrderStepId: string;
  targetStepId: string;
  fieldValues: Record<string, any>;
  merchantId: string;
}

export const createBatchFromStep = async (data: CreateBatchStepData) => {
  console.log('Creating batch from step with data:', data);
  
  try {
    // Get the source order step details with full information
    const { data: sourceStep, error: sourceError } = await supabase
      .from('manufacturing_order_steps')
      .select(`
        *,
        manufacturing_steps(*),
        manufacturing_orders(*)
      `)
      .eq('id', data.sourceOrderStepId)
      .single();

    if (sourceError) {
      console.error('Error fetching source step:', sourceError);
      throw new Error(`Failed to fetch source step: ${sourceError.message}`);
    }

    if (!sourceStep) {
      throw new Error('Source step not found');
    }

    console.log('Source step found:', sourceStep);

    // Get target step details
    const { data: targetStep, error: targetError } = await supabase
      .from('manufacturing_steps')
      .select('*')
      .eq('id', data.targetStepId)
      .single();

    if (targetError) {
      console.error('Error fetching target step:', targetError);
      throw new Error(`Failed to fetch target step: ${targetError.message}`);
    }

    if (!targetStep) {
      throw new Error('Target step not found');
    }

    console.log('Target step found:', targetStep);

    // Verify we have the manufacturing order ID
    if (!sourceStep.manufacturing_order_id) {
      throw new Error('Source step does not have a manufacturing order ID');
    }

    // Create new order step for the batch
    const newOrderStepData = {
      manufacturing_order_id: sourceStep.manufacturing_order_id,
      manufacturing_step_id: data.targetStepId,
      step_order: targetStep.step_order,
      status: 'in_progress',
      merchant_id: data.merchantId,
      started_at: new Date().toISOString()
    };

    console.log('Creating new order step with data:', newOrderStepData);

    const { data: newOrderStep, error: createError } = await supabase
      .from('manufacturing_order_steps')
      .insert(newOrderStepData)
      .select(`
        *,
        manufacturing_steps(*),
        workers(name)
      `)
      .single();

    if (createError) {
      console.error('Error creating new order step:', createError);
      throw new Error(`Failed to create new order step: ${createError.message}`);
    }

    if (!newOrderStep) {
      throw new Error('Failed to create new order step - no data returned');
    }

    console.log('New order step created successfully:', newOrderStep);

    // Store field values for the new step if provided
    if (data.fieldValues && Object.keys(data.fieldValues).length > 0) {
      const fieldValuesToInsert = Object.entries(data.fieldValues)
        .filter(([_, value]) => value !== null && value !== undefined && value !== '')
        .map(([fieldId, value]) => ({
          manufacturing_order_step_id: newOrderStep.id,
          field_id: fieldId,
          field_value: typeof value === 'string' ? value : JSON.stringify(value),
          merchant_id: data.merchantId,
        }));

      if (fieldValuesToInsert.length > 0) {
        console.log('Inserting field values:', fieldValuesToInsert);
        
        const { error: valuesError } = await supabase
          .from('manufacturing_order_step_values')
          .insert(fieldValuesToInsert);

        if (valuesError) {
          console.error('Error inserting field values:', valuesError);
          // Don't throw here, as the step was created successfully
          console.warn('Field values insertion failed, but step was created');
        } else {
          console.log('Field values inserted successfully');
        }
      }
    }

    console.log('Batch step created successfully:', newOrderStep);
    return newOrderStep;
  } catch (error) {
    console.error('Failed to create batch from step:', error);
    throw error;
  }
};
