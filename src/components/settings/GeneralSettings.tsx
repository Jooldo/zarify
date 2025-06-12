
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNavigation } from '@/contexts/NavigationContext';

const GeneralSettings = () => {
  const { showPageHeaders, showTabNavigation, togglePageHeaders, toggleTabNavigation } = useNavigation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">General Settings</h1>
        <p className="text-muted-foreground">
          Configure general application preferences and navigation settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Navigation Settings</CardTitle>
          <CardDescription>
            Control the visibility of navigation elements across Raw Material and Finished Goods management sections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSettings;
