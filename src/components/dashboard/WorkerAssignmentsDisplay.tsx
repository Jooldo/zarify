
import React from 'react';
import { useWorkerAssignments } from './worker-assignments/useWorkerAssignments';
import WorkerCard from './worker-assignments/WorkerCard';
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {workerAssignments.map((assignment) => (
        <WorkerCard key={assignment.workerId} assignment={assignment} />
      ))}
    </div>
  );
};

export default WorkerAssignmentsDisplay;
