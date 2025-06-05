
import { useOrders } from '@/hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

const LiveOrderFunnel = () => {
  const { orders, loading } = useOrders();

  if (loading) {
    return (
      <Card className="h-32">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-pulse text-gray-500">Loading orders...</div>
        </CardContent>
      </Card>
    );
  }

  // Flatten all order items to get individual statuses
  const allOrderItems = orders.flatMap(order => order.order_items);
  
  const statusCounts = {
    Created: allOrderItems.filter(item => item.status === 'Created').length,
    'In Progress': allOrderItems.filter(item => item.status === 'In Progress').length,
    Ready: allOrderItems.filter(item => item.status === 'Ready').length,
    Delivered: allOrderItems.filter(item => item.status === 'Delivered').length,
  };

  // Calculate stuck orders (In Progress for more than 7 days)
  const stuckOrders = allOrderItems.filter(item => {
    if (item.status !== 'In Progress') return false;
    const order = orders.find(o => o.order_items.some(oi => oi.id === item.id));
    if (!order) return false;
    const daysDiff = Math.floor((Date.now() - new Date(order.created_date).getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 7;
  }).length;

  const statusColors = {
    Created: 'bg-gray-500',
    'In Progress': 'bg-blue-500',
    Ready: 'bg-green-500',
    Delivered: 'bg-green-700',
  };

  const statusIcons = {
    Created: '📥',
    'In Progress': '🔧',
    Ready: '✅',
    Delivered: '📦',
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingCart className="h-5 w-5 text-blue-500" />
          Live Order Funnel
          {stuckOrders > 0 && (
            <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full animate-pulse border border-red-300">
              {stuckOrders} stuck
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="flex items-center gap-3">
            <span className="text-lg">{statusIcons[status as keyof typeof statusIcons]}</span>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{status}</span>
                <span className="text-lg font-bold">{count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${statusColors[status as keyof typeof statusColors]} transition-all duration-300`}
                  style={{ 
                    width: `${Math.max(10, (count / Math.max(...Object.values(statusCounts))) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default LiveOrderFunnel;
