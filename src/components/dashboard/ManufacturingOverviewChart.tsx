
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1940', '#4CAF50', '#FFC107', '#9C27B0', '#E91E63'];

interface ManufacturingStep {
  status: string;
  manufacturing_steps: {
    step_name: string;
  }
}
interface ManufacturingOrder {
  status: string;
  manufacturing_order_steps: ManufacturingStep[];
}

const ManufacturingOverviewChart = () => {
  const { manufacturingOrders, loading } = useManufacturingOrders();

  const chartData = useMemo(() => {
    if (loading || !manufacturingOrders || manufacturingOrders.length === 0) {
      return [];
    }

    const stepCounts: { [key: string]: number } = {};

    const inProgressOrders = manufacturingOrders.filter((o: ManufacturingOrder) => o.status === 'in-progress' || o.status === 'pending');

    inProgressOrders.forEach((order: ManufacturingOrder) => {
        if (order.manufacturing_order_steps && order.manufacturing_order_steps.length > 0) {
            const currentStep = order.manufacturing_order_steps.find((s: ManufacturingStep) => s.status !== 'completed');
            
            if (currentStep && currentStep.manufacturing_steps) {
                const stepName = currentStep.manufacturing_steps.step_name;
                stepCounts[stepName] = (stepCounts[stepName] || 0) + 1;
            }
        }
    });

    return Object.entries(stepCounts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [manufacturingOrders, loading]);
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <Skeleton className="h-48 w-48 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manufacturing in Progress by Step</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <p className="text-muted-foreground">No manufacturing orders in progress.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manufacturing in Progress by Step</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
              }}
            />
            <Legend wrapperStyle={{fontSize: "12px"}}/>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ManufacturingOverviewChart;
