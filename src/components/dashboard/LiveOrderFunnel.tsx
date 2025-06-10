
import { useOrders } from '@/hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LiveOrderFunnel = () => {
  const { orders, loading } = useOrders();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Live Order Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const allOrderItems = orders.flatMap(order => order.order_items);
  const statusCounts = {
    Created: allOrderItems.filter(item => item.status === 'Created').length,
    Progress: allOrderItems.filter(item => item.status === 'Progress').length,
    Ready: allOrderItems.filter(item => item.status === 'Ready').length,
    Delivered: allOrderItems.filter(item => item.status === 'Delivered').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Created': return 'bg-gray-100 text-gray-800';
      case 'Progress': return 'bg-blue-100 text-blue-800';
      case 'Ready': return 'bg-yellow-100 text-yellow-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Live Order Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between">
              <Badge className={`text-xs px-2 py-1 ${getStatusColor(status)}`}>
                {status}
              </Badge>
              <span className="text-sm font-medium">{count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveOrderFunnel;
