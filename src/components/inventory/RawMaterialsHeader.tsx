
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Package, CheckCircle, Target } from 'lucide-react';

interface MaterialStats {
  total: number;
  critical: number;
  low: number;
  good: number;
}

interface RawMaterialsHeaderProps {
  materialStats: MaterialStats;
}

const RawMaterialsHeader = ({ materialStats }: RawMaterialsHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Raw Material Inventory</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-700">Total Materials</CardTitle>
            <div className="p-1.5 bg-blue-100 rounded-full">
              <Package className="h-3.5 w-3.5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-xl font-bold text-blue-700">{materialStats.total}</div>
            <p className="text-xs text-gray-500 mt-0.5">Material types</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-red-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-700">Critical Stock</CardTitle>
            <div className="p-1.5 bg-red-100 rounded-full">
              <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-xl font-bold text-red-700">{materialStats.critical}</div>
            <p className="text-xs text-gray-500 mt-0.5">Urgent attention</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-yellow-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-700">Low Stock</CardTitle>
            <div className="p-1.5 bg-yellow-100 rounded-full">
              <Target className="h-3.5 w-3.5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-xl font-bold text-yellow-700">{materialStats.low}</div>
            <p className="text-xs text-gray-500 mt-0.5">Need restocking</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-green-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-700">Good Stock</CardTitle>
            <div className="p-1.5 bg-green-100 rounded-full">
              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-xl font-bold text-green-700">{materialStats.good}</div>
            <p className="text-xs text-gray-500 mt-0.5">Healthy levels</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RawMaterialsHeader;
