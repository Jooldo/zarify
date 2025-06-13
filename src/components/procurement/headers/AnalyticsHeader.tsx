
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Clock, DollarSign } from "lucide-react";

interface AnalyticsHeaderProps {
  totalRequests: number;
  totalValue: number;
  avgLeadTime: number;
  activeSuppliers: number;
}

const AnalyticsHeader = ({ totalRequests, totalValue, avgLeadTime, activeSuppliers }: AnalyticsHeaderProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Procurement Analytics</h2>
        <p className="text-sm text-gray-600">Track procurement efficiency, costs, and supplier performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-700">Total Requests</CardTitle>
            <div className="p-1.5 bg-blue-100 rounded-full">
              <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-xl font-bold text-blue-700">{totalRequests}</div>
            <p className="text-xs text-gray-500 mt-0.5">All time</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-green-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-700">Total Value</CardTitle>
            <div className="p-1.5 bg-green-100 rounded-full">
              <DollarSign className="h-3.5 w-3.5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-xl font-bold text-green-700">₹{totalValue.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-0.5">Investment</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-orange-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-700">Avg Lead Time</CardTitle>
            <div className="p-1.5 bg-orange-100 rounded-full">
              <Clock className="h-3.5 w-3.5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-xl font-bold text-orange-700">{avgLeadTime.toFixed(1)} days</div>
            <p className="text-xs text-gray-500 mt-0.5">Average time</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-700">Active Suppliers</CardTitle>
            <div className="p-1.5 bg-purple-100 rounded-full">
              <TrendingUp className="h-3.5 w-3.5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-xl font-bold text-purple-700">{activeSuppliers}</div>
            <p className="text-xs text-gray-500 mt-0.5">Working partners</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
