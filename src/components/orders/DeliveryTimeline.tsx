
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Order as FullOrder } from '@/hooks/useOrders';
import { AlertTriangle, CalendarClock, CalendarCheck } from 'lucide-react';
import { isBefore, isToday, startOfWeek, endOfWeek, addWeeks, isWithinInterval } from 'date-fns';
import { OrderFilters } from '@/components/OrdersTab';

interface DeliveryTimelineProps {
  orders: FullOrder[];
  getOverallOrderStatus: (orderId: string) => string;
  onFilterChange: React.Dispatch<React.SetStateAction<OrderFilters>>;
}

const DeliveryTimeline = ({ orders, getOverallOrderStatus, onFilterChange }: DeliveryTimelineProps) => {
  const timelineMetrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let delayed = 0;
    let deliveringToday = 0;
    let deliveringThisWeek = 0;
    let deliveringNextWeek = 0;

    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
    const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });

    const nextWeekDate = addWeeks(today, 1);
    const startOfNextWeek = startOfWeek(nextWeekDate, { weekStartsOn: 1 });
    const endOfNextWeek = endOfWeek(nextWeekDate, { weekStartsOn: 1 });

    orders.forEach(order => {
      if (order.expected_delivery) {
        const deliveryDate = new Date(order.expected_delivery);
        deliveryDate.setHours(0, 0, 0, 0);
        const status = getOverallOrderStatus(order.order_number);

        if (isBefore(deliveryDate, today) && status !== 'Delivered') {
          delayed++;
        }

        if (isToday(deliveryDate)) {
          deliveringToday++;
        }
        if (isWithinInterval(deliveryDate, { start: startOfThisWeek, end: endOfThisWeek })) {
          deliveringThisWeek++;
        }
        if (isWithinInterval(deliveryDate, { start: startOfNextWeek, end: endOfNextWeek })) {
          deliveringNextWeek++;
        }
      }
    });

    return { delayed, deliveringToday, deliveringThisWeek, deliveringNextWeek };
  }, [orders, getOverallOrderStatus]);

  const metrics = [
    {
      title: 'Delayed Orders',
      value: timelineMetrics.delayed,
      icon: AlertTriangle,
      color: 'text-red-500',
      filter: { overdueDelivery: true },
    },
    {
      title: 'Delivering Today',
      value: timelineMetrics.deliveringToday,
      icon: CalendarClock,
      color: 'text-green-600',
      filter: { expectedDeliveryRange: 'Today' },
    },
    {
      title: 'Delivering This Week',
      value: timelineMetrics.deliveringThisWeek,
      icon: CalendarCheck,
      color: 'text-green-600',
      filter: { expectedDeliveryRange: 'This Week' },
    },
    {
      title: 'Delivering Next Week',
      value: timelineMetrics.deliveringNextWeek,
      icon: CalendarCheck,
      color: 'text-green-600',
      filter: { expectedDeliveryRange: 'Next Week' },
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {metrics.map((metric) => (
        <Card
          key={metric.title}
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onFilterChange(prev => ({
              ...prev,
              overdueDelivery: false,
              expectedDeliveryRange: '',
              hasDeliveryDate: false,
              expectedDeliveryFrom: null,
              expectedDeliveryTo: null,
              ...metric.filter
          }))}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DeliveryTimeline;
