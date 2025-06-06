
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Settings, ShoppingBag } from 'lucide-react';
import RawMaterialInventory from './RawMaterialInventory';
import RawMaterialsConfig from './config/RawMaterialsConfig';
import RMProcurementTab from './procurement/RMProcurementTab';

interface RawMaterialManagementProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const RawMaterialManagement = ({ activeTab, onTabChange }: RawMaterialManagementProps) => {
  const getActiveTabValue = () => {
    if (activeTab === 'rm-inventory') return 'inventory';
    if (activeTab === 'rm-config') return 'config';
    if (activeTab === 'rm-procurement') return 'procurement';
    return 'inventory';
  };

  const handleTabChange = (value: string) => {
    if (value === 'inventory') onTabChange('rm-inventory');
    else if (value === 'config') onTabChange('rm-config');
    else if (value === 'procurement') onTabChange('rm-procurement');
  };

  return (
    <div className="space-y-4">
      <Tabs value={getActiveTabValue()} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            RM Inventory
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            RM Config
          </TabsTrigger>
          <TabsTrigger value="procurement" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            RM Procurement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          <RawMaterialInventory onRequestCreated={() => {}} />
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <RawMaterialsConfig />
        </TabsContent>

        <TabsContent value="procurement" className="space-y-6">
          <RMProcurementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RawMaterialManagement;
