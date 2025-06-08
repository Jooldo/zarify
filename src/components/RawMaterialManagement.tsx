
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

  const getTabTitle = () => {
    switch (activeTab) {
      case 'rm-inventory':
        return 'Raw Material Inventory';
      case 'rm-procurement':
        return 'Raw Material Procurement';
      case 'rm-analytics':
        return 'Procurement Analytics';
      case 'rm-suppliers':
        return 'Supplier Management';
      case 'rm-config':
        return 'Raw Material Configuration';
      default:
        return 'Raw Material Management';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          {getTabTitle()}
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="rm-inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="rm-procurement" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Procurement
          </TabsTrigger>
          <TabsTrigger value="rm-analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="rm-suppliers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="rm-config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6 mt-6">
          {renderActiveContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RawMaterialManagement;
