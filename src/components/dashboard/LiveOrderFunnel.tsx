
import { useOrders } from '@/hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LiveOrderFunnel = () => {
  const { orders, loading } = useOrders();

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Live Order Funnel</CardTitle>
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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Created': return { color: 'bg-gray-100 text-gray-800', bgColor: 'bg-gray-50', borderColor: 'border-l-gray-400' };
      case 'Progress': return { color: 'bg-orange-100 text-orange-800', bgColor: 'bg-orange-50', borderColor: 'border-l-orange-400' };
      case 'Ready': return { color: 'bg-yellow-100 text-yellow-800', bgColor: 'bg-yellow-50', borderColor: 'border-l-yellow-400' };
      case 'Delivered': return { color: 'bg-green-100 text-green-800', bgColor: 'bg-green-50', borderColor: 'border-l-green-400' };
      default: return { color: 'bg-gray-100 text-gray-800', bgColor: 'bg-gray-50', borderColor: 'border-l-gray-400' };
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-900">Live Order Funnel</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {Object.entries(statusCounts).map(([status, count]) => {
            const statusInfo = getStatusInfo(status);
            return (
              <div key={status} className={`flex items-center justify-between p-2 rounded-lg border-l-2 ${statusInfo.borderColor} ${statusInfo.bgColor} hover:shadow-sm transition-shadow`}>
                <Badge className={`text-xs px-2 py-1 ${statusInfo.color}`}>
                  {status}
                </Badge>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveOrderFunnel;
