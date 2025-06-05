
import { useOrders } from '@/hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingDown, ArrowRight } from 'lucide-react';

interface OrderFunnelChartProps {
  onNavigateToOrders?: () => void;
}

const OrderFunnelChart = ({ onNavigateToOrders }: OrderFunnelChartProps) => {
  const { orders, loading } = useOrders();

  if (loading) {
    return (
      <Card className="h-80">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading order data...</div>
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

  const totalOrders = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

  // Calculate conversion rates
  const stages = [
    { name: 'Created', count: statusCounts.Created, color: 'bg-gray-300' },
    { name: 'In Progress', count: statusCounts['In Progress'], color: 'bg-blue-400' },
    { name: 'Ready', count: statusCounts.Ready, color: 'bg-green-400' },
    { name: 'Delivered', count: statusCounts.Delivered, color: 'bg-gray-700' },
  ];

  const maxCount = Math.max(...Object.values(statusCounts));

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-gray-900">Order Flow Analysis</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Current order distribution across processing stages</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onNavigateToOrders}
            className="text-gray-600 hover:text-gray-900"
          >
            View Orders
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Total Orders Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-2xl font-semibold text-gray-900">{totalOrders}</div>
            <div className="text-sm text-gray-600">Total Active Orders</div>
          </div>

          {/* Funnel Visualization */}
          <div className="space-y-3">
            {stages.map((stage, index) => {
              const percentage = totalOrders > 0 ? Math.round((stage.count / totalOrders) * 100) : 0;
              const width = maxCount > 0 ? Math.max(20, (stage.count / maxCount) * 100) : 20;
              
              return (
                <div key={stage.name} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium text-gray-700 text-right">
                    {stage.name}
                  </div>
                  <div className="flex-1 relative">
                    <div className="bg-gray-100 rounded h-8 relative overflow-hidden">
                      <div 
                        className={`${stage.color} h-full rounded transition-all duration-300 flex items-center justify-between px-3`}
                        style={{ width: `${width}%` }}
                      >
                        <span className="text-white text-sm font-medium">{stage.count}</span>
                        <span className="text-white text-xs">{percentage}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Conversion Insights */}
          {totalOrders > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingDown className="h-4 w-4" />
                <span>
                  {Math.round((statusCounts.Delivered / totalOrders) * 100)}% completion rate
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderFunnelChart;
