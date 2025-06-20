
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Factory, ClipboardList, Settings } from 'lucide-react';
import FinishedGoodsInventory from './FinishedGoodsInventory';
import ManufacturingDashboard from './manufacturing/ManufacturingDashboard';
import ProductionQueueView from './manufacturing/ProductionQueueView';
import ManufacturingSettings from './manufacturing/config/ManufacturingSettings';
import CreateManufacturingOrderDialog from './manufacturing/CreateManufacturingOrderDialog';
import FullPageProductionFlow from './manufacturing/FullPageProductionFlow';
import { ManufacturingOrder } from '@/types/manufacturingOrders';
import { useNavigation } from '@/contexts/NavigationContext';

interface FinishedGoodManagementProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const FinishedGoodManagement: React.FC<FinishedGoodManagementProps> = ({
  activeTab,
  onTabChange,
}) => {
  const [createOrderDialogOpen, setCreateOrderDialogOpen] = useState(false);
  const [selectedOrderForFlow, setSelectedOrderForFlow] = useState<ManufacturingOrder | null>(null);
  const { showTabNavigation } = useNavigation();

  // Handle flow view state
  const handleViewFlow = (order: ManufacturingOrder) => {
    setSelectedOrderForFlow(order);
  };

  const handleBackFromFlow = () => {
    setSelectedOrderForFlow(null);
  };

  // If showing flow view, render the full-page component
  if (selectedOrderForFlow) {
    return (
      <FullPageProductionFlow
        order={selectedOrderForFlow}
        onBack={handleBackFromFlow}
      />
    );
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case 'fg-inventory':
        return 'Finished Goods Inventory';
      case 'fg-manufacturing':
        return 'Manufacturing Orders';
      default:
        return 'Finished Goods';
    }
  };

  const getTabIcon = () => {
    switch (activeTab) {
      case 'fg-inventory':
        return <Factory className="h-4 w-4" />;
      case 'fg-manufacturing':
        return <ClipboardList className="h-4 w-4" />;
      default:
        return <Factory className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {showTabNavigation && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            {getTabIcon()}
            <h2 className="text-xl font-semibold">{getTabTitle()}</h2>
          </div>
          
          {activeTab === 'fg-manufacturing' && (
            <Button onClick={() => setCreateOrderDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Manufacturing Order
            </Button>
          )}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        {showTabNavigation && (
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="fg-inventory" className="flex items-center gap-2">
              <Factory className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="fg-manufacturing" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Manufacturing
            </TabsTrigger>
            <TabsTrigger value="fg-production-queue" className="flex items-center gap-2">
              <Factory className="h-4 w-4" />
              Production Queue
            </TabsTrigger>
            <TabsTrigger value="fg-config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuration
            </TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="fg-inventory" className="space-y-6 mt-6">
          <FinishedGoodsInventory />
        </TabsContent>

        <TabsContent value="fg-manufacturing" className="space-y-6 mt-6">
          <ManufacturingDashboard onViewFlow={handleViewFlow} />
        </TabsContent>

        <TabsContent value="fg-production-queue" className="space-y-6 mt-6">
          <ProductionQueueView />
        </TabsContent>

        <TabsContent value="fg-config" className="space-y-6 mt-6">
          <ManufacturingSettings />
        </TabsContent>
      </Tabs>

      <CreateManufacturingOrderDialog
        open={createOrderDialogOpen}
        onOpenChange={setCreateOrderDialogOpen}
      />
    </div>
  );
};

export default FinishedGoodManagement;
