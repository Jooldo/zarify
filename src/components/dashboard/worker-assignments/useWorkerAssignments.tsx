
import { useMemo } from 'react';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useWorkers } from '@/hooks/useWorkers';
import { WorkerAssignment } from './types';

export const useWorkerAssignments = (manufacturingOrders: any[]) => {
  const { orderSteps } = useManufacturingSteps();
  const { workers } = useWorkers();

  const workerAssignments = useMemo(() => {
    if (!orderSteps.length || !workers.length) {
      return [];
    }

    // Filter for order steps with any status except completed
    const activeOrderSteps = orderSteps.filter(
      orderStep => 
        orderStep.status !== 'completed' && orderStep.assigned_worker
    );

    console.log('Active order steps found:', activeOrderSteps.length);

    // Group by worker
    const workerMap = new Map<string, WorkerAssignment>();

    activeOrderSteps.forEach(orderStep => {
      const assignedWorkerId = orderStep.assigned_worker;
      if (!assignedWorkerId) return;

      const worker = workers.find(w => w.id === assignedWorkerId);
      if (!worker) return;

      let stepQuantity = orderStep.quantity_assigned || 0;
      let stepWeight = orderStep.weight_assigned || 0;

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
          stepOrder: 1,
          quantity: 0,
          weight: 0,
          quantityUnit: 'units',
          weightUnit: 'grams',
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
  }, [orderSteps, workers]);

  return workerAssignments;
};
