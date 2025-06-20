
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format, subDays, subWeeks, subMonths, startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { TrendingUp, Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProductCodeSelector from '@/components/orders/ProductCodeSelector';

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
  const [selectedProductCode, setSelectedProductCode] = useState<string>('');
  const [customDateFrom, setCustomDateFrom] = useState<Date>();
  const [customDateTo, setCustomDateTo] = useState<Date>();

  const { chartData, categories } = useMemo(() => {
    if (!orders.length) return { chartData: [], categories: [] };

    const now = new Date();
    let periods: Date[] = [];
    let formatString = '';
    let groupByFunction: (date: Date) => string;
    let startDate: Date;
    let endDate: Date;

    // Define time periods based on date range and interval
    if (dateRange === 'custom' && customDateFrom && customDateTo) {
      startDate = customDateFrom;
      endDate = customDateTo;
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (timeInterval === 'daily' || daysDiff <= 31) {
        periods = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          periods.push(new Date(d));
        }
        formatString = 'MMM dd';
        groupByFunction = (date: Date) => format(startOfDay(date), 'yyyy-MM-dd');
      } else if (timeInterval === 'weekly') {
        periods = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
          periods.push(new Date(d));
        }
        formatString = 'MMM dd';
        groupByFunction = (date: Date) => format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      } else {
        periods = [];
        for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
          periods.push(new Date(d));
        }
        formatString = 'MMM yyyy';
        groupByFunction = (date: Date) => format(startOfMonth(date), 'yyyy-MM');
      }
    } else {
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

    // Filter orders by category and product code if selected
    const filteredOrders = orders.filter(order => {
      // Category filter
      const categoryMatch = selectedCategory === 'all' || 
        order.order_items.some((item: any) => 
          item.product_configs?.category === selectedCategory
        );
      
      // Product code filter
      const productCodeMatch = !selectedProductCode || 
        order.order_items.some((item: any) => 
          item.product_configs?.product_code === selectedProductCode
        );
      
      return categoryMatch && productCodeMatch;
    });

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
          // Only count items that match the selected filters
          const categoryMatch = selectedCategory === 'all' || item.product_configs?.category === selectedCategory;
          const productCodeMatch = !selectedProductCode || item.product_configs?.product_code === selectedProductCode;
          
          if (categoryMatch && productCodeMatch) {
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
  }, [orders, timeInterval, dateRange, selectedCategory, selectedProductCode, customDateFrom, customDateTo]);

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

  const clearProductCode = () => {
    setSelectedProductCode('');
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Orders Received & Quantity Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!orders.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Orders Received & Quantity Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No order data available yet</p>
              <p className="text-sm">Orders will appear here once created</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
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
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {dateRange === 'custom' && (
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-40 justify-start text-left font-normal", !customDateFrom && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateFrom ? format(customDateFrom, "MMM dd, yyyy") : "From date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={customDateFrom} onSelect={setCustomDateFrom} initialFocus />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-40 justify-start text-left font-normal", !customDateTo && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateTo ? format(customDateTo, "MMM dd, yyyy") : "To date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={customDateTo} onSelect={setCustomDateTo} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            )}

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

          {/* Product Code Filter Row */}
          <div className="flex items-center gap-2">
            <div className="flex-1 max-w-sm">
              <ProductCodeSelector
                value={selectedProductCode}
                onChange={setSelectedProductCode}
              />
            </div>
            {selectedProductCode && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearProductCode}
                className="h-8 px-2"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear product code</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-96 w-full">
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
