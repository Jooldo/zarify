
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OrderFunnelChart from './OrderFunnelChart';
import CriticalRawMaterials from './CriticalRawMaterials';
import CriticalFinishedGoods from './CriticalFinishedGoods';
import ConversationalQueryWidget from './ConversationalQueryWidget';

interface VisualDashboardProps {
  onNavigateToTab?: (tab: string) => void;
}

const VisualDashboard = ({ onNavigateToTab }: VisualDashboardProps) => {
  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Admin Dashboard</h1>
        <p className="text-gray-600 text-sm">Overview of critical operations and actionable insights</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Funnel - Takes 1 column on large screens */}
        <div>
          <OrderFunnelChart onNavigateToOrders={() => onNavigateToTab?.('orders')} />
        </div>

        {/* Ask Data Widget - Takes 1 column */}
        <div>
          <ConversationalQueryWidget onNavigateToTab={onNavigateToTab} />
        </div>

        {/* Critical Materials - Takes 1 column */}
        <div className="space-y-6">
          <CriticalRawMaterials onNavigateToProcurement={() => onNavigateToTab?.('inventory')} />
          <CriticalFinishedGoods onNavigateToInventory={() => onNavigateToTab?.('inventory')} />
        </div>
      </div>
    </div>
  );
};

export default VisualDashboard;
