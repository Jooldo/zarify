
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CriticalStockAlerts from './CriticalStockAlerts';
import LiveOrderFunnel from './LiveOrderFunnel';
import ProcurementStatusOverview from './ProcurementStatusOverview';
import ManufacturingLoad from './ManufacturingLoad';
import TodaysActivities from './TodaysActivities';

const VisualDashboard = () => {
  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Dashboard</h1>
        <p className="text-gray-600">Critical insights and actionable alerts at a glance</p>
      </div>

      {/* Top Row - Critical Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <CriticalStockAlerts />
        </div>
        <div className="md:col-span-2">
          <LiveOrderFunnel />
        </div>
      </div>

      {/* Middle Row - Status and Manufacturing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <ProcurementStatusOverview />
        </div>
        <div>
          <ManufacturingLoad />
        </div>
        <div>
          <TodaysActivities />
        </div>
      </div>
    </div>
  );
};

export default VisualDashboard;
