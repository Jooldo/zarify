
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
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Raw Material Management
                </h1>
                <p className="text-sm text-gray-600">
                  Manage inventory, procurement, suppliers, and analytics
                </p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-gray-100">
                <TabsTrigger value="rm-inventory" className="flex items-center gap-2 data-[state=active]:bg-white">
                  <Package className="h-4 w-4" />
                  Inventory
                </TabsTrigger>
                <TabsTrigger value="rm-procurement" className="flex items-center gap-2 data-[state=active]:bg-white">
                  <ShoppingBag className="h-4 w-4" />
                  Procurement
                </TabsTrigger>
                <TabsTrigger value="rm-analytics" className="flex items-center gap-2 data-[state=active]:bg-white">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="rm-suppliers" className="flex items-center gap-2 data-[state=active]:bg-white">
                  <Users className="h-4 w-4" />
                  Suppliers
                </TabsTrigger>
                <TabsTrigger value="rm-config" className="flex items-center gap-2 data-[state=active]:bg-white">
                  <Settings className="h-4 w-4" />
                  Config
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="min-h-[600px]">
            <Tabs value={activeTab} className="w-full">
              <TabsContent value={activeTab} className="mt-0 animate-fade-in">
                {renderActiveContent()}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RawMaterialManagement;
