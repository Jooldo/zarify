
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Wrench } from 'lucide-react';

const ManufacturingLoad = () => {
  const { finishedGoods, loading } = useFinishedGoods();

  if (loading) {
    return (
      <Card className="h-64">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-pulse text-gray-500">Loading manufacturing...</div>
        </CardContent>
      </Card>
    );
  }

  const totalInManufacturing = finishedGoods.reduce((sum, item) => sum + item.in_manufacturing, 0);
  const totalRequired = finishedGoods.reduce((sum, item) => sum + item.required_quantity, 0);
  
  // Assume capacity of 100 units (this could be configurable)
  const capacity = 100;
  const loadPercentage = Math.min(100, Math.round((totalInManufacturing / capacity) * 100));

  // Items stuck due to raw material shortfall
  const stuckItems = finishedGoods.filter(item => 
    item.required_quantity > 0 && item.current_stock < item.threshold && item.in_manufacturing === 0
  );

  const gaugeData = [
    { name: 'Used', value: loadPercentage, color: loadPercentage > 80 ? '#ef4444' : loadPercentage > 60 ? '#f59e0b' : '#10b981' },
    { name: 'Available', value: 100 - loadPercentage, color: '#e5e7eb' },
  ];

  const chartConfig = {
    used: { label: "Used Capacity" },
    available: { label: "Available Capacity" },
  };

  return (
    <Card className="h-64 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wrench className="h-5 w-5 text-orange-500" />
          Manufacturing Load
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="text-center">
            <div className={`text-3xl font-bold ${loadPercentage > 80 ? 'text-red-600' : loadPercentage > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
              {loadPercentage}%
            </div>
            <div className="text-sm text-gray-600">Capacity Used</div>
          </div>

          <ChartContainer config={chartConfig} className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="50%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={25}
                  outerRadius={35}
                  dataKey="value"
                >
                  {gaugeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="font-bold text-blue-700">{totalInManufacturing}</div>
              <div className="text-blue-600">In Progress</div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded">
              <div className="font-bold text-red-700">{stuckItems.length}</div>
              <div className="text-red-600">Stuck Items</div>
            </div>
          </div>

          {stuckItems.length > 0 && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
              ⚠️ {stuckItems.length} items stuck due to material shortfall
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ManufacturingLoad;
