
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Factory, Kanban, Calendar, BarChart3 } from 'lucide-react';
import ProductionKanban from './ProductionKanban';

const FGManufacturingTab = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Factory className="h-5 w-5" />
          Manufacturing Management
        </h3>
        <p className="text-muted-foreground mb-6">
          Manage and monitor the manufacturing process of finished goods based on orders and inventory levels.
        </p>
        
        <Tabs defaultValue="kanban" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <Kanban className="h-4 w-4" />
              Production Queue
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Factory className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="kanban" className="mt-6">
            <ProductionKanban />
          </TabsContent>
          
          <TabsContent value="schedule" className="mt-6">
            <div className="bg-blue-50 p-8 rounded-lg text-center">
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Production Schedule</h4>
              <p className="text-muted-foreground">
                Production scheduling and timeline management coming soon.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <div className="bg-green-50 p-8 rounded-lg text-center">
              <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Manufacturing Analytics</h4>
              <p className="text-muted-foreground">
                Production metrics and performance analytics coming soon.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <div className="bg-purple-50 p-8 rounded-lg text-center">
              <Factory className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Manufacturing Settings</h4>
              <p className="text-muted-foreground">
                Configure process steps, worker assignments, and production parameters.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FGManufacturingTab;
