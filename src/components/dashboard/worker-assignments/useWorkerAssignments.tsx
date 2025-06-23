
import { useMemo } from 'react';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useWorkers } from '@/hooks/useWorkers';
import { WorkerAssignment } from './types';

export const useWorkerAssignments = (manufacturingOrders: any[]) => {
  const { manufacturingSteps, orderSteps, stepFields, getStepFields } = useManufacturingSteps();
  const { getStepValue } = useManufacturingStepValues();
  const { workers } = useWorkers();

  const workerAssignments = useMemo(() => {
    if (!orderSteps.length || !manufacturingSteps.length || !stepFields.length || !workers.length) {
      return [];
    }

    // Filter for order steps with any status except completed
    const activeOrderSteps = orderSteps.filter(
      orderStep => 
        orderStep.manufacturing_steps &&
        orderStep.status !== 'completed'
    );

    console.log('Active order steps found:', activeOrderSteps.length);

    // Group by worker using field values
    const workerMap = new Map<string, WorkerAssignment>();

    activeOrderSteps.forEach(orderStep => {
      const manufacturingStep = orderStep.manufacturing_steps;
      if (!manufacturingStep) return;

      const stepFieldsConfig = getStepFields(orderStep.manufacturing_step_id);
      
      // Find worker field configuration
      const workerField = stepFieldsConfig.find(field => field.field_type === 'worker');
      if (!workerField) return;

      // Get worker ID from step values
      const assignedWorkerId = getStepValue(orderStep.id, workerField.field_id);
      if (!assignedWorkerId) return;

      const worker = workers.find(w => w.id === assignedWorkerId);
      if (!worker) return;

      // Find quantity and weight fields
      const quantityField = stepFieldsConfig.find(field => 
        ['quantityAssigned', 'quantity_assigned', 'quantity'].includes(field.field_name)
      );
      const weightField = stepFieldsConfig.find(field => 
        ['rawMaterialWeightAssigned', 'weight_assigned', 'weight'].includes(field.field_name)
      );

      let stepQuantity = 0;
      let stepWeight = 0;
      const quantityUnit = quantityField?.field_options?.unit || null;
      const weightUnit = weightField?.field_options?.unit || null;

      if (quantityField) {
        const quantityValue = getStepValue(orderStep.id, quantityField.field_id);
        stepQuantity = parseFloat(quantityValue) || 0;
      }

      if (weightField) {
        const weightValue = getStepValue(orderStep.id, weightField.field_id);
        stepWeight = parseFloat(weightValue) || 0;
      }

      if (!workerMap.has(assignedWorkerId)) {
        workerMap.set(assignedWorkerId, {
          workerId: assignedWorkerId,
          workerName: worker.name,
          totalQuantity: 0,
          totalWeight: 0,
          orderCount: 0,
          steps: []
        });
      }

      const assignment = workerMap.get(assignedWorkerId)!;
      
      // Check if step already exists for this worker
      let existingStep = assignment.steps.find(s => s.stepName === manufacturingStep.step_name);
      
      if (!existingStep) {
        existingStep = {
          stepName: manufacturingStep.step_name,
          stepOrder: manufacturingStep.step_order,
          quantity: 0,
          weight: 0,
          quantityUnit,
          weightUnit,
          orderIds: [],
          status: orderStep.status
        };
        assignment.steps.push(existingStep);
      } else {
        // Update status to show the most advanced status
        if (orderStep.status === 'in_progress' || existingStep.status === 'pending') {
          existingStep.status = orderStep.status;
        }
      }

      // Add to totals
      assignment.totalQuantity += stepQuantity;
      assignment.totalWeight += stepWeight;
      existingStep.quantity += stepQuantity;
      existingStep.weight += stepWeight;
      
      if (!existingStep.orderIds.includes(orderStep.manufacturing_order_id)) {
        existingStep.orderIds.push(orderStep.manufacturing_order_id);
        assignment.orderCount += 1;
      }
    });

    // Sort steps by step order for each worker
    workerMap.forEach(assignment => {
      assignment.steps.sort((a, b) => a.stepOrder - b.stepOrder);
    });

    const assignments = Array.from(workerMap.values());
    console.log('Final worker assignments:', assignments);
    return assignments;
  }, [orderSteps, manufacturingSteps, stepFields, workers, getStepFields, getStepValue]);

  return workerAssignments;
};
