
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package2, AlertTriangle, CheckCircle, Factory, Target } from 'lucide-react';

interface FinishedGoodsStatsHeaderProps {
  inventoryStats: {
    total: number;
    belowThreshold: number;
    inManufacturing: number;
    healthy: number;
    totalStock: number;
  };
}

const FinishedGoodsStatsHeader = ({ inventoryStats }: FinishedGoodsStatsHeaderProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
      <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-blue-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-gray-700">Total Products</CardTitle>
          <div className="p-1.5 bg-blue-100 rounded-full">
            <Package2 className="h-3.5 w-3.5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-xl font-bold text-blue-700">{inventoryStats.total}</div>
          <p className="text-xs text-gray-500 mt-0.5">Product types</p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-purple-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-gray-700">Total Stock</CardTitle>
          <div className="p-1.5 bg-purple-100 rounded-full">
            <Target className="h-3.5 w-3.5 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-xl font-bold text-purple-700">{inventoryStats.totalStock}</div>
          <p className="text-xs text-gray-500 mt-0.5">Units available</p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-red-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-gray-700">Below Threshold</CardTitle>
          <div className="p-1.5 bg-red-100 rounded-full">
            <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-xl font-bold text-red-700">{inventoryStats.belowThreshold}</div>
          <p className="text-xs text-gray-500 mt-0.5">Low stock</p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-orange-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-gray-700">In Manufacturing</CardTitle>
          <div className="p-1.5 bg-orange-100 rounded-full">
            <Factory className="h-3.5 w-3.5 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-xl font-bold text-orange-700">{inventoryStats.inManufacturing}</div>
          <p className="text-xs text-gray-500 mt-0.5">Being produced</p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-green-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-gray-700">Healthy Stock</CardTitle>
          <div className="p-1.5 bg-green-100 rounded-full">
            <CheckCircle className="h-3.5 w-3.5 text-green-600" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-xl font-bold text-green-700">{inventoryStats.healthy}</div>
          <p className="text-xs text-gray-500 mt-0.5">Good levels</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinishedGoodsStatsHeader;
