
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Clock, CheckCircle } from "lucide-react";

interface ProcurementHeaderProps {
  requestStats?: {
    total: number;
    pending: number;
    completed: number;
  };
}

const ProcurementHeader = ({ requestStats }: ProcurementHeaderProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Procurement Requests</h2>
          <p className="text-sm text-gray-600">Manage and track raw material procurement requests</p>
        </div>
      </div>

      {requestStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-blue-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-gray-700">Total Requests</CardTitle>
              <div className="p-1.5 bg-blue-100 rounded-full">
                <ShoppingBag className="h-3.5 w-3.5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-xl font-bold text-blue-700">{requestStats.total}</div>
              <p className="text-xs text-gray-500 mt-0.5">All requests</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-orange-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-gray-700">Pending</CardTitle>
              <div className="p-1.5 bg-orange-100 rounded-full">
                <Clock className="h-3.5 w-3.5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-xl font-bold text-orange-700">{requestStats.pending}</div>
              <p className="text-xs text-gray-500 mt-0.5">Awaiting action</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-green-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-gray-700">Completed</CardTitle>
              <div className="p-1.5 bg-green-100 rounded-full">
                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-xl font-bold text-green-700">{requestStats.completed}</div>
              <p className="text-xs text-gray-500 mt-0.5">Fulfilled</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProcurementHeader;
