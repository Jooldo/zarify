
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
    const foundOrder = manufacturingOrders.find(o => o.id === step.manufacturing_order_id) || null;
    return foundOrder;
  }, [step, manufacturingOrders]);

  const currentStepDefinition = useMemo(() => {
    if (!step || !manufacturingSteps.length) return null;
    const foundStep = manufacturingSteps.find(s => s.id === step.manufacturing_step_id);
    return foundStep;
  }, [step, manufacturingSteps]);

  const currentStepFields = useMemo(() => {
    if (!currentStepDefinition) return [];
    const fields = getStepFields(currentStepDefinition.id);
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
    return values;
  }, [step, currentStepFields, getStepValue]);

  const previousStepsData = useMemo(() => {
    if (!step || !order || !manufacturingSteps.length) {
      return [];
    }

    const currentStepDefinition = manufacturingSteps.find(s => s.id === step.manufacturing_step_id);
    if (!currentStepDefinition) {
      return [];
    }

    // Get all order steps for this specific order
    const allOrderStepsForOrder = orderSteps.filter(os => 
      os.manufacturing_order_id === order.id
    );

    // Get all step definitions and sort by order
    const allStepDefinitions = manufacturingSteps
      .slice()
      .sort((a, b) => Number(a.step_order) - Number(b.step_order));

    const currentStepOrder = Number(currentStepDefinition.step_order);
    const previousStepDefinitions = allStepDefinitions.filter(def => 
      Number(def.step_order) < currentStepOrder
    );

    const result = previousStepDefinitions.map(prevStepDef => {
      // Find the corresponding order step
      const orderStep = allOrderStepsForOrder.find(os => 
        os.manufacturing_step_id === prevStepDef.id
      );

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
