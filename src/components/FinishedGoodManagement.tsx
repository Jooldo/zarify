
import { Package, Wrench, ShoppingBag } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FinishedGoodsInventory from './FinishedGoodsInventory';
import FinishedGoodsConfig from './config/FinishedGoodsConfig';
import FGProcurementTab from './procurement/FGProcurementTab';

interface FinishedGoodManagementProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const FinishedGoodManagement = ({ activeTab, onTabChange }: FinishedGoodManagementProps) => {
  const renderActiveContent = () => {
    switch (activeTab) {
      case 'fg-inventory':
        return <FinishedGoodsInventory />;
      case 'fg-procurement':
        return <FGProcurementTab />;
      case 'fg-config':
        return <FinishedGoodsConfig />;
      default:
        return <FinishedGoodsInventory />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header Section */}
      <div className="bg-card border-b border-border">
        <div className="flex items-center justify-between py-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Finished Good Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage inventory, production planning, and configuration
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted h-12">
            <TabsTrigger value="fg-inventory" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Package className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="fg-procurement" className="flex items-center gap-2 data-[state=active]:bg-background">
              <ShoppingBag className="h-4 w-4" />
              Production
            </TabsTrigger>
            <TabsTrigger value="fg-config" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Wrench className="h-4 w-4" />
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

export default FinishedGoodManagement;
