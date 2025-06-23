
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Boxes, Workflow, Settings } from 'lucide-react';
import RawMaterialsConfig from '@/components/config/RawMaterialsConfig';
import FinishedGoodsConfig from '@/components/config/FinishedGoodsConfig';
import ManufacturingConfigPanel from '@/components/manufacturing/config/ManufacturingConfigPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const MerchantConfigurations = () => {
  const [activeTab, setActiveTab] = useState('raw-materials');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Merchant Configurations</h1>
        <p className="text-muted-foreground">
          Configure your business settings, materials, products, and manufacturing workflows.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="raw-materials" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Raw Materials
          </TabsTrigger>
          <TabsTrigger value="finished-goods" className="flex items-center gap-2">
            <Boxes className="h-4 w-4" />
            Finished Goods
          </TabsTrigger>
          <TabsTrigger value="manufacturing" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Manufacturing
          </TabsTrigger>
          <TabsTrigger value="workers" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Workers & Quality
          </TabsTrigger>
        </TabsList>

        <TabsContent value="raw-materials" className="space-y-6">
          <RawMaterialsConfig />
        </TabsContent>

        <TabsContent value="finished-goods" className="space-y-6">
          <FinishedGoodsConfig />
        </TabsContent>

        <TabsContent value="manufacturing" className="space-y-6">
          <ManufacturingConfigPanel />
        </TabsContent>

        <TabsContent value="workers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Worker Configuration</CardTitle>
              <CardDescription>
                Manage worker roles, skills, and assignments for manufacturing steps.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Worker configuration coming soon...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quality Control Settings</CardTitle>
              <CardDescription>
                Configure quality control checkpoints and approval workflows.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Quality control settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchantConfigurations;
