
import { Package, Factory, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigation } from '@/contexts/NavigationContext';
import FinishedGoodsInventory from './FinishedGoodsInventory';
import ManufacturingDashboard from './manufacturing/ManufacturingDashboard';

// Placeholder component for analytics
const FGAnalyticsPlaceholder = () => (
  <div className="p-8 text-center">
    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-semibold mb-2">Analytics</h3>
    <p className="text-gray-500">Analytics functionality will be implemented here</p>
  </div>
);

interface FinishedGoodManagementProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const FinishedGoodManagement = ({ activeTab, onTabChange }: FinishedGoodManagementProps) => {
  const { showPageHeaders, showTabNavigation } = useNavigation();

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'fg-inventory':
        return <FinishedGoodsInventory />;
      case 'fg-manufacturing':
        return <ManufacturingDashboard />;
      case 'fg-analytics':
        return <FGAnalyticsPlaceholder />;
      default:
        return <FinishedGoodsInventory />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Conditional Header Section */}
      {showPageHeaders && (
        <div className="bg-card border-b border-border">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Finished Good Management
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage inventory, manufacturing, and analytics
              </p>
            </div>
          </div>

          {showTabNavigation && (
            <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted h-12">
                <TabsTrigger value="fg-inventory" className="flex items-center gap-2 data-[state=active]:bg-background">
                  <Package className="h-4 w-4" />
                  Inventory
                </TabsTrigger>
                <TabsTrigger value="fg-manufacturing" className="flex items-center gap-2 data-[state=active]:bg-background">
                  <Factory className="h-4 w-4" />
                  Manufacturing
                </TabsTrigger>
                <TabsTrigger value="fg-analytics" className="flex items-center gap-2 data-[state=active]:bg-background">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="bg-background py-6">
        <div className="min-h-[700px]">
          <Tabs value={activeTab} className="w-full">
            <TabsContent value={activeTab} className="mt-0 animate-fade-in">
              <div className="space-y-6">
                {renderActiveContent()}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FinishedGoodManagement;
