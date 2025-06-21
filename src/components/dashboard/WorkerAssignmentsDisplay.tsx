
import React from 'react';
import { useWorkerAssignments } from './worker-assignments/useWorkerAssignments';
import WorkerAssignmentsTable from './worker-assignments/WorkerAssignmentsTable';
import LoadingState from './worker-assignments/LoadingState';
import EmptyState from './worker-assignments/EmptyState';
import { WorkerAssignmentsDisplayProps } from './worker-assignments/types';

const WorkerAssignmentsDisplay = ({ manufacturingOrders, loading }: WorkerAssignmentsDisplayProps) => {
  const workerAssignments = useWorkerAssignments(manufacturingOrders);

  if (loading) {
    return <LoadingState />;
  }

  if (workerAssignments.length === 0) {
    return <EmptyState />;
  }

  return <WorkerAssignmentsTable assignments={workerAssignments} />;
};

export default WorkerAssignmentsDisplay;
