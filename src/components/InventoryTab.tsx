
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RawMaterialInventory from './RawMaterialInventory';
import FinishedGoodsInventory from './FinishedGoodsInventory';

const InventoryTab = () => {
  const [activeTab, setActiveTab] = useState("raw-materials");

  const handleRequestCreated = () => {
    // This function remains for potential future use
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
        <p className="text-muted-foreground">
          Monitor and manage your raw materials and finished goods inventory.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="raw-materials">Raw Materials</TabsTrigger>
          <TabsTrigger value="finished-goods">Finished Goods</TabsTrigger>
        </TabsList>

        <TabsContent value="raw-materials" className="space-y-6">
          <RawMaterialInventory onRequestCreated={handleRequestCreated} />
        </TabsContent>

        <TabsContent value="finished-goods" className="space-y-6">
          <FinishedGoodsInventory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryTab;
