
import { useMemo } from 'react';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import { Tables } from '@/integrations/supabase/types';

export const useStepDetailsData = (step: Tables<'manufacturing_order_steps'> | null) => {
  const { manufacturingSteps, orderSteps, getStepFields, isLoading: isLoadingStepsData } = useManufacturingSteps();
  const { getStepValue, isLoading: isLoadingValues } = useManufacturingStepValues();
  const { manufacturingOrders } = useManufacturingOrders();

  console.log('[STEP DETAILS DEBUG] Hook called with step:', step?.id);
  console.log('[STEP DETAILS DEBUG] Manufacturing steps available:', manufacturingSteps.length);
  console.log('[STEP DETAILS DEBUG] Order steps available:', orderSteps.length);
  console.log('[STEP DETAILS DEBUG] Manufacturing orders available:', manufacturingOrders.length);

  const order = useMemo(() => {
    if (!step) return null;
    const foundOrder = manufacturingOrders.find(o => o.id === step.manufacturing_order_id) || null;
    console.log('[STEP DETAILS DEBUG] Found order:', foundOrder?.order_number);
    return foundOrder;
  }, [step, manufacturingOrders]);

  const currentStepDefinition = useMemo(() => {
    if (!step || !manufacturingSteps.length) return null;
    const foundStep = manufacturingSteps.find(s => s.id === step.manufacturing_step_id);
    console.log('[STEP DETAILS DEBUG] Current step definition:', foundStep?.step_name);
    return foundStep;
  }, [step, manufacturingSteps]);

  const currentStepFields = useMemo(() => {
    if (!currentStepDefinition) return [];
    const fields = getStepFields(currentStepDefinition.id);
    console.log('[STEP DETAILS DEBUG] Current step fields:', fields.length);
    return fields;
  }, [currentStepDefinition, getStepFields]);

  const currentStepValues = useMemo(() => {
    if (!step || currentStepFields.length === 0) return [];
    const values = currentStepFields.map(field => {
      const value = getStepValue(step.id, field.field_id);
      return {
        label: field.field_label,
        value: value || '-',
        unit: field.field_options?.unit,
      };
    });
    console.log('[STEP DETAILS DEBUG] Current step values:', values);
    return values;
  }, [step, currentStepFields, getStepValue]);

  const previousStepsData = useMemo(() => {
    if (!step || !order || !manufacturingSteps.length || !orderSteps.length) {
      console.log('[PREVIOUS STEPS DEBUG] Missing prerequisites:', {
        hasStep: !!step,
        hasOrder: !!order,
        hasManufacturingSteps: manufacturingSteps.length > 0,
        hasOrderSteps: orderSteps.length > 0
      });
      return [];
    }

    console.log('[PREVIOUS STEPS DEBUG] Starting calculation for order:', order.order_number);

    const currentStepDefinition = manufacturingSteps.find(s => s.id === step.manufacturing_step_id);
    if (!currentStepDefinition) {
      console.log("[PREVIOUS STEPS DEBUG] No currentStepDefinition for step:", step);
      return [];
    }

    console.log('[PREVIOUS STEPS DEBUG] Current step:', currentStepDefinition.step_name, 'order:', currentStepDefinition.step_order);

    const allOrderStepsForOrder = orderSteps.filter(os => String(os.manufacturing_order_id) === String(order.id));
    console.log('[PREVIOUS STEPS DEBUG] Order steps for this order:', allOrderStepsForOrder.length);

    const allStepDefinitions = manufacturingSteps
      .slice()
      .sort((a, b) => Number(a.step_order) - Number(b.step_order));

    const currentStepOrder = Number(currentStepDefinition.step_order);
    const previousStepDefinitions = allStepDefinitions.filter(def => Number(def.step_order) < currentStepOrder);
    
    console.log('[PREVIOUS STEPS DEBUG] Previous step definitions:', previousStepDefinitions.map(s => s.step_name));

    const result = previousStepDefinitions.map(prevStepDef => {
      const orderStep = allOrderStepsForOrder.find(os => String(os.manufacturing_step_id) === String(prevStepDef.id));

      if (!orderStep) {
        console.log('[PREVIOUS STEPS DEBUG] No order step found for:', prevStepDef.step_name);
        return {
          stepName: prevStepDef.step_name,
          stepOrder: prevStepDef.step_order,
          values: [],
          missing: true
        };
      }

      console.log('[PREVIOUS STEPS DEBUG] Found order step for:', prevStepDef.step_name, 'status:', orderStep.status);

      const fields = getStepFields(prevStepDef.id);
      console.log('[PREVIOUS STEPS DEBUG] Fields for', prevStepDef.step_name, ':', fields.length);

      const values = fields.map(field => {
        const value = getStepValue(orderStep.id, field.field_id);
        console.log('[PREVIOUS STEPS DEBUG] Field value for', field.field_label, ':', value);
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

    console.log('[PREVIOUS STEPS DEBUG] Final result:', result);
    return result;
  }, [step, order, manufacturingSteps, orderSteps, getStepFields, getStepValue]);

  return {
    order,
    currentStepDefinition,
    currentStepValues,
    previousStepsData,
    isLoading: isLoadingStepsData || isLoadingValues
  };
};
