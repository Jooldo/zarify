
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Wrench, ShoppingBag } from 'lucide-react';
import FinishedGoodsInventory from './FinishedGoodsInventory';
import FinishedGoodsConfig from './config/FinishedGoodsConfig';
import FGProcurementTab from './procurement/FGProcurementTab';

interface FinishedGoodManagementProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const FinishedGoodManagement = ({ activeTab, onTabChange }: FinishedGoodManagementProps) => {
  const getActiveTabValue = () => {
    if (activeTab === 'fg-inventory') return 'inventory';
    if (activeTab === 'fg-procurement') return 'procurement';
    if (activeTab === 'fg-config') return 'config';
    return 'inventory';
  };

  const handleTabChange = (value: string) => {
    if (value === 'inventory') onTabChange('fg-inventory');
    else if (value === 'procurement') onTabChange('fg-procurement');
    else if (value === 'config') onTabChange('fg-config');
  };

  return (
    <div className="space-y-4">
      <Tabs value={getActiveTabValue()} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            FG Inventory
          </TabsTrigger>
          <TabsTrigger value="procurement" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            FG Procurement
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            FG Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          <FinishedGoodsInventory />
        </TabsContent>

        <TabsContent value="procurement" className="space-y-6">
          <FGProcurementTab />
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <FinishedGoodsConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinishedGoodManagement;
