
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Clock, Package, CheckCircle, Truck } from 'lucide-react';

interface OrdersStatsHeaderProps {
  orderStats: {
    total: number;
    created: number;
    inProgress: number;
    ready: number;
    delivered: number;
  };
}

const OrdersStatsHeader = ({ orderStats }: OrdersStatsHeaderProps) => {
  const stats = [
    { title: "Total Orders", value: orderStats.total, icon: ClipboardList, color: "lp-blue", description: "All orders" },
    { title: "Created", value: orderStats.created, icon: Clock, color: "gray", description: "New orders" }, // Keeping gray for neutral 'created'
    { title: "In Progress", value: orderStats.inProgress, icon: Package, color: "lp-purple", description: "Being processed" },
    { title: "Ready", value: orderStats.ready, icon: CheckCircle, color: "lp-emerald", description: "Ready to ship" }, // Using emerald for ready
    { title: "Delivered", value: orderStats.delivered, icon: Truck, color: "green", description: "Completed" } // Keeping green for delivered
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6"> {/* Adjusted grid for responsiveness */}
      {stats.map((stat) => (
        <Card key={stat.title} className={`border-l-4 border-l-${stat.color}-500 shadow-sm hover:shadow-lg transition-shadow bg-gradient-to-br from-${stat.color}-50 via-white to-${stat.color}-100/50 dark:from-${stat.color}-900/30 dark:via-background dark:to-${stat.color}-800/20`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4 border-b-0"> {/* Removed CardHeader border here */}
            <CardTitle className={`text-xs font-medium text-${stat.color}-700 dark:text-${stat.color}-400`}>{stat.title}</CardTitle>
            <div className={`p-1.5 bg-${stat.color}-100 dark:bg-${stat.color}-800/50 rounded-full`}>
              <stat.icon className={`h-4 w-4 text-${stat.color}-600 dark:text-${stat.color}-300`} />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-1">
            <div className={`text-2xl font-bold text-${stat.color}-700 dark:text-${stat.color}-300`}>{stat.value}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OrdersStatsHeader;

