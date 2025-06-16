
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { format } from 'date-fns';

interface TodaysInsightsSectionProps {
  orders: any[];
  loading: boolean;
  todayString: string;
}

const TodaysInsightsSection = ({ orders, loading, todayString }: TodaysInsightsSectionProps) => {
  const todaysMetrics = useMemo(() => {
    if (!orders.length) return { created: 0, ready: 0, delayed: 0, delivered: 0 };

    const today = new Date();
    const todayOrders = orders.filter(order => {
      const orderDate = format(new Date(order.created_at), 'yyyy-MM-dd');
      return orderDate === todayString;
    });

    const allOrderItems = orders.flatMap(o => o.order_items);
    
    // Ready today (items that became ready today)
    const readyToday = allOrderItems.filter(item => 
      item.status === 'Ready' && 
      item.updated_at && 
      format(new Date(item.updated_at), 'yyyy-MM-dd') === todayString
    ).length;

    // Delivered today
    const deliveredToday = allOrderItems.filter(item => 
      item.status === 'Delivered' && 
      item.updated_at && 
      format(new Date(item.updated_at), 'yyyy-MM-dd') === todayString
    ).length;

    // Delayed orders (expected delivery was before today but not delivered)
    const delayedOrders = orders.filter(order => 
      order.expected_delivery && 
      new Date(order.expected_delivery) < today &&
      !order.order_items.every(item => item.status === 'Delivered')
    ).length;

    return {
      created: todayOrders.length,
      ready: readyToday,
      delayed: delayedOrders,
      delivered: deliveredToday
    };
  }, [orders, todayString]);

  const insights = [
    {
      title: 'Orders Created',
      value: todaysMetrics.created,
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Orders Ready',
      value: todaysMetrics.ready,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      title: 'Orders Delayed',
      value: todaysMetrics.delayed,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'Orders Delivered',
      value: todaysMetrics.delivered,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  if (loading) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Today's Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Today's Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div 
                key={index}
                className={`${insight.bgColor} ${insight.borderColor} border-2 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:scale-105`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{insight.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{insight.value}</p>
                  </div>
                  <div className={`${insight.color} p-3 rounded-lg shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodaysInsightsSection;
