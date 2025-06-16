
import { Pie, PieChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { useOrders } from '@/hooks/useOrders';
import { useMemo } from 'react';
import CardSkeleton from '@/components/ui/skeletons/CardSkeleton';

const chartConfig = {
  created: {
    label: 'Created',
    color: 'hsl(217 91% 60%)', // Blue theme color
  },
  inProgress: {
    label: 'In Progress',
    color: 'hsl(142 76% 36%)', // Green theme color
  },
};

const OrderDistributionChart = () => {
  const { orders, loading } = useOrders();

  const chartData = useMemo(() => {
    if (!orders) return [];
    
    const allOrderItems = orders.flatMap(o => o.order_items);
    
    const createdCount = allOrderItems.filter(item => item.status === 'Created').length;
    const inProgressCount = allOrderItems.filter(item => item.status === 'In Progress' || item.status === 'Partially Fulfilled').length;
    
    return [
      { name: 'created', value: createdCount, fill: 'var(--color-created)' },
      { name: 'inProgress', value: inProgressCount, fill: 'var(--color-inProgress)' },
    ].filter(item => item.value > 0);
  }, [orders]);
  
  const totalOrders = useMemo(() => chartData.reduce((acc, curr) => acc + curr.value, 0), [chartData]);

  if (loading) {
    return <CardSkeleton showHeader contentHeight='h-[250px]' />;
  }

  return (
    <Card className="flex flex-col h-full bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border-l-4 border-l-blue-500">
      <CardHeader className="pb-0">
        <CardTitle className="text-gray-800 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          Order Distribution
        </CardTitle>
        <CardDescription className="text-gray-600">Created vs. In Progress orders</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {totalOrders > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideIndicator />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={3}
                stroke="white"
              />
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </div>
            <p className="text-sm text-gray-500">No orders in 'Created' or 'In Progress' status.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderDistributionChart;
