
import React from 'react';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { Tables } from '@/integrations/supabase/types';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';

interface StepDebugLoggerProps {
  open: boolean;
  order: ManufacturingOrder | null;
  step: Tables<'manufacturing_order_steps'> | null;
}

export const StepDebugLogger: React.FC<StepDebugLoggerProps> = ({ open, order, step }) => {
  const { manufacturingSteps, orderSteps, getStepFields } = useManufacturingSteps();
  const { getStepValue } = useManufacturingStepValues();

  // Debug logging for MO000004
  React.useEffect(() => {
    if (open && order && order.order_number === "MO000004") {
      const relevantOrderSteps = orderSteps.filter(os => String(os.manufacturing_order_id) === String(order.id));
      console.log("[DEBUG/MO000004] All order steps for this order:", relevantOrderSteps);

      const dholDef = manufacturingSteps.find(d => (d.step_name || '').toLowerCase() === 'dhol');
      if (!dholDef) {
        console.warn('[DEBUG/MO000004] No manufacturing step definition named "Dhol" found');
      } else {
        const dholOrderStep = relevantOrderSteps.find(os => String(os.manufacturing_step_id) === String(dholDef.id));
        if (!dholOrderStep) {
          console.warn('[DEBUG/MO000004] No order step found for "Dhol" for this order');
        } else {
          console.log('[DEBUG/MO000004] Found order step for "Dhol":', dholOrderStep);
          const dholFields = getStepFields(dholDef.id);
          dholFields.forEach(field => {
            const value = getStepValue(dholOrderStep.id, field.field_id);
            console.log(`[DEBUG/MO000004] Dhol field "${field.field_label}":`, value ?? "(empty/null)");
          });
        }
      }
    }
  }, [open, order, orderSteps, manufacturingSteps, getStepFields, getStepValue]);

  // Debug logging for MO000005
  React.useEffect(() => {
    if (open && order && order.order_number === "MO000005") {
      console.log("[DEBUG/MO000005] === MANUFACTURING DATA FOR MO000005 ===");
      console.log("[DEBUG/MO000005] Order details:", order);
      console.log("[DEBUG/MO000005] All manufacturing steps for merchant:", manufacturingSteps);
      
      const relevantOrderSteps = orderSteps.filter(os => String(os.manufacturing_order_id) === String(order.id));
      console.log("[DEBUG/MO000005] All order steps for this order:", relevantOrderSteps);

      if (relevantOrderSteps.length === 0) {
        console.warn("[DEBUG/MO000005] No order steps found for MO000005");
        return;
      }

      relevantOrderSteps.forEach(os => {
        const stepDefinition = manufacturingSteps.find(d => String(d.id) === String(os.manufacturing_step_id));
        console.log(`[DEBUG/MO000005] === STEP: ${stepDefinition?.step_name || 'Unknown'} ===`);
        console.log(`[DEBUG/MO000005] Order Step ID: ${os.id}`);
        console.log(`[DEBUG/MO000005] Manufacturing Step ID: ${os.manufacturing_step_id}`);
        console.log(`[DEBUG/MO000005] Status: ${os.status}`);
        console.log(`[DEBUG/MO000005] Progress: ${os.progress_percentage}%`);
        console.log(`[DEBUG/MO000005] Started At: ${os.started_at || 'Not started'}`);
        console.log(`[DEBUG/MO000005] Completed At: ${os.completed_at || 'Not completed'}`);
        console.log(`[DEBUG/MO000005] Notes: ${os.notes || 'No notes'}`);
        console.log(`[DEBUG/MO000005] Worker: ${os.workers?.name || 'Not assigned'}`);

        if (stepDefinition) {
          const stepFields = getStepFields(stepDefinition.id);
          console.log(`[DEBUG/MO000005] Fields configured for ${stepDefinition.step_name}:`, stepFields.length);
          
          if (stepFields.length > 0) {
            stepFields.forEach(field => {
              const value = getStepValue(os.id, field.field_id);
              console.log(`[DEBUG/MO000005]   "${field.field_label}" (${field.field_type}): ${value ?? "(empty/null)"}`);
              if (field.field_options) {
                console.log(`[DEBUG/MO000005]     Options:`, field.field_options);
              }
            });
          } else {
            console.log(`[DEBUG/MO000005] No fields configured for step: ${stepDefinition.step_name}`);
          }
        }
        console.log(`[DEBUG/MO000005] === END STEP ===`);
      });

      console.log("[DEBUG/MO000005] === END MANUFACTURING DATA ===");
    }
  }, [open, order, orderSteps, manufacturingSteps, getStepFields, getStepValue]);

  return null;
};
