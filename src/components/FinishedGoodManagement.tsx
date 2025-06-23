
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/ui/PageHeader';
import { FinishedGoodsTab } from './inventory/FinishedGoodsTab';
import { FinishedGoodsFormTab } from './inventory/FinishedGoodsFormTab';

const FinishedGoodManagement = () => {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Finished Goods Management" 
        description="Manage your finished goods inventory and product configurations"
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Finished Goods</TabsTrigger>
          <TabsTrigger value="form">Add/Edit Products</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          <FinishedGoodsTab />
        </TabsContent>
        
        <TabsContent value="form" className="space-y-4">
          <FinishedGoodsFormTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinishedGoodManagement;
