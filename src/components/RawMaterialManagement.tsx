
import { Package, Settings, ShoppingBag, Home } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigation } from '@/contexts/NavigationContext';
import RawMaterialInventory from './RawMaterialInventory';
import RawMaterialsConfig from './config/RawMaterialsConfig';
import RMProcurementTab from './procurement/RMProcurementTab';
import RMHomeDashboard from './rawmaterial/RMHomeDashboard';

interface RawMaterialManagementProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const RawMaterialManagement = ({ activeTab, onTabChange }: RawMaterialManagementProps) => {
  const { showPageHeaders, showTabNavigation } = useNavigation();

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'rm-inventory':
        return <RawMaterialInventory onRequestCreated={() => {}} />;
      case 'rm-procurement':
        return <RMProcurementTab />;
      case 'rm-home':
        return <RMHomeDashboard onNavigateToTab={onTabChange} />;
      case 'rm-config':
        return <RawMaterialsConfig />;
      default:
        return <RMHomeDashboard onNavigateToTab={onTabChange} />;
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
                Raw Material Management
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage inventory, procurement, and analytics
              </p>
            </div>
          </div>

          {showTabNavigation && (
            <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-muted h-12">
                <TabsTrigger value="rm-home" className="flex items-center gap-2 data-[state=active]:bg-background">
                  <Home className="h-4 w-4" />
                  Home
                </TabsTrigger>
                <TabsTrigger value="rm-inventory" className="flex items-center gap-2 data-[state=active]:bg-background">
                  <Package className="h-4 w-4" />
                  Inventory
                </TabsTrigger>
                <TabsTrigger value="rm-procurement" className="flex items-center gap-2 data-[state=active]:bg-background">
                  <ShoppingBag className="h-4 w-4" />
                  Procurement
                </TabsTrigger>
                <TabsTrigger value="rm-config" className="flex items-center gap-2 data-[state=active]:bg-background">
                  <Settings className="h-4 w-4" />
                  Config
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

export default RawMaterialManagement;
