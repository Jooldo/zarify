
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
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-blue-50 border-blue-200 border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-blue-800">Total Products</CardTitle>
          <div className="p-1.5 bg-blue-200 rounded-full">
            <Package2 className="h-4 w-4 text-blue-700" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-2xl font-bold text-blue-900">{inventoryStats.total}</div>
          <p className="text-xs text-blue-700 mt-0.5">Product types</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-purple-50 border-purple-200 border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-purple-800">Total Stock</CardTitle>
          <div className="p-1.5 bg-purple-200 rounded-full">
            <Target className="h-4 w-4 text-purple-700" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-2xl font-bold text-purple-900">{inventoryStats.totalStock}</div>
          <p className="text-xs text-purple-700 mt-0.5">Units available</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-red-50 border-red-200 border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-red-800">Below Threshold</CardTitle>
          <div className="p-1.5 bg-red-200 rounded-full">
            <AlertTriangle className="h-4 w-4 text-red-700" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-2xl font-bold text-red-900">{inventoryStats.belowThreshold}</div>
          <p className="text-xs text-red-700 mt-0.5">Low stock</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-orange-50 border-orange-200 border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-orange-800">In Manufacturing</CardTitle>
          <div className="p-1.5 bg-orange-200 rounded-full">
            <Factory className="h-4 w-4 text-orange-700" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-2xl font-bold text-orange-900">{inventoryStats.inManufacturing}</div>
          <p className="text-xs text-orange-700 mt-0.5">Being produced</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-green-50 border-green-200 border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-green-800">Healthy Stock</CardTitle>
          <div className="p-1.5 bg-green-200 rounded-full">
            <CheckCircle className="h-4 w-4 text-green-700" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-2xl font-bold text-green-900">{inventoryStats.healthy}</div>
          <p className="text-xs text-green-700 mt-0.5">Good levels</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinishedGoodsStatsHeader;
