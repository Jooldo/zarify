
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package2, Clock, CheckCircle, Workflow } from 'lucide-react';

interface ManufacturingStatsCardsProps {
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
}

const ManufacturingStatsCards = ({ 
  totalOrders, 
  pendingOrders, 
  inProgressOrders, 
  completedOrders 
}: ManufacturingStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-blue-50 border-blue-200 border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-blue-800">Total Orders</CardTitle>
          <div className="p-1.5 bg-blue-200 rounded-full">
            <Package2 className="h-4 w-4 text-blue-700" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-2xl font-bold text-blue-900">{totalOrders}</div>
          <p className="text-xs text-blue-700 mt-0.5">All manufacturing orders</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-gray-50 border-gray-200 border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-gray-800">Pending</CardTitle>
          <div className="p-1.5 bg-gray-200 rounded-full">
            <Clock className="h-4 w-4 text-gray-700" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-2xl font-bold text-gray-900">{pendingOrders}</div>
          <p className="text-xs text-gray-700 mt-0.5">Awaiting production</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-orange-50 border-orange-200 border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-orange-800">In Progress</CardTitle>
          <div className="p-1.5 bg-orange-200 rounded-full">
            <Workflow className="h-4 w-4 text-orange-700" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-2xl font-bold text-orange-900">{inProgressOrders}</div>
          <p className="text-xs text-orange-700 mt-0.5">Currently being manufactured</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-green-50 border-green-200 border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-green-800">Completed</CardTitle>
          <div className="p-1.5 bg-green-200 rounded-full">
            <CheckCircle className="h-4 w-4 text-green-700" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-2xl font-bold text-green-900">{completedOrders}</div>
          <p className="text-xs text-green-700 mt-0.5">Finished production</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManufacturingStatsCards;
