
import { supabase } from '@/integrations/supabase/client';

export const createNextManufacturingStep = async (
  manufacturingOrderId: string,
  currentStepOrder: number
) => {
  try {
    // Use the existing database function to create the next step
    const { data, error } = await supabase
      .rpc('create_next_manufacturing_step', {
        p_manufacturing_order_id: manufacturingOrderId,
        p_current_step_order: currentStepOrder
      });

    if (error) {
      console.error('Error creating next manufacturing step:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createNextManufacturingStep service:', error);
    throw error;
  }
};
