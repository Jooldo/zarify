
import { useMemo } from 'react';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';

export const useStepDetailsData = (step: any | null) => {
  const { manufacturingSteps, orderSteps, getStepFields, isLoading: isLoadingStepsData } = useManufacturingSteps();
  const { getStepValue, isLoading: isLoadingValues } = useManufacturingStepValues();
  const { manufacturingOrders } = useManufacturingOrders();

  const order = useMemo(() => {
    if (!step) return null;
    const ordersArray = Array.isArray(manufacturingOrders) ? manufacturingOrders : [];
    const foundOrder = ordersArray.find(o => o.id === step.order_id) || null;
    return foundOrder;
  }, [step, manufacturingOrders]);

  const currentStepDefinition = useMemo(() => {
    if (!step || !Array.isArray(manufacturingSteps) || manufacturingSteps.length === 0) return null;
    const foundStep = manufacturingSteps.find(s => s.step_name === step.step_name);
    return foundStep;
  }, [step, manufacturingSteps]);

  const currentStepFields = useMemo(() => {
    if (!currentStepDefinition) return [];
    const fields = getStepFields(currentStepDefinition.step_name);
    return fields;
  }, [currentStepDefinition, getStepFields]);

  const currentStepValues = useMemo(() => {
    if (!step || currentStepFields.length === 0) return [];
    const values = currentStepFields.map(field => {
      const fieldKey = field.field_key;
      const value = step[fieldKey] || '-';
      return {
        label: field.field_key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: value,
        unit: null, // Can be extended later
      };
    });
    return values;
  }, [step, currentStepFields]);

  const previousStepsData = useMemo(() => {
    if (!step || !order || !Array.isArray(manufacturingSteps) || manufacturingSteps.length === 0 || 
        !Array.isArray(orderSteps) || orderSteps.length === 0) {
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
      const orderStep = allOrderStepsForOrder.find(os => String(os.step_name) === String(prevStepDef.step_name));

      if (!orderStep) {
        return {
          stepName: prevStepDef.step_name,
          stepOrder: prevStepDef.step_order,
          values: [],
          missing: true
        };
      }

      const fields = getStepFields(prevStepDef.step_name);

      const values = fields.map(field => {
        const fieldKey = field.field_key;
        const value = orderStep[fieldKey] || '-';
        return {
          label: field.field_key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value: value,
          unit: null, // Can be extended later
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
  }, [step, order, manufacturingSteps, orderSteps, getStepFields]);

  return {
    order,
    currentStepDefinition,
    currentStepValues,
    previousStepsData,
    isLoading: isLoadingStepsData || isLoadingValues
  };
};
