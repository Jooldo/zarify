
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useOrders } from '@/hooks/useOrders';
import { useMemo, useState } from 'react';
import { format, subDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, startOfWeek } from 'date-fns';
import CardSkeleton from '@/components/ui/skeletons/CardSkeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const chartConfig = {
  readyOrders: {
    label: 'Ready Orders',
    color: '#10b981', // emerald-500
  },
};

type Granularity = 'daily' | 'weekly' | 'monthly';

const ReadyOrdersTrendChart = () => {
  const { orders, loading } = useOrders();
  const [granularity, setGranularity] = useState<Granularity>('daily');

  const chartData = useMemo(() => {
    if (!orders) return [];

    const readyOrderItems = orders.flatMap(o => o.order_items).filter(item => item.status === 'Ready' && item.updated_at);

    const now = new Date();
    let interval;
    let dataMap = new Map<string, number>();
    
    switch (granularity) {
      case 'weekly':
        interval = { start: subDays(now, 83), end: now };
        const weekKeyFormat = 'yyyy-MM-dd';
        readyOrderItems.forEach(item => {
            const key = format(startOfWeek(new Date(item.updated_at), { weekStartsOn: 1 }), weekKeyFormat);
            dataMap.set(key, (dataMap.get(key) || 0) + 1);
        });
        const weeks = eachWeekOfInterval(interval, { weekStartsOn: 1 });
        return weeks.map(week => {
            const key = format(week, weekKeyFormat);
            return {
                date: format(week, 'd MMM'),
                readyOrders: dataMap.get(key) || 0,
            }
        });

      case 'monthly':
        interval = { start: subDays(now, 364), end: now };
        const monthKeyFormat = 'yyyy-MM';
        readyOrderItems.forEach(item => {
            const key = format(new Date(item.updated_at), monthKeyFormat);
            dataMap.set(key, (dataMap.get(key) || 0) + 1);
        });
        const months = eachMonthOfInterval(interval);
        return months.map(month => {
            const key = format(month, monthKeyFormat);
            return {
                date: format(month, 'MMM yy'),
                readyOrders: dataMap.get(key) || 0,
            }
        });

      case 'daily':
      default:
        interval = { start: subDays(now, 29), end: now };
        const dayKeyFormat = 'yyyy-MM-dd';
        readyOrderItems.forEach(item => {
            const key = format(new Date(item.updated_at), dayKeyFormat);
            dataMap.set(key, (dataMap.get(key) || 0) + 1);
        });
        const days = eachDayOfInterval(interval);
        return days.map(day => {
            const key = format(day, dayKeyFormat);
            return {
                date: format(day, 'd MMM'),
                readyOrders: dataMap.get(key) || 0,
            }
        });
    }
  }, [orders, granularity]);

  if (loading) {
    return <CardSkeleton showHeader contentHeight='h-[250px]' />;
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <CardTitle>Ready Orders Trend</CardTitle>
                <CardDescription>Orders moved to 'Ready' over time</CardDescription>
            </div>
            <Tabs value={granularity} onValueChange={(value) => setGranularity(value as Granularity)}>
                <TabsList>
                    <TabsTrigger value="daily">Daily</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 6)}
            />
            <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
             />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Line
              dataKey="readyOrders"
              type="monotone"
              stroke="var(--color-readyOrders)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ReadyOrdersTrendChart;
