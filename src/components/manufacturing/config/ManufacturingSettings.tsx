
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Workflow, Users, CheckCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNavigation } from '@/contexts/NavigationContext';
import ManufacturingConfigPanel from './ManufacturingConfigPanel';

const ManufacturingSettings = () => {
  const [activeTab, setActiveTab] = useState('workflow');
  const { showPageHeaders, showTabNavigation, togglePageHeaders, toggleTabNavigation } = useNavigation();

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
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Navigation Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Control the visibility of navigation elements across Raw Material and Finished Goods management sections.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="show-headers">Show Page Headers</Label>
                        <p className="text-sm text-muted-foreground">
                          Display section titles and descriptions at the top of management pages
                        </p>
                      </div>
                      <Switch
                        id="show-headers"
                        checked={showPageHeaders}
                        onCheckedChange={togglePageHeaders}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="show-tab-nav">Show Tab Navigation</Label>
                        <p className="text-sm text-muted-foreground">
                          Display tab navigation bars within management sections
                        </p>
                      </div>
                      <Switch
                        id="show-tab-nav"
                        checked={showTabNavigation}
                        onCheckedChange={toggleTabNavigation}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManufacturingSettings;
