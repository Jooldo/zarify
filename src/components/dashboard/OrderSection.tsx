
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import OrderDistributionChart from './OrderDistributionChart';
import OrderTrendsByCategory from './OrderTrendsByCategory';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { format, subDays, isAfter, isBefore, addDays } from 'date-fns';
import { Calendar, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface OrderSectionProps {
  orders: any[];
  loading: boolean;
}

const OrderSection = ({ orders, loading }: OrderSectionProps) => {
  const orderMetrics = useMemo(() => {
    if (!orders.length) return {
      totalOrders: 0,
      avgTAT: 0,
      delayedOrders: 0,
      deliveriesToday: 0,
      deliveriesThisWeek: 0,
      deliveriesNextWeek: 0,
      deliveredOverTime: []
    };

    const today = new Date();
    const weekFromNow = addDays(today, 7);
    const twoWeeksFromNow = addDays(today, 14);

    // Calculate TAT for delivered orders
    const deliveredOrders = orders.filter(order => 
      order.order_items.every(item => item.status === 'Delivered')
    );

    let totalTAT = 0;
    deliveredOrders.forEach(order => {
      const createdDate = new Date(order.created_at);
      const deliveredDate = new Date(Math.max(...order.order_items.map((item: any) => new Date(item.updated_at || item.created_at).getTime())));
      const tat = Math.floor((deliveredDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      totalTAT += tat;
    });

    const avgTAT = deliveredOrders.length > 0 ? Math.round(totalTAT / deliveredOrders.length) : 0;

    // Delayed orders
    const delayedOrders = orders.filter(order => 
      order.expected_delivery && 
      new Date(order.expected_delivery) < today &&
      !order.order_items.every(item => item.status === 'Delivered')
    ).length;

    // Deliveries due today, this week, next week
    const deliveriesToday = orders.filter(order =>
      order.expected_delivery &&
      format(new Date(order.expected_delivery), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
    ).length;

    const deliveriesThisWeek = orders.filter(order =>
      order.expected_delivery &&
      isAfter(new Date(order.expected_delivery), today) &&
      isBefore(new Date(order.expected_delivery), weekFromNow)
    ).length;

    const deliveriesNextWeek = orders.filter(order =>
      order.expected_delivery &&
      isAfter(new Date(order.expected_delivery), weekFromNow) &&
      isBefore(new Date(order.expected_delivery), twoWeeksFromNow)
    ).length;

    // Delivered orders over time (last 30 days)
    const deliveredOverTime = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      const dateString = format(date, 'yyyy-MM-dd');
      
      const deliveredCount = orders.filter(order => {
        const allDelivered = order.order_items.every(item => item.status === 'Delivered');
        if (!allDelivered) return false;
        
        const latestUpdate = Math.max(...order.order_items.map((item: any) => new Date(item.updated_at || item.created_at).getTime()));
        return format(new Date(latestUpdate), 'yyyy-MM-dd') === dateString;
      }).length;

      deliveredOverTime.push({
        date: format(date, 'MMM dd'),
        delivered: deliveredCount
      });
    }

    return {
      totalOrders: orders.length,
      avgTAT,
      delayedOrders,
      deliveriesToday,
      deliveriesThisWeek,
      deliveriesNextWeek,
      deliveredOverTime
    };
  }, [orders]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Avg TAT</p>
                <p className="text-2xl font-bold text-blue-900">{orderMetrics.avgTAT} days</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-orange-50 border-red-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Delayed Orders</p>
                <p className="text-2xl font-bold text-red-900">{orderMetrics.delayedOrders}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Due Today</p>
                <p className="text-2xl font-bold text-emerald-900">{orderMetrics.deliveriesToday}</p>
              </div>
              <Calendar className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">This Week</p>
                <p className="text-2xl font-bold text-purple-900">{orderMetrics.deliveriesThisWeek}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <OrderDistributionChart />
        </div>
        
        <div className="xl:col-span-2">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Delivered Orders Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={orderMetrics.deliveredOverTime}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="delivered" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: 'white' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Order Trends by Category */}
      <OrderTrendsByCategory />
    </div>
  );
};

export default OrderSection;
