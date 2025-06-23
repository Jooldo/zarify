
import React from 'react';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import DashboardCharts from './DashboardCharts';
import WorkerAssignmentsDisplay from './WorkerAssignmentsDisplay';
import ManufacturingLoad from './ManufacturingLoad';
import FinishedGoodsManufacturingDistribution from './FinishedGoodsManufacturingDistribution';

const UnifiedDashboard = () => {
  const { manufacturingOrders, isLoading } = useManufacturingOrders();
  
  // Ensure manufacturingOrders is always an array
  const ordersArray = Array.isArray(manufacturingOrders) ? manufacturingOrders : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manufacturing Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your manufacturing operations and progress
        </p>
      </div>

      {/* Charts Section */}
      <DashboardCharts />

      {/* Manufacturing Load */}
      <ManufacturingLoad />

      {/* Worker Assignments */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Worker Assignments</h2>
          <p className="text-muted-foreground">
            Current worker assignments across manufacturing steps
          </p>
        </div>
        <WorkerAssignmentsDisplay 
          manufacturingOrders={ordersArray} 
          loading={isLoading} 
        />
      </div>

      {/* Manufacturing Distribution */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Manufacturing Progress</h2>
          <p className="text-muted-foreground">
            Distribution of work across manufacturing steps
          </p>
        </div>
        <FinishedGoodsManufacturingDistribution 
          manufacturingOrders={ordersArray} 
          loading={isLoading} 
        />
      </div>
    </div>
  );
};

export default UnifiedDashboard;
