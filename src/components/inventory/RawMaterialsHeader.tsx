
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package2, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface RawMaterialsHeaderProps {
  materialStats?: {
    critical: number;
    good: number;
    low: number;
  };
}

const RawMaterialsHeader = ({ 
  materialStats
}: RawMaterialsHeaderProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Package2 className="h-5 w-5" />
          Raw Materials Inventory
        </h3>
      </div>

      {materialStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Stocks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{materialStats.critical}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stocks</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{materialStats.low}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Good Stocks</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{materialStats.good}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RawMaterialsHeader;
