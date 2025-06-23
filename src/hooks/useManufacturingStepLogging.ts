
import { supabase } from '@/integrations/supabase/client';

export const useManufacturingStepLogging = () => {
  const logStepActivity = async (
    action: string,
    stepId: string,
    orderId: string,
    description: string
  ) => {
    try {
      await supabase.rpc('log_user_activity', {
        p_action: action,
        p_entity_type: 'Manufacturing Step',
        p_entity_id: stepId,
        p_description: description
      });
    } catch (error) {
      console.error('Failed to log manufacturing step activity:', error);
    }
  };

  const logStepStart = async (stepId: string, orderId: string, stepName: string, orderNumber: string) => {
    await logStepActivity(
      'Started',
      stepId,
      orderId,
      `Started step "${stepName}" for manufacturing order ${orderNumber}`
    );
  };

  const logStepComplete = async (stepId: string, orderId: string, stepName: string, orderNumber: string) => {
    await logStepActivity(
      'Completed',
      stepId,
      orderId,
      `Completed step "${stepName}" for manufacturing order ${orderNumber}`
    );
  };

  const logStepProgress = async (stepId: string, orderId: string, stepName: string, orderNumber: string, progress: number) => {
    await logStepActivity(
      'Progress Updated',
      stepId,
      orderId,
      `Updated progress for step "${stepName}" in manufacturing order ${orderNumber} to ${progress}%`
    );
  };

  const logStepAssignment = async (stepId: string, orderId: string, stepName: string, orderNumber: string, workerName: string) => {
    await logStepActivity(
      'Assigned',
      stepId,
      orderId,
      `Assigned step "${stepName}" for manufacturing order ${orderNumber} to ${workerName}`
    );
  };

  return {
    logStepStart,
    logStepComplete,
    logStepProgress,
    logStepAssignment
  };
};
