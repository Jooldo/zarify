
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
    <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-red-50 to-white">
      <CardHeader className="pb-3 pt-3 px-4">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <div className="p-1.5 bg-red-100 rounded-full">
            <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
          </div>
          Critical Stock Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-4 pb-3">
        <div className="flex items-center justify-between p-2 bg-red-100 rounded-lg border border-red-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-red-800">Raw Materials Critical</span>
          </div>
          <span className="text-lg font-bold text-red-600">{criticalRawMaterials.length}</span>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-yellow-100 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2">
            <Package className="h-3 w-3 text-yellow-600" />
            <span className="text-xs font-medium text-yellow-800">Finished Goods Low</span>
          </div>
          <span className="text-lg font-bold text-yellow-600">{lowFinishedGoods.length}</span>
        </div>

        {criticalRawMaterials.length === 0 && lowFinishedGoods.length === 0 && (
          <div className="flex items-center gap-2 p-2 bg-green-100 rounded-lg border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs font-medium text-green-800">All stock levels healthy</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CriticalStockAlerts;
