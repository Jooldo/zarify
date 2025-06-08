
import { Package, Settings, ShoppingBag, BarChart3, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RawMaterialInventory from './RawMaterialInventory';
import RawMaterialsConfig from './config/RawMaterialsConfig';
import RMProcurementTab from './procurement/RMProcurementTab';
import ProcurementAnalytics from './procurement/ProcurementAnalytics';
import SupplierManagement from './procurement/SupplierManagement';

interface RawMaterialManagementProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const RawMaterialManagement = ({ activeTab, onTabChange }: RawMaterialManagementProps) => {
  const renderActiveContent = () => {
    switch (activeTab) {
      case 'rm-inventory':
        return <RawMaterialInventory onRequestCreated={() => {}} />;
      case 'rm-procurement':
        return <RMProcurementTab />;
      case 'rm-analytics':
        return <ProcurementAnalytics />;
      case 'rm-suppliers':
        return <SupplierManagement />;
      case 'rm-config':
        return <RawMaterialsConfig />;
      default:
        return <RawMaterialInventory onRequestCreated={() => {}} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header Section */}
      <div className="bg-card border-b border-border">
        <div className="flex items-center justify-between py-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Raw Material Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage inventory, procurement, suppliers, and analytics
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-muted h-12">
            <TabsTrigger value="rm-inventory" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Package className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="rm-procurement" className="flex items-center gap-2 data-[state=active]:bg-background">
              <ShoppingBag className="h-4 w-4" />
              Procurement
            </TabsTrigger>
            <TabsTrigger value="rm-analytics" className="flex items-center gap-2 data-[state=active]:bg-background">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="rm-suppliers" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Users className="h-4 w-4" />
              Suppliers
            </TabsTrigger>
            <TabsTrigger value="rm-config" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Settings className="h-4 w-4" />
              Config
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

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
