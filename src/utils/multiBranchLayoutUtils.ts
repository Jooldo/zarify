
export interface BranchInfo {
  id: string;
  type: 'progression' | 'rework' | 'qc';
  targetStepName: string;
  targetNodeId: string;
  quantity?: number;
  label: string;
}

export interface MultiBranchLayoutConfig {
  nodeSpacing: number;
  stepCardSpacing: number;
  childOrderOffset: number;
  branchVerticalSpacing: number;
  minVerticalGap: number;
  cardWidth: number;
  cardHeight: number;
}

export const DEFAULT_MULTI_BRANCH_CONFIG: MultiBranchLayoutConfig = {
  nodeSpacing: 600,
  stepCardSpacing: 500,
  childOrderOffset: 400,
  branchVerticalSpacing: 150,
  minVerticalGap: 100,
  cardWidth: 320,
  cardHeight: 250,
};

export interface LayoutPosition {
  x: number;
  y: number;
}

export const calculateBranchPositions = (
  sourcePosition: LayoutPosition,
  branches: BranchInfo[],
  stepIndex: number,
  config: MultiBranchLayoutConfig = DEFAULT_MULTI_BRANCH_CONFIG
): Map<string, LayoutPosition> => {
  const positions = new Map<string, LayoutPosition>();
  
  if (branches.length === 0) {
    return positions;
  }

  // If only one branch, place it normally
  if (branches.length === 1) {
    const targetPosition = {
      x: sourcePosition.x + config.stepCardSpacing,
      y: sourcePosition.y
    };
    positions.set(branches[0].targetNodeId, targetPosition);
    return positions;
  }

  // For multiple branches, spread them vertically
  const totalHeight = (branches.length - 1) * config.branchVerticalSpacing;
  const startY = sourcePosition.y - (totalHeight / 2);

  branches.forEach((branch, index) => {
    const branchY = startY + (index * config.branchVerticalSpacing);
    const branchX = sourcePosition.x + config.stepCardSpacing;
    
    positions.set(branch.targetNodeId, {
      x: branchX,
      y: branchY
    });
  });

  return positions;
};

export const calculateVerticalBranchSpacing = (
  branchCount: number,
  config: MultiBranchLayoutConfig = DEFAULT_MULTI_BRANCH_CONFIG
): number => {
  if (branchCount <= 1) return 0;
  return (branchCount - 1) * config.branchVerticalSpacing;
};

export const optimizeBranchLayout = (
  parentOrders: any[],
  childOrdersMap: Map<string, any[]>,
  stepBranchesMap: Map<string, BranchInfo[]>,
  config: MultiBranchLayoutConfig = DEFAULT_MULTI_BRANCH_CONFIG
): Map<string, LayoutPosition> => {
  const positions = new Map<string, LayoutPosition>();
  let currentY = 50;

  parentOrders.forEach((order, orderIndex) => {
    const childOrders = childOrdersMap.get(order.id) || [];
    
    // Calculate total height needed for this order including all branches
    let maxBranchHeight = 0;
    
    // Check all steps for this order to find the maximum branch spread
    const orderSteps = Array.from(stepBranchesMap.entries())
      .filter(([stepId, _]) => stepId.includes(order.id));
    
    orderSteps.forEach(([_, branches]) => {
      if (branches.length > 1) {
        const branchHeight = calculateVerticalBranchSpacing(branches.length, config);
        maxBranchHeight = Math.max(maxBranchHeight, branchHeight);
      }
    });

    // Add space for child orders
    const childOrdersHeight = childOrders.length * config.childOrderOffset;
    const totalRowHeight = Math.max(
      config.cardHeight + config.minVerticalGap,
      maxBranchHeight + config.minVerticalGap,
      childOrdersHeight + config.minVerticalGap
    );

    // Position parent order
    const parentPosition = {
      x: 50,
      y: currentY
    };
    positions.set(`parent-${order.id}`, parentPosition);

    // Position child orders
    childOrders.forEach((childOrder, childIndex) => {
      const childPosition = {
        x: parentPosition.x + 100,
        y: parentPosition.y + ((childIndex + 1) * config.childOrderOffset)
      };
      positions.set(`child-${childOrder.id}`, childPosition);
    });

    currentY += totalRowHeight;
  });

  return positions;
};

export const detectStepBranches = (
  orderStep: any,
  orderSteps: any[],
  manufacturingOrders: any[],
  manufacturingSteps: any[]
): BranchInfo[] => {
  const branches: BranchInfo[] = [];

  // Check for next step progression (for completed steps)
  if (orderStep.status === 'completed' && orderStep.manufacturing_steps) {
    const currentStepOrder = orderStep.manufacturing_steps.step_order;
    const nextStep = manufacturingSteps.find(step => 
      step.step_order === currentStepOrder + 1 && 
      step.is_active && 
      step.merchant_id === orderStep.merchant_id
    );

    if (nextStep) {
      branches.push({
        id: `progression-${orderStep.id}-${nextStep.id}`,
        type: 'progression',
        targetStepName: nextStep.step_name,
        targetNodeId: `next-step-${orderStep.manufacturing_order_id}-${nextStep.id}`,
        label: 'Next Step'
      });
    }
  }

  // Check for rework branches (for partially completed steps)
  if (orderStep.status === 'partially_completed') {
    // Find rework orders created from this step
    const reworkOrders = manufacturingOrders.filter(order => 
      order.parent_order_id === orderStep.manufacturing_order_id &&
      order.rework_from_step === orderStep.manufacturing_steps?.step_order
    );

    reworkOrders.forEach(reworkOrder => {
      // Find the current step of the rework order
      const reworkOrderSteps = orderSteps.filter(step => 
        String(step.manufacturing_order_id) === String(reworkOrder.id)
      );
      
      if (reworkOrderSteps.length > 0) {
        const currentReworkStep = reworkOrderSteps
          .sort((a, b) => b.step_order - a.step_order)[0];
        
        branches.push({
          id: `rework-${orderStep.id}-${reworkOrder.id}`,
          type: 'rework',
          targetStepName: currentReworkStep.manufacturing_steps?.step_name || 'Rework',
          targetNodeId: `child-${reworkOrder.id}`,
          quantity: reworkOrder.quantity_required,
          label: 'Rework'
        });
      }
    });

    // Also check for progression of accepted quantity
    if (orderStep.manufacturing_steps) {
      const currentStepOrder = orderStep.manufacturing_steps.step_order;
      const nextStep = manufacturingSteps.find(step => 
        step.step_order === currentStepOrder + 1 && 
        step.is_active && 
        step.merchant_id === orderStep.merchant_id
      );

      if (nextStep) {
        // Check if there's already a next step in progress for this order
        const nextStepInProgress = orderSteps.find(step =>
          String(step.manufacturing_order_id) === String(orderStep.manufacturing_order_id) &&
          step.manufacturing_step_id === nextStep.id
        );

        if (nextStepInProgress) {
          branches.push({
            id: `partial-progression-${orderStep.id}-${nextStep.id}`,
            type: 'progression',
            targetStepName: nextStep.step_name,
            targetNodeId: `step-details-${nextStepInProgress.id}`,
            label: 'Accepted Qty'
          });
        }
      }
    }
  }

  return branches;
};
