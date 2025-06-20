
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format, subDays, subWeeks, subMonths, startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { TrendingUp, Calendar } from 'lucide-react';

interface OrdersReceivedTrendChartProps {
  orders: any[];
  loading: boolean;
}

type TimeInterval = 'daily' | 'weekly' | 'monthly';
type DateRange = 'today' | 'thisWeek' | 'thisMonth' | 'custom';

const OrdersReceivedTrendChart = ({ orders, loading }: OrdersReceivedTrendChartProps) => {
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('daily');
  const [dateRange, setDateRange] = useState<DateRange>('thisWeek');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { chartData, categories } = useMemo(() => {
    if (!orders.length) return { chartData: [], categories: [] };

    const now = new Date();
    let periods: Date[] = [];
    let formatString = '';
    let groupByFunction: (date: Date) => string;

    // Define time periods based on date range and interval
    switch (dateRange) {
      case 'today':
        periods = [now];
        formatString = 'HH:mm';
        groupByFunction = (date: Date) => format(date, 'yyyy-MM-dd HH');
        break;
      case 'thisWeek':
        switch (timeInterval) {
          case 'daily':
            periods = Array.from({ length: 7 }, (_, i) => subDays(now, 6 - i));
            formatString = 'MMM dd';
            groupByFunction = (date: Date) => format(startOfDay(date), 'yyyy-MM-dd');
            break;
          case 'weekly':
            periods = Array.from({ length: 4 }, (_, i) => subWeeks(now, 3 - i));
            formatString = 'MMM dd';
            groupByFunction = (date: Date) => format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
            break;
          default:
            periods = Array.from({ length: 7 }, (_, i) => subDays(now, 6 - i));
            formatString = 'MMM dd';
            groupByFunction = (date: Date) => format(startOfDay(date), 'yyyy-MM-dd');
        }
        break;
      case 'thisMonth':
        switch (timeInterval) {
          case 'daily':
            periods = Array.from({ length: 30 }, (_, i) => subDays(now, 29 - i));
            formatString = 'MMM dd';
            groupByFunction = (date: Date) => format(startOfDay(date), 'yyyy-MM-dd');
            break;
          case 'weekly':
            periods = Array.from({ length: 4 }, (_, i) => subWeeks(now, 3 - i));
            formatString = 'MMM dd';
            groupByFunction = (date: Date) => format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
            break;
          case 'monthly':
            periods = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i));
            formatString = 'MMM yyyy';
            groupByFunction = (date: Date) => format(startOfMonth(date), 'yyyy-MM');
            break;
        }
        break;
      default:
        periods = Array.from({ length: 7 }, (_, i) => subDays(now, 6 - i));
        formatString = 'MMM dd';
        groupByFunction = (date: Date) => format(startOfDay(date), 'yyyy-MM-dd');
    }

    // Get all unique categories
    const categorySet = new Set<string>();
    orders.forEach(order => {
      order.order_items.forEach((item: any) => {
        if (item.product_configs?.category) {
          categorySet.add(item.product_configs.category);
        }
      });
    });
    const allCategories = Array.from(categorySet).sort();

    // Filter orders by category if selected
    const filteredOrders = selectedCategory === 'all' 
      ? orders 
      : orders.filter(order => 
          order.order_items.some((item: any) => 
            item.product_configs?.category === selectedCategory
          )
        );

    // Initialize data structure
    const dataMap = new Map<string, { orderCount: number; totalQuantity: number }>();
    
    periods.forEach(period => {
      const periodKey = groupByFunction(period);
      dataMap.set(periodKey, { orderCount: 0, totalQuantity: 0 });
    });

    // Aggregate order data by period
    filteredOrders.forEach(order => {
      const orderDate = new Date(order.created_date || order.created_at);
      const periodKey = groupByFunction(orderDate);
      
      if (dataMap.has(periodKey)) {
        const current = dataMap.get(periodKey)!;
        current.orderCount += 1;
        
        // Calculate total quantity for this order
        const orderQuantity = order.order_items.reduce((sum: number, item: any) => {
          // Only count items that match the selected category filter
          if (selectedCategory === 'all' || item.product_configs?.category === selectedCategory) {
            return sum + (item.quantity || 0);
          }
          return sum;
        }, 0);
        
        current.totalQuantity += orderQuantity;
      }
    });

    // Convert to chart format
    const data = periods.map(period => {
      const periodKey = groupByFunction(period);
      const periodData = dataMap.get(periodKey) || { orderCount: 0, totalQuantity: 0 };
      
      return {
        period: format(period, formatString),
        orderCount: periodData.orderCount,
        totalQuantity: periodData.totalQuantity
      };
    });

    return { chartData: data, categories: allCategories };
  }, [orders, timeInterval, dateRange, selectedCategory]);

  const chartConfig = {
    orderCount: {
      label: 'Number of Orders',
      color: '#3b82f6'
    },
    totalQuantity: {
      label: 'Total Quantity',
      color: '#10b981'
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Orders Received & Quantity Trend
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

  if (!orders.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Orders Received & Quantity Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
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
        <div className="flex flex-col space-y-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Orders Received & Quantity Trend
          </CardTitle>
          
          <div className="flex flex-wrap gap-4">
            <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="thisWeek">This Week</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeInterval} onValueChange={(value: TimeInterval) => setTimeInterval(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>

            {categories.length > 0 && (
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
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
                yAxisId="left"
                className="text-xs"
                tick={{ fontSize: 12 }}
                label={{ value: 'Orders', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                className="text-xs"
                tick={{ fontSize: 12 }}
                label={{ value: 'Quantity', angle: 90, position: 'insideRight' }}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                labelFormatter={(value) => `Period: ${value}`}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="orderCount"
                stroke={chartConfig.orderCount.color}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Orders"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="totalQuantity"
                stroke={chartConfig.totalQuantity.color}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Quantity"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default OrdersReceivedTrendChart;
