
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
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
      <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-blue-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-gray-700">Total Orders</CardTitle>
          <div className="p-1.5 bg-blue-100 rounded-full">
            <ClipboardList className="h-3.5 w-3.5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-xl font-bold text-blue-700">{orderStats.total}</div>
          <p className="text-xs text-gray-500 mt-0.5">All orders</p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-gray-400 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-gray-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-gray-700">Created</CardTitle>
          <div className="p-1.5 bg-gray-100 rounded-full">
            <Clock className="h-3.5 w-3.5 text-gray-600" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-xl font-bold text-gray-700">{orderStats.created}</div>
          <p className="text-xs text-gray-500 mt-0.5">New orders</p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-orange-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-gray-700">In Progress</CardTitle>
          <div className="p-1.5 bg-orange-100 rounded-full">
            <Package className="h-3.5 w-3.5 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-xl font-bold text-orange-700">{orderStats.inProgress}</div>
          <p className="text-xs text-gray-500 mt-0.5">Being processed</p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-yellow-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-gray-700">Ready</CardTitle>
          <div className="p-1.5 bg-yellow-100 rounded-full">
            <CheckCircle className="h-3.5 w-3.5 text-yellow-600" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-xl font-bold text-yellow-700">{orderStats.ready}</div>
          <p className="text-xs text-gray-500 mt-0.5">Ready to ship</p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-green-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-gray-700">Delivered</CardTitle>
          <div className="p-1.5 bg-green-100 rounded-full">
            <Truck className="h-3.5 w-3.5 text-green-600" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-xl font-bold text-green-700">{orderStats.delivered}</div>
          <p className="text-xs text-gray-500 mt-0.5">Completed</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersStatsHeader;
