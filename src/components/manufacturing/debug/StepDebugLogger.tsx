
import React, { useEffect } from 'react';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { ManufacturingOrderStep } from '@/hooks/useManufacturingSteps';

interface StepDebugLoggerProps {
  open: boolean;
  order: ManufacturingOrder | null;
  step: ManufacturingOrderStep | null;
}

export const StepDebugLogger: React.FC<StepDebugLoggerProps> = ({ open, order, step }) => {
  const { manufacturingSteps, stepFields } = useManufacturingSteps();
  const { stepValues } = useManufacturingStepValues();

  useEffect(() => {
    if (!open || !step || !order) return;

    console.log('=== STEP DEBUG LOGGER ===');
    console.log('Step:', step);
    console.log('Order:', order);
    
    // Debug step configuration
    console.log('Step Configuration:');
    console.log('- Step Name:', step.step_name);
    console.log('- Order ID:', step.order_id);
    console.log('- Status:', step.status);
    
    // Debug step fields
    const currentStepFields = stepFields.filter(field => 
      field.step_name === step.step_name
    );
    
    console.log('Step Fields Configuration:');
    currentStepFields.forEach(field => {
      console.log(`- Field: ${field.field_key}`);
      console.log(`  - ID: ${field.id}`);
    });

    // Debug manufacturing steps config
    console.log('Manufacturing Steps Config:');
    manufacturingSteps.forEach(configStep => {
      console.log(`- Step: ${configStep.step_name} (Order: ${configStep.step_order})`);
    });

    // Debug step values  
    const currentStepValues = stepValues.filter(value => 
      value.step_id === step.id
    );
    
    console.log('Step Values:');
    currentStepValues.forEach(value => {
      console.log(`- Field ${value.field_key}: ${value.field_value}`);
    });

    // Debug order information
    console.log('Order Information:');
    console.log('- Order Number:', order.order_number);
    console.log('- Product Name:', order.product_name);
    console.log('- Status:', order.status);
    console.log('- Assigned Worker:', step.assigned_worker);

    // Debug field configuration details
    console.log('Field Configuration Details:');
    currentStepFields.forEach(field => {
      console.log(`- ${field.field_key}:`);
      console.log(`  - ID: ${field.id}`);
      console.log(`  - Unit: ${field.unit || 'N/A'}`);
      console.log(`  - Visible: ${field.is_visible}`);
    });

    console.log('=== END STEP DEBUG ===');
  }, [open, step, order, manufacturingSteps, stepFields, stepValues]);

  return null;
};
