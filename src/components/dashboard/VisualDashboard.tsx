
import { useUserProfile } from '@/hooks/useUserProfile';
import DashboardCharts from './DashboardCharts';
import DeliveryTimeline from '../orders/DeliveryTimeline';
import { useOrders } from '@/hooks/useOrders';
import { OrderFilters } from '@/components/OrdersTab';
import StockStatusChart from './StockStatusChart';
import ManufacturingOverviewChart from './ManufacturingOverviewChart';

interface VisualDashboardProps {
  onNavigateToTab?: (tab: string, filters?: Partial<OrderFilters>) => void;
}

const VisualDashboard = ({ onNavigateToTab }: VisualDashboardProps) => {
  const { profile, loading: profileLoading } = useUserProfile();
  const { orders, loading: ordersLoading } = useOrders();

  const getOverallOrderStatus = (orderId: string) => {
    const order = orders.find(o => o.order_number === orderId);
    if (!order) return "Created";
    
    const statuses = order.order_items.map(sub => sub.status);
    
    if (statuses.every(s => s === "Delivered")) return "Delivered";
    if (statuses.every(s => s === "Ready")) return "Ready";
    if (statuses.some(s => s === "In Progress" || s === "Partially Fulfilled" || statuses.some(s => s === 'Created' && statuses.some(st => st !== 'Created')))) return "In Progress";
    if (statuses.every(s => s === "Created")) return "Created";
    if (statuses.some(s => s !== "Created") && statuses.some(s => s === "Created")) {
        return "In Progress";
    }
    return "Created";
  };

  const handleMetricClick = (filter: Partial<OrderFilters>) => {
    if (onNavigateToTab) {
      onNavigateToTab('orders', filter);
    }
  };

  const getGreeting = () => {
    if (profileLoading || !profile) return 'Namaskar';
    
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
    return fullName ? `Namaskar ${fullName} ji` : 'Namaskar ji';
  };

  const getDashboardTitle = () => {
    if (profileLoading || !profile?.merchantName) return 'Dashboard';
    return `${profile.merchantName} Dashboard`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          {getDashboardTitle()}
        </h1>
        <div className="flex flex-col gap-1">
          <p className="text-lg font-medium text-blue-600">{getGreeting()}</p>
          <p className="text-gray-600 text-sm">Welcome to your dashboard. Let's get started!</p>
        </div>
      </div>

      {!ordersLoading && (
        <DeliveryTimeline
          orders={orders}
          getOverallOrderStatus={getOverallOrderStatus}
          onMetricClick={handleMetricClick}
        />
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StockStatusChart />
        <ManufacturingOverviewChart />
      </div>

      <DashboardCharts />
    </div>
  );
};

export default VisualDashboard;
