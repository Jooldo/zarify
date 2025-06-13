
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
      <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-blue-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-gray-700">Raw Materials</CardTitle>
          <div className="p-1.5 bg-blue-100 rounded-full">
            <Settings className="h-3.5 w-3.5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-xl font-bold text-blue-700">{configStats.rawMaterials}</div>
          <p className="text-xs text-gray-500 mt-0.5">Configured</p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-purple-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-gray-700">Finished Goods</CardTitle>
          <div className="p-1.5 bg-purple-100 rounded-full">
            <Package2 className="h-3.5 w-3.5 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-xl font-bold text-purple-700">{configStats.finishedGoods}</div>
          <p className="text-xs text-gray-500 mt-0.5">Products</p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-green-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-gray-700">Suppliers</CardTitle>
          <div className="p-1.5 bg-green-100 rounded-full">
            <Users className="h-3.5 w-3.5 text-green-600" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-xl font-bold text-green-700">{configStats.suppliers}</div>
          <p className="text-xs text-gray-500 mt-0.5">Partners</p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-orange-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-medium text-gray-700">Material Types</CardTitle>
          <div className="p-1.5 bg-orange-100 rounded-full">
            <Layers className="h-3.5 w-3.5 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="text-xl font-bold text-orange-700">{configStats.materialTypes}</div>
          <p className="text-xs text-gray-500 mt-0.5">Categories</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigStatsHeader;
