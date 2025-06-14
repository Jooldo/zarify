
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OrderFunnelChart from './OrderFunnelChart';
import CriticalRawMaterials from './CriticalRawMaterials';
import CriticalFinishedGoods from './CriticalFinishedGoods';
import ConversationalQueryWidget from './ConversationalQueryWidget';
import DailyInsights from './DailyInsights';
import MerchantProfile from '../MerchantProfile';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Separator } from '@/components/ui/separator'; 

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
    if (loading || !profile?.merchantName) return 'Dashboard Overview';
    return `${profile.merchantName} Dashboard`;
  };

  return (
    <div className="space-y-6 p-1"> {/* Adjusted padding and spacing */}
      {/* Header */}
      <div className="pb-4">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-heading mb-1"> {/* Updated gradient */}
          {getDashboardTitle()}
        </h1>
        <div className="flex flex-col gap-1">
          <p className="text-lg font-medium text-primary">{getGreeting()}</p>
          <p className="text-muted-foreground text-sm">A comprehensive overview of your operations and actionable insights.</p>
        </div>
      </div>
      <Separator /> {/* Added separator */}


      {/* Daily Insights - Full width section */}
      <div>
        <DailyInsights />
      </div>
      
      <Separator /> {/* Added separator */}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Funnel - Takes 1 column on large screens */}
        <Card className="lg:col-span-1"> {/* Ensure card styling applies */}
            <CardHeader>
                <CardTitle>Order Funnel</CardTitle>
            </CardHeader>
            <CardContent>
                 <OrderFunnelChart />
            </CardContent>
        </Card>

        {/* Ask Data Widget - Takes 1 column */}
        <Card className="lg:col-span-1"> {/* Ensure card styling applies */}
             <CardHeader>
                <CardTitle>Ask Your Data</CardTitle>
            </CardHeader>
            <CardContent>
                <ConversationalQueryWidget onNavigateToTab={onNavigateToTab} />
            </CardContent>
        </Card>


        {/* Critical Materials - Takes 1 column */}
        <div className="space-y-6 lg:col-span-1">
          <CriticalRawMaterials onNavigateToProcurement={() => onNavigateToTab?.('rm-procurement')} />
          <CriticalFinishedGoods onNavigateToInventory={() => onNavigateToTab?.('fg-inventory')} />
        </div>
      </div>
      
      <Separator /> {/* Added separator */}

      {/* Merchant Profile Section */}
      <Card> {/* Ensure card styling applies */}
        <CardHeader>
            <CardTitle>Merchant Profile</CardTitle>
        </CardHeader>
        <CardContent>
            <MerchantProfile />
        </CardContent>
      </Card>

    </div>
  );
};

export default VisualDashboard;
