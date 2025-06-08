
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Raw Materials</CardTitle>
          <Settings className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{configStats.rawMaterials}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Finished Goods</CardTitle>
          <Package2 className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{configStats.finishedGoods}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
          <Users className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{configStats.suppliers}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Material Types</CardTitle>
          <Layers className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{configStats.materialTypes}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigStatsHeader;
