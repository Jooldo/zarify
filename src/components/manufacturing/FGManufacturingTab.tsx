
import { useState } from 'react';
import { Factory, Calendar, Users, Wrench, Package, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductionQueue from './ProductionQueue';

const FGManufacturingTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('queue');

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
        
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-muted h-12">
            <TabsTrigger value="queue" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Production Queue
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="workforce" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Workforce
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Equipment
            </TabsTrigger>
            <TabsTrigger value="quality" className="flex items-center gap-2">
              <Factory className="h-4 w-4" />
              Quality Control
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Resources
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="queue" className="mt-6">
            <ProductionQueue />
          </TabsContent>
          
          <TabsContent value="schedule" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold">Production Schedule</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  View and manage daily production schedules and timelines.
                </p>
                <div className="text-sm font-medium text-blue-600">
                  View Schedule →
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="workforce" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold">Workforce Planning</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Assign workers to production tasks and manage shifts.
                </p>
                <div className="text-sm font-medium text-purple-600">
                  Plan Workforce →
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="equipment" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <Wrench className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold">Equipment Status</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Monitor manufacturing equipment and maintenance schedules.
                </p>
                <div className="text-sm font-medium text-orange-600">
                  Check Status →
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="quality" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <Factory className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold">Quality Control</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Track quality metrics and manage inspection processes.
                </p>
                <div className="text-sm font-medium text-red-600">
                  View QC →
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="resources" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  <h4 className="font-semibold">Resource Planning</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Ensure adequate raw materials and resources for production.
                </p>
                <div className="text-sm font-medium text-indigo-600">
                  Plan Resources →
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            🏭 Advanced manufacturing features and real-time monitoring dashboard available.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FGManufacturingTab;
