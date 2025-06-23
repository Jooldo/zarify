
export const calculateRemainingWeight = (
  parentStep: any,
  childSteps: any[],
  parentStepName: string,
  parentInstanceNumber: number
): number => {
  if (!parentStep || !parentStep.weight_received) {
    return 0;
  }

  // Find all child steps that have this parent as their source
  const childStepsForParent = childSteps.filter(step => 
    step.parent_instance_id === parentStep.id
  );

  // Sum up all weights already assigned to child instances
  const totalAssignedWeight = childStepsForParent.reduce((sum, step) => {
    return sum + (step.weight_assigned || 0);
  }, 0);

  // Return remaining weight (parent received - already assigned to children)
  return Math.max(0, (parentStep.weight_received || 0) - totalAssignedWeight);
};

export const calculateRemainingQuantity = (
  parentStep: any,
  childSteps: any[],
  parentStepName: string,
  parentInstanceNumber: number
): number => {
  if (!parentStep || !parentStep.quantity_received) {
    return 0;
  }

  // Find all child steps that have this parent as their source
  const childStepsForParent = childSteps.filter(step => 
    step.parent_instance_id === parentStep.id
  );

  // Sum up all quantities already assigned to child instances
  const totalAssignedQuantity = childStepsForParent.reduce((sum, step) => {
    return sum + (step.quantity_assigned || 0);
  }, 0);

  // Return remaining quantity (parent received - already assigned to children)
  return Math.max(0, (parentStep.quantity_received || 0) - totalAssignedQuantity);
};

export const findWorkerName = (workerId: string | null, workers: any[]): string => {
  if (!workerId || workerId === 'unassigned') {
    return 'Unassigned';
  }
  
  const worker = workers.find(w => w.id === workerId);
  return worker ? worker.name : 'Unknown Worker';
};
