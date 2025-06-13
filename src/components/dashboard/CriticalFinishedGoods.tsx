
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ArrowRight, AlertTriangle } from 'lucide-react';

interface CriticalFinishedGoodsProps {
  onNavigateToInventory?: () => void;
}

const CriticalFinishedGoods = ({ onNavigateToInventory }: CriticalFinishedGoodsProps) => {
  const { finishedGoods, loading } = useFinishedGoods();

  if (loading) {
    return (
      <Card className="h-64 shadow-sm">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-gray-500 text-sm">Loading inventory...</div>
        </CardContent>
      </Card>
    );
  }

  // Get top 3 finished goods with critical stock levels
  const criticalGoods = finishedGoods
    .filter(item => {
      const totalDemand = item.required_quantity + item.threshold;
      const available = item.current_stock + (item.in_manufacturing || 0);
      return totalDemand > available;
    })
    .sort((a, b) => {
      const shortfallA = (a.required_quantity + a.threshold) - (a.current_stock + (a.in_manufacturing || 0));
      const shortfallB = (b.required_quantity + b.threshold) - (b.current_stock + (b.in_manufacturing || 0));
      return shortfallB - shortfallA;
    })
    .slice(0, 3);

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-900">Critical Finished Goods</CardTitle>
          {criticalGoods.length > 0 && (
            <div className="p-1.5 bg-red-100 rounded-full">
              <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {criticalGoods.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-sm text-green-700 font-medium">All products adequately stocked</div>
            <div className="text-xs text-green-600 mt-1">No critical items found</div>
          </div>
        ) : (
          <div className="space-y-3">
            {criticalGoods.map((item) => {
              const totalDemand = item.required_quantity + item.threshold;
              const available = item.current_stock + (item.in_manufacturing || 0);
              const shortfall = Math.max(0, totalDemand - available);
              
              return (
                <div key={item.id} className="border-l-4 border-l-red-400 bg-red-50 rounded-lg p-3 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-900 text-sm">{item.product_code}</div>
                    <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                      {item.product_config.category}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-red-600 font-semibold">{shortfall}</div>
                      <div className="text-gray-600">Shortfall</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-900 font-semibold">{available}</div>
                      <div className="text-gray-600">Available</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-900 font-semibold">{totalDemand}</div>
                      <div className="text-gray-600">Required</div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <Button 
              onClick={onNavigateToInventory}
              className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white"
              size="sm"
            >
              Manage Inventory
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CriticalFinishedGoods;
