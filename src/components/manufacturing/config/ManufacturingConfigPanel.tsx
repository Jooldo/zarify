
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Workflow, Database, Settings } from 'lucide-react';
import ManufacturingWorkflowConfig from './ManufacturingWorkflowConfig';

const ManufacturingConfigPanel = () => {
  const [activeTab, setActiveTab] = useState('workflow');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manufacturing Configuration</h1>
        <p className="text-muted-foreground">
          Set up your manufacturing workflow, configure steps, and manage field visibility.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflow" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Workflow Setup
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data Management
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Advanced Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="space-y-6">
          <ManufacturingWorkflowConfig />
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manufacturing Data Management</CardTitle>
              <CardDescription>
                Manage manufacturing orders, step data, and reporting configurations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Data management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Manufacturing Settings</CardTitle>
              <CardDescription>
                Configure advanced manufacturing options, integrations, and system preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Advanced settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManufacturingConfigPanel;
