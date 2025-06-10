import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OrderFunnelChart from './OrderFunnelChart';
import CriticalRawMaterials from './CriticalRawMaterials';
import CriticalFinishedGoods from './CriticalFinishedGoods';
import ConversationalQueryWidget from './ConversationalQueryWidget';
import DailyInsights from './DailyInsights';
import MerchantProfile from '../MerchantProfile';
import { useUserProfile } from '@/hooks/useUserProfile';

interface VisualDashboardProps {
  onNavigateToTab?: (tab: string) => void;
}

const VisualDashboard = ({ onNavigateToTab }: VisualDashboardProps) => {
  const { profile, loading } = useUserProfile();

  const getGreeting = () => {
    if (loading || !profile) return 'Namaskar';
    
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
    return fullName ? `Namaskar ${fullName} ji` : 'Namaskar ji';
  };

  const getDashboardTitle = () => {
    if (loading || !profile?.merchantName) return 'Dashboard';
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
          <p className="text-gray-600 text-sm">Overview of critical operations and actionable insights</p>
        </div>
      </div>

      {/* Daily Insights - Full width section */}
      <div>
        <DailyInsights />
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

      {/* Merchant Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <MerchantProfile />
        </div>
      </div>
    </div>
  );
};

export default VisualDashboard;
