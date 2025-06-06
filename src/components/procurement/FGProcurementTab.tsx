
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Factory, Calendar, TrendingUp } from 'lucide-react';

const FGProcurementTab = () => {
  const [activeTab, setActiveTab] = useState("production");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="production" className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            Production Planning
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Manufacturing Schedule
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Production Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="production" className="space-y-4 mt-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Production Planning</h3>
            <p className="text-muted-foreground mb-4">
              Plan and manage the production of finished goods based on orders and inventory levels.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Production Queue</h4>
                <p className="text-sm text-muted-foreground">
                  View and manage items scheduled for production.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Resource Planning</h4>
                <p className="text-sm text-muted-foreground">
                  Ensure adequate raw materials for production.
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                🚧 Production planning features will be available soon.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="scheduling" className="space-y-4 mt-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Manufacturing Schedule</h3>
            <p className="text-muted-foreground mb-4">
              Schedule and track manufacturing activities and production timelines.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Daily Schedule</h4>
                <p className="text-sm text-muted-foreground">
                  View today's production schedule and progress.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Weekly Planning</h4>
                <p className="text-sm text-muted-foreground">
                  Plan production activities for the upcoming week.
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                📅 Manufacturing scheduling dashboard coming soon.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4 mt-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Production Analytics</h3>
            <p className="text-muted-foreground mb-4">
              Track production efficiency, costs, and performance metrics.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Production Efficiency</h4>
                <p className="text-sm text-muted-foreground">
                  Monitor production speed and quality metrics.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Cost Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Track production costs and profitability.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Capacity Planning</h4>
                <p className="text-sm text-muted-foreground">
                  Analyze production capacity and bottlenecks.
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                📊 Production analytics dashboard coming soon.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FGProcurementTab;
