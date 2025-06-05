
import { useProcurementRequests } from '@/hooks/useProcurementRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Package } from 'lucide-react';

const ProcurementStatusOverview = () => {
  const { requests, loading } = useProcurementRequests();

  if (loading) {
    return (
      <Card className="h-64">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-pulse text-gray-500">Loading procurement...</div>
        </CardContent>
      </Card>
    );
  }

  const statusCounts = {
    Pending: requests.filter(r => r.status === 'Pending').length,
    Approved: requests.filter(r => r.status === 'Approved').length,
    Received: requests.filter(r => r.status === 'Received').length,
  };

  const chartData = [
    { name: 'Received', value: statusCounts.Received, color: '#10b981' },
    { name: 'Approved', value: statusCounts.Approved, color: '#3b82f6' },
    { name: 'Pending', value: statusCounts.Pending, color: '#f59e0b' },
  ].filter(item => item.value > 0);

  const totalRequests = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
  const fulfilledPercentage = totalRequests > 0 ? Math.round((statusCounts.Received / totalRequests) * 100) : 0;

  const chartConfig = {
    received: { label: "Received", color: "#10b981" },
    approved: { label: "Approved", color: "#3b82f6" },
    pending: { label: "Pending", color: "#f59e0b" },
  };

  return (
    <Card className="h-64 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5 text-purple-500" />
          Procurement Status
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {totalRequests === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            No procurement requests
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{fulfilledPercentage}%</div>
              <div className="text-sm text-gray-600">Requests Fulfilled</div>
            </div>
            
            <ChartContainer config={chartConfig} className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={40}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="grid grid-cols-3 gap-2 text-xs">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="text-center">
                  <div className="font-bold">{count}</div>
                  <div className="text-gray-600">{status}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcurementStatusOverview;
