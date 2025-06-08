
import { Package, Settings, ShoppingBag, BarChart3, Building2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    <div className="space-y-4">
      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="rm-inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="rm-procurement" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Procurement</span>
          </TabsTrigger>
          <TabsTrigger value="rm-analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="rm-suppliers" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Suppliers</span>
          </TabsTrigger>
          <TabsTrigger value="rm-config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Config</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {renderActiveContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RawMaterialManagement;
