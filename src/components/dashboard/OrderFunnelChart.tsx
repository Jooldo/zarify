
import { useOrders } from '@/hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const OrderFunnelChart = () => {
  const { orders, loading } = useOrders();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Order Status Distribution</CardTitle>
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
  
  const data = [
    { status: 'Created', count: allOrderItems.filter(item => item.status === 'Created').length },
    { status: 'Progress', count: allOrderItems.filter(item => item.status === 'Progress').length },
    { status: 'Ready', count: allOrderItems.filter(item => item.status === 'Ready').length },
    { status: 'Delivered', count: allOrderItems.filter(item => item.status === 'Delivered').length },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Order Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default OrderFunnelChart;
