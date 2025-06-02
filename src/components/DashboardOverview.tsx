
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, ClipboardList, AlertTriangle, TrendingUp } from 'lucide-react';

const DashboardOverview = () => {
  const stats = [
    {
      title: "Active Orders",
      value: "12",
      change: "+3 from last week",
      icon: ClipboardList,
      color: "bg-blue-500"
    },
    {
      title: "Low Stock Items",
      value: "4",
      change: "2 critical",
      icon: AlertTriangle,
      color: "bg-red-500"
    },
    {
      title: "Finished Goods",
      value: "156",
      change: "pieces in stock",
      icon: Package,
      color: "bg-green-500"
    },
    {
      title: "This Month",
      value: "₹45,200",
      change: "+12% from last month",
      icon: TrendingUp,
      color: "bg-purple-500"
    }
  ];

  const recentOrders = [
    {
      id: "ORD-001",
      customer: "Priya Sharma",
      status: "In Manufacturing",
      amount: "₹2,400",
      items: 3
    },
    {
      id: "ORD-002", 
      customer: "Anjali Patel",
      status: "Ready for Dispatch",
      amount: "₹1,800",
      items: 2
    },
    {
      id: "ORD-003",
      customer: "Meera Singh",
      status: "Pending",
      amount: "₹3,200",
      items: 4
    }
  ];

  const lowStockItems = [
    { name: "Silver Chain", current: 15, minimum: 50, unit: "meters" },
    { name: "Gold Kunda", current: 8, minimum: 20, unit: "pieces" },
    { name: "Small Ghungroo", current: 25, minimum: 100, unit: "pieces" },
    { name: "Thread", current: 5, minimum: 10, unit: "rolls" }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`${stat.color} p-2 rounded-lg`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{order.id}</span>
                      <Badge variant={
                        order.status === "Ready for Dispatch" ? "default" :
                        order.status === "In Manufacturing" ? "secondary" : "outline"
                      }>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                    <p className="text-xs text-gray-500">{order.items} items</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{order.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.current} {item.unit} remaining
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={item.current <= item.minimum / 2 ? "destructive" : "secondary"}>
                      {item.current <= item.minimum / 2 ? "Critical" : "Low"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
