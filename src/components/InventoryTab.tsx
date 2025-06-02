
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Wrench } from 'lucide-react';
import RawMaterialInventory from '@/components/RawMaterialInventory';
import FinishedGoodsInventory from '@/components/FinishedGoodsInventory';

const InventoryTab = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="raw-materials" className="w-full">
        <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2">
          <TabsTrigger value="raw-materials" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Raw Materials
          </TabsTrigger>
          <TabsTrigger value="finished-goods" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Finished Goods
          </TabsTrigger>
        </TabsList>

        <TabsContent value="raw-materials">
          <RawMaterialInventory />
        </TabsContent>

        <TabsContent value="finished-goods">
          <FinishedGoodsInventory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryTab;
