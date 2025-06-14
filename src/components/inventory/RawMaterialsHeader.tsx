
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
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-blue-50 border-blue-200 border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-blue-800">Total Materials</CardTitle>
            <div className="p-1.5 bg-blue-200 rounded-full">
              <Package className="h-4 w-4 text-blue-700" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold text-blue-900">{materialStats.total}</div>
            <p className="text-xs text-blue-700 mt-0.5">Material types</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-red-50 border-red-200 border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-red-800">Critical Stock</CardTitle>
            <div className="p-1.5 bg-red-200 rounded-full">
              <AlertTriangle className="h-4 w-4 text-red-700" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold text-red-900">{materialStats.critical}</div>
            <p className="text-xs text-red-700 mt-0.5">Urgent attention</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-yellow-50 border-yellow-200 border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-yellow-800">Low Stock</CardTitle>
            <div className="p-1.5 bg-yellow-200 rounded-full">
              <Target className="h-4 w-4 text-yellow-700" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold text-yellow-900">{materialStats.low}</div>
            <p className="text-xs text-yellow-700 mt-0.5">Need restocking</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-green-50 border-green-200 border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-green-800">Good Stock</CardTitle>
            <div className="p-1.5 bg-green-200 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-700" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold text-green-900">{materialStats.good}</div>
            <p className="text-xs text-green-700 mt-0.5">Healthy levels</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RawMaterialsHeader;
