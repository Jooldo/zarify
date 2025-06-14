
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Package2, Users, Layers } from 'lucide-react';

interface ConfigStatsHeaderProps {
  configStats: {
    rawMaterials: number;
    finishedGoods: number;
    suppliers: number;
    materialTypes: number;
  };
}

const ConfigStatsHeader = ({ configStats }: ConfigStatsHeaderProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-blue-50 border-blue-200 border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-blue-800">Raw Materials</CardTitle>
          <div className="p-1.5 bg-blue-200 rounded-full">
            <Settings className="h-4 w-4 text-blue-700" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-2xl font-bold text-blue-900">{configStats.rawMaterials}</div>
          <p className="text-xs text-blue-700 mt-0.5">Configured</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-purple-50 border-purple-200 border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-purple-800">Finished Goods</CardTitle>
          <div className="p-1.5 bg-purple-200 rounded-full">
            <Package2 className="h-4 w-4 text-purple-700" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-2xl font-bold text-purple-900">{configStats.finishedGoods}</div>
          <p className="text-xs text-purple-700 mt-0.5">Products</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-green-50 border-green-200 border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-green-800">Suppliers</CardTitle>
          <div className="p-1.5 bg-green-200 rounded-full">
            <Users className="h-4 w-4 text-green-700" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-2xl font-bold text-green-900">{configStats.suppliers}</div>
          <p className="text-xs text-green-700 mt-0.5">Partners</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-orange-50 border-orange-200 border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-orange-800">Material Types</CardTitle>
          <div className="p-1.5 bg-orange-200 rounded-full">
            <Layers className="h-4 w-4 text-orange-700" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-2xl font-bold text-orange-900">{configStats.materialTypes}</div>
          <p className="text-xs text-orange-700 mt-0.5">Categories</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigStatsHeader;
