
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Settings } from 'lucide-react';
import FinishedGoodsConfig from '@/components/config/FinishedGoodsConfig';
import RawMaterialsConfig from '@/components/config/RawMaterialsConfig';

const ProductConfigTab = () => {
  const [activeTab, setActiveTab] = useState("finished-goods");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Product Configuration</h3>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="finished-goods" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Finished Goods Config
          </TabsTrigger>
          <TabsTrigger value="raw-materials" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Raw Materials Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="finished-goods" className="space-y-6">
          <FinishedGoodsConfig />
        </TabsContent>

        <TabsContent value="raw-materials" className="space-y-6">
          <RawMaterialsConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductConfigTab;
