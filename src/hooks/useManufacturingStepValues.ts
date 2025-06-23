
import { useState } from 'react';

// Simple mock hook since manufacturing_order_step_values table doesn't exist
export const useManufacturingStepValues = () => {
  const [stepValues] = useState<any[]>([]);

  const getStepValue = (stepId: string, fieldId: string) => {
    return null; // Return null since table doesn't exist
  };

  return {
    stepValues,
    getStepValue,
    isLoading: false
  };
};
