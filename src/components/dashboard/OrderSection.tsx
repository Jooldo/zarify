
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import OrdersReceivedTrendChart from './OrdersReceivedTrendChart';
import ExpectedDeliveryTrendChart from './ExpectedDeliveryTrendChart';
import { format, subDays, isAfter, isBefore, addDays } from 'date-fns';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

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
      deliveriesNextWeek: 0
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

    return {
      totalOrders: orders.length,
      avgTAT,
      delayedOrders,
      deliveriesToday,
      deliveriesThisWeek,
      deliveriesNextWeek
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
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Received & Quantity Trend Chart */}
      <OrdersReceivedTrendChart orders={orders} loading={loading} />

      {/* Expected Delivery Trend Chart */}
      <ExpectedDeliveryTrendChart orders={orders} loading={loading} />
    </div>
  );
};

export default OrderSection;
