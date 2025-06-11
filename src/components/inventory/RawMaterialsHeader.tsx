
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, CheckCircle, RefreshCw, Calculator } from 'lucide-react';
import { useRawMaterials } from '@/hooks/useRawMaterials';

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
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateCalculations } = useRawMaterials();

  const handleUpdateCalculations = async () => {
    setIsUpdating(true);
    try {
      await updateCalculations();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Raw Material Inventory</h2>
        <div className="flex gap-2">
          <Button
            onClick={handleUpdateCalculations}
            disabled={isUpdating}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Calculator className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Updating...' : 'Update Calculations'}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materialStats.total}</div>
            <Badge variant="secondary" className="mt-1">
              All materials
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{materialStats.critical}</div>
            <Badge variant="destructive" className="mt-1">
              Shortage exists
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{materialStats.low}</div>
            <Badge variant="secondary" className="mt-1">
              Below minimum
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Good Stock</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{materialStats.good}</div>
            <Badge variant="default" className="mt-1">
              Adequate levels
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RawMaterialsHeader;
