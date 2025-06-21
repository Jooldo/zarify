
export interface WorkerAssignment {
  workerId: string;
  workerName: string;
  totalQuantity: number;
  totalWeight: number;
  orderCount: number;
  steps: Array<{
    stepName: string;
    stepOrder: number;
    quantity: number;
    weight: number;
    quantityUnit: string | null;
    weightUnit: string | null;
    orderIds: string[];
    status: string;
  }>;
}

export interface WorkerAssignmentsDisplayProps {
  manufacturingOrders: any[];
  loading: boolean;
}
