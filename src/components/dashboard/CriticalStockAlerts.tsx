
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Package } from 'lucide-react';
import CardSkeleton from '@/components/ui/skeletons/CardSkeleton';

const CriticalStockAlerts = () => {
  const { rawMaterials, loading: rawLoading } = useRawMaterials();
  const { finishedGoods, loading: finishedLoading } = useFinishedGoods();

  if (rawLoading || finishedLoading) {
    return (
      <CardSkeleton 
        showHeader={true}
        headerHeight="h-6"
        contentHeight="h-32"
        showFooter={false}
      />
    );
  }

  // Critical raw materials (shortfall > 0)
  const criticalRawMaterials = rawMaterials.filter(material => material.shortfall > 0);
  
  // Finished goods below threshold
  const lowFinishedGoods = finishedGoods.filter(
    item => item.current_stock < item.threshold
  );

  return (
    <Card className="border-l-4 border-l-red-500 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Critical Stock Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-medium text-red-800">Raw Materials Critical</span>
          </div>
          <span className="text-2xl font-bold text-red-600">{criticalRawMaterials.length}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-yellow-600" />
            <span className="font-medium text-yellow-800">Finished Goods Low</span>
          </div>
          <span className="text-2xl font-bold text-yellow-600">{lowFinishedGoods.length}</span>
        </div>

        {criticalRawMaterials.length === 0 && lowFinishedGoods.length === 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-medium text-green-800">All stock levels healthy</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CriticalStockAlerts;
