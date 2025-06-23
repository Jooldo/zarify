
import { useMemo } from 'react';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import { Tables } from '@/integrations/supabase/types';

export const useStepDetailsData = (step: Tables<'manufacturing_order_step_data'> | null) => {
  const { manufacturingSteps, orderSteps, getStepFields, isLoading: isLoadingStepsData } = useManufacturingSteps();
  const { getStepValue, isLoading: isLoadingValues } = useManufacturingStepValues();
  const { manufacturingOrders } = useManufacturingOrders();

  const order = useMemo(() => {
    if (!step) return null;
    const foundOrder = manufacturingOrders.find(o => o.id === step.order_id) || null;
    return foundOrder;
  }, [step, manufacturingOrders]);

  const currentStepDefinition = useMemo(() => {
    if (!step || !manufacturingSteps.length) return null;
    const foundStep = manufacturingSteps.find(s => s.step_name === step.step_name);
    return foundStep;
  }, [step, manufacturingSteps]);

  const currentStepFields = useMemo(() => {
    if (!currentStepDefinition) return [];
    const fields = getStepFields(currentStepDefinition.id);
    // Map field_key to field_id for compatibility
    return fields.map(field => ({
      ...field,
      field_id: field.field_key,
      field_label: field.field_key,
      field_options: { unit: field.unit }
    }));
  }, [currentStepDefinition, getStepFields]);

  const currentStepValues = useMemo(() => {
    if (!step || currentStepFields.length === 0) return [];
    const values = currentStepFields.map(field => {
      const value = getStepValue(step.id, field.field_key);
      return {
        label: field.field_key,
        value: value || '-',
        unit: field.unit,
      };
    });
    return values;
  }, [step, currentStepFields, getStepValue]);

  const previousStepsData = useMemo(() => {
    if (!step || !order || !manufacturingSteps.length || !orderSteps.length) {
      return [];
    }

    const currentStepDefinition = manufacturingSteps.find(s => s.step_name === step.step_name);
    if (!currentStepDefinition) {
      return [];
    }

    const allOrderStepsForOrder = orderSteps.filter(os => String(os.order_id) === String(order.id));

    const allStepDefinitions = manufacturingSteps
      .slice()
      .sort((a, b) => Number(a.step_order) - Number(b.step_order));

    const currentStepOrder = Number(currentStepDefinition.step_order);
    const previousStepDefinitions = allStepDefinitions.filter(def => Number(def.step_order) < currentStepOrder);

    const result = previousStepDefinitions.map(prevStepDef => {
      const orderStep = allOrderStepsForOrder.find(os => os.step_name === prevStepDef.step_name);

      if (!orderStep) {
        return {
          stepName: prevStepDef.step_name,
          stepOrder: prevStepDef.step_order,
          values: [],
          missing: true
        };
      }

      const fields = getStepFields(prevStepDef.id).map(field => ({
        ...field,
        field_id: field.field_key,
        field_label: field.field_key,
        field_options: { unit: field.unit }
      }));

      const values = fields.map(field => {
        const value = getStepValue(orderStep.id, field.field_key);
        return {
          label: field.field_key,
          value: value || '-',
          unit: field.unit,
        };
      });

      return {
        stepName: prevStepDef.step_name,
        stepOrder: prevStepDef.step_order,
        values,
        missing: false
      };
    });

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
