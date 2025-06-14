
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-blue-50 border-blue-200 border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-blue-800">Total Orders</CardTitle>
          <div className="p-1.5 bg-blue-200 rounded-full">
            <ClipboardList className="h-4 w-4 text-blue-700" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-2xl font-bold text-blue-900">{orderStats.total}</div>
          <p className="text-xs text-blue-700 mt-0.5">All orders</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-gray-50 border-gray-200 border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-gray-800">Created</CardTitle>
          <div className="p-1.5 bg-gray-200 rounded-full">
            <Clock className="h-4 w-4 text-gray-700" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-2xl font-bold text-gray-900">{orderStats.created}</div>
          <p className="text-xs text-gray-700 mt-0.5">New orders</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-orange-50 border-orange-200 border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-orange-800">In Progress</CardTitle>
          <div className="p-1.5 bg-orange-200 rounded-full">
            <Package className="h-4 w-4 text-orange-700" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-2xl font-bold text-orange-900">{orderStats.inProgress}</div>
          <p className="text-xs text-orange-700 mt-0.5">Being processed</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-yellow-50 border-yellow-200 border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-yellow-800">Ready</CardTitle>
          <div className="p-1.5 bg-yellow-200 rounded-full">
            <CheckCircle className="h-4 w-4 text-yellow-700" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-2xl font-bold text-yellow-900">{orderStats.ready}</div>
          <p className="text-xs text-yellow-700 mt-0.5">Ready to ship</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-green-50 border-green-200 border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-green-800">Delivered</CardTitle>
          <div className="p-1.5 bg-green-200 rounded-full">
            <Truck className="h-4 w-4 text-green-700" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-2xl font-bold text-green-900">{orderStats.delivered}</div>
          <p className="text-xs text-green-700 mt-0.5">Completed</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersStatsHeader;
