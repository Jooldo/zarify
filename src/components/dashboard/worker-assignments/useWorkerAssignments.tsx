
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
    if (!Array.isArray(orderSteps) || orderSteps.length === 0 || 
        !Array.isArray(manufacturingSteps) || manufacturingSteps.length === 0 || 
        !Array.isArray(stepFields) || stepFields.length === 0 || 
        !Array.isArray(workers) || workers.length === 0) {
      return [];
    }

    // Filter for order steps with any status except completed
    const activeOrderSteps = orderSteps.filter(
      orderStep => 
        orderStep &&
        orderStep.status !== 'completed'
    );

    console.log('Active order steps found:', activeOrderSteps.length);

    // Group by worker using field values
    const workerMap = new Map<string, WorkerAssignment>();

    activeOrderSteps.forEach(orderStep => {
      if (!orderStep) return;

      const stepFieldsConfig = getStepFields(orderStep.step_name);
      
      // Get worker ID from assigned_worker field
      const assignedWorkerId = orderStep.assigned_worker;
      if (!assignedWorkerId) return;

      const worker = workers.find(w => w.id === assignedWorkerId);
      if (!worker) return;

      let stepQuantity = orderStep.quantity_assigned || 0;
      let stepWeight = orderStep.weight_assigned || 0;
      const quantityUnit = 'pieces'; // Default unit
      const weightUnit = 'grams'; // Default unit

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
      let existingStep = assignment.steps.find(s => s.stepName === orderStep.step_name);
      
      if (!existingStep) {
        existingStep = {
          stepName: orderStep.step_name,
          stepOrder: 1, // Default order
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
      
      if (!existingStep.orderIds.includes(orderStep.order_id)) {
        existingStep.orderIds.push(orderStep.order_id);
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
