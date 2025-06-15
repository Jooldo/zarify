
import { useMemo } from 'react';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import { Tables } from '@/integrations/supabase/types';

export const useStepDetailsData = (step: Tables<'manufacturing_order_steps'> | null) => {
  const { manufacturingSteps, orderSteps, getStepFields, isLoading: isLoadingStepsData } = useManufacturingSteps();
  const { getStepValue, isLoading: isLoadingValues } = useManufacturingStepValues();
  const { manufacturingOrders } = useManufacturingOrders();

  const order = useMemo(() => {
    if (!step) return null;
    return manufacturingOrders.find(o => o.id === step.manufacturing_order_id) || null;
  }, [step, manufacturingOrders]);

  const currentStepDefinition = useMemo(() => {
    if (!step || !manufacturingSteps.length) return null;
    return manufacturingSteps.find(s => s.id === step.manufacturing_step_id);
  }, [step, manufacturingSteps]);

  const currentStepFields = useMemo(() => {
    if (!currentStepDefinition) return [];
    return getStepFields(currentStepDefinition.id);
  }, [currentStepDefinition, getStepFields]);

  const currentStepValues = useMemo(() => {
    if (!step || currentStepFields.length === 0) return [];
    return currentStepFields.map(field => {
      const value = getStepValue(step.id, field.field_id);
      return {
        label: field.field_label,
        value: value || '-',
        unit: field.field_options?.unit,
      };
    });
  }, [step, currentStepFields, getStepValue]);

  const previousStepsData = useMemo(() => {
    if (!step || !order || !manufacturingSteps.length || !orderSteps.length) {
      return [];
    }

    console.log('[PREVIOUS STEPS DEBUG] Starting calculation for order:', order.order_number);

    const currentStepDefinition = manufacturingSteps.find(s => s.id === step.manufacturing_step_id);
    if (!currentStepDefinition) {
      console.log("[PREVIOUS STEPS DEBUG] No currentStepDefinition for step:", step);
      return [];
    }

    const allOrderStepsForOrder = orderSteps.filter(os => String(os.manufacturing_order_id) === String(order.id));
    const allStepDefinitions = manufacturingSteps
      .slice()
      .sort((a, b) => Number(a.step_order) - Number(b.step_order));

    const currentStepOrder = Number(currentStepDefinition.step_order);
    const previousStepDefinitions = allStepDefinitions.filter(def => Number(def.step_order) < currentStepOrder);

    return previousStepDefinitions.map(prevStepDef => {
      const orderStep = allOrderStepsForOrder.find(os => String(os.manufacturing_step_id) === String(prevStepDef.id));

      if (!orderStep) {
        return {
          stepName: prevStepDef.step_name,
          stepOrder: prevStepDef.step_order,
          values: [],
          missing: true
        };
      }

      const fields = getStepFields(prevStepDef.id);
      const values = fields.map(field => {
        const value = getStepValue(orderStep.id, field.field_id);
        return {
          label: field.field_label,
          value: value || '-',
          unit: field.field_options?.unit,
        };
      });

      return {
        stepName: prevStepDef.step_name,
        stepOrder: prevStepDef.step_order,
        values,
        missing: false
      };
    });
  }, [step, order, manufacturingSteps, orderSteps, getStepFields, getStepValue]);

  return {
    order,
    currentStepDefinition,
    currentStepValues,
    previousStepsData,
    isLoading: isLoadingStepsData || isLoadingValues
  };
};
