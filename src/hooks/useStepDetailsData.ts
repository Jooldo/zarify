
import { useMemo } from 'react';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import { useStoredPreviousStepsData } from '@/hooks/useStoredPreviousStepsData';
import { Tables } from '@/integrations/supabase/types';

export const useStepDetailsData = (step: Tables<'manufacturing_order_steps'> | null) => {
  const { manufacturingSteps, getStepFields, isLoading: isLoadingStepsData } = useManufacturingSteps();
  const { getStepValue, isLoading: isLoadingValues } = useManufacturingStepValues();
  const { manufacturingOrders } = useManufacturingOrders();
  
  // Use the new stored previous steps data hook
  const { data: storedPreviousStepsData = [], isLoading: isLoadingStoredData } = useStoredPreviousStepsData(
    step?.id || null
  );

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

  // Transform stored data to match the expected format
  const previousStepsData = useMemo(() => {
    return storedPreviousStepsData.map(stepData => ({
      stepName: stepData.stepName,
      stepOrder: stepData.stepOrder,
      values: Object.entries(stepData.fieldValues).map(([label, value]) => ({
        label,
        value,
        unit: undefined, // Unit info is embedded in the stored value
      })),
      missing: stepData.missing,
      status: stepData.status,
      startedAt: stepData.startedAt,
      completedAt: stepData.completedAt,
      workerName: stepData.workerName,
    }));
  }, [storedPreviousStepsData]);

  return {
    order,
    currentStepDefinition,
    currentStepValues,
    previousStepsData,
    isLoading: isLoadingStepsData || isLoadingValues || isLoadingStoredData
  };
};
