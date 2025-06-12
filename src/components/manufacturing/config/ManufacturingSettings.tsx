
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Workflow, Users, CheckCircle } from 'lucide-react';
import ManufacturingConfigPanel from './ManufacturingConfigPanel';

const ManufacturingSettings = () => {
  const [activeTab, setActiveTab] = useState('workflow');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manufacturing Settings</h1>
        <p className="text-muted-foreground">
          Configure your manufacturing workflow, steps, and quality control processes.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflow" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Workflow
          </TabsTrigger>
          <TabsTrigger value="workers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Workers
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Quality Control
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
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

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Manufacturing Settings</CardTitle>
              <CardDescription>
                Configure general manufacturing preferences and defaults.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">General settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManufacturingSettings;
