
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { useOrders } from '@/hooks/useOrders';
import { format, subDays, subWeeks, subMonths, startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { TrendingUp } from 'lucide-react';

type TimeInterval = 'daily' | 'weekly' | 'monthly';

interface OrderTrendsData {
  period: string;
  [category: string]: string | number;
}

const OrderTrendsByCategory = () => {
  const { orders, loading } = useOrders();
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('weekly');

  const chartData = useMemo(() => {
    if (!orders.length) return [];

    const now = new Date();
    let periods: Date[] = [];
    let formatString = '';
    let groupByFunction: (date: Date) => string;

    // Define time periods and formatting based on selected interval
    switch (timeInterval) {
      case 'daily':
        periods = Array.from({ length: 7 }, (_, i) => subDays(now, 6 - i));
        formatString = 'MMM dd';
        groupByFunction = (date: Date) => format(startOfDay(date), 'yyyy-MM-dd');
        break;
      case 'weekly':
        periods = Array.from({ length: 8 }, (_, i) => subWeeks(now, 7 - i));
        formatString = 'MMM dd';
        groupByFunction = (date: Date) => format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        break;
      case 'monthly':
        periods = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i));
        formatString = 'MMM yyyy';
        groupByFunction = (date: Date) => format(startOfMonth(date), 'yyyy-MM');
        break;
    }

    // Get all unique categories from orders
    const categories = new Set<string>();
    orders.forEach(order => {
      order.order_items.forEach(item => {
        if (item.product_configs?.category) {
          categories.add(item.product_configs.category);
        }
      });
    });

    // Initialize data structure
    const dataMap = new Map<string, { [category: string]: number }>();
    
    periods.forEach(period => {
      const periodKey = groupByFunction(period);
      const periodData: { [category: string]: number } = {};
      
      categories.forEach(category => {
        periodData[category] = 0;
      });
      
      dataMap.set(periodKey, periodData);
    });

    // Aggregate order data by period and category
    orders.forEach(order => {
      const orderDate = new Date(order.created_date || order.created_at);
      const periodKey = groupByFunction(orderDate);
      
      if (dataMap.has(periodKey)) {
        order.order_items.forEach(item => {
          const category = item.product_configs?.category;
          if (category && categories.has(category)) {
            dataMap.get(periodKey)![category] += 1;
          }
        });
      }
    });

    // Convert to chart format
    return periods.map(period => {
      const periodKey = groupByFunction(period);
      const periodData = dataMap.get(periodKey) || {};
      
      return {
        period: format(period, formatString),
        ...periodData
      };
    });
  }, [orders, timeInterval]);

  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    orders.forEach(order => {
      order.order_items.forEach(item => {
        if (item.product_configs?.category) {
          categorySet.add(item.product_configs.category);
        }
      });
    });
    return Array.from(categorySet).sort();
  }, [orders]);

  // Generate colors for different categories
  const categoryColors = useMemo(() => {
    const colors = [
      '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', 
      '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'
    ];
    
    const colorMap: { [category: string]: string } = {};
    categories.forEach((category, index) => {
      colorMap[category] = colors[index % colors.length];
    });
    
    return colorMap;
  }, [categories]);

  const chartConfig = useMemo(() => {
    const config: { [key: string]: { label: string; color: string } } = {};
    categories.forEach(category => {
      config[category] = {
        label: category,
        color: categoryColors[category]
      };
    });
    return config;
  }, [categories, categoryColors]);

  const getTimeIntervalLabel = () => {
    switch (timeInterval) {
      case 'daily': return 'Last 7 Days';
      case 'weekly': return 'Last 8 Weeks';
      case 'monthly': return 'Last 6 Months';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Order Trends by Product Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!orders.length || !categories.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Order Trends by Product Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No order data available yet</p>
              <p className="text-sm">Orders will appear here once created</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Order Trends by Product Category
          </CardTitle>
          <Select value={timeInterval} onValueChange={(value: TimeInterval) => setTimeInterval(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          Order count trends across different product categories ({getTimeIntervalLabel()})
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="period" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                labelFormatter={(value) => `Period: ${value}`}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="line"
              />
              {categories.map((category) => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stroke={categoryColors[category]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default OrderTrendsByCategory;
