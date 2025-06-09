
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FinishedGoodsInventory from './FinishedGoodsInventory';
import FinishedGoodsConfig from './config/FinishedGoodsConfig';
import FGManufacturingTab from './manufacturing/FGManufacturingTab';
import EnhancedProductionQueue from './manufacturing/EnhancedProductionQueue';
import FGAnalytics from './analytics/FGAnalytics';
import FGWorkers from './workers/FGWorkers';

interface FinishedGoodManagementProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const FinishedGoodManagement = ({ activeTab, onTabChange }: FinishedGoodManagementProps) => {
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="fg-inventory">Inventory</TabsTrigger>
          <TabsTrigger value="fg-config">Configuration</TabsTrigger>
          <TabsTrigger value="fg-manufacturing">Manufacturing</TabsTrigger>
          <TabsTrigger value="fg-analytics">Analytics</TabsTrigger>
          <TabsTrigger value="fg-workers">Workers</TabsTrigger>
        </TabsList>

        <TabsContent value="fg-inventory" className="space-y-6 mt-6">
          <FinishedGoodsInventory />
        </TabsContent>

        <TabsContent value="fg-config" className="space-y-6 mt-6">
          <FinishedGoodsConfig />
        </TabsContent>

        <TabsContent value="fg-manufacturing" className="space-y-6 mt-6">
          <FGManufacturingTab />
        </TabsContent>

        <TabsContent value="fg-analytics" className="space-y-6 mt-6">
          <FGAnalytics />
        </TabsContent>

        <TabsContent value="fg-workers" className="space-y-6 mt-6">
          <FGWorkers />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinishedGoodManagement;
