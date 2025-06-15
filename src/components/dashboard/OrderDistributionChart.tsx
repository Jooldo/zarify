
import { Pie, PieChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { useOrders } from '@/hooks/useOrders';
import { useMemo } from 'react';
import CardSkeleton from '@/components/ui/skeletons/CardSkeleton';

const chartConfig = {
  created: {
    label: 'Created',
    color: 'hsl(var(--primary))',
  },
  inProgress: {
    label: 'In Progress',
    color: 'hsl(var(--muted-foreground))',
  },
};

const OrderDistributionChart = () => {
  const { orders, loading } = useOrders();

  const chartData = useMemo(() => {
    if (!orders) return [];
    
    const allOrderItems = orders.flatMap(o => o.order_items);
    
    const createdCount = allOrderItems.filter(item => item.status === 'Created').length;
    const inProgressCount = allOrderItems.filter(item => item.status === 'Progress' || item.status === 'Partially Fulfilled').length;
    
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
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-0">
        <CardTitle>Order Distribution</CardTitle>
        <CardDescription>Created vs. In Progress</CardDescription>
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
                strokeWidth={2}
              />
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-muted-foreground">No orders in 'Created' or 'In Progress' status.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderDistributionChart;
