
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ArrowRight } from 'lucide-react';

interface CriticalFinishedGoodsProps {
  onNavigateToInventory?: () => void;
}

const CriticalFinishedGoods = ({ onNavigateToInventory }: CriticalFinishedGoodsProps) => {
  const { finishedGoods, loading } = useFinishedGoods();

  if (loading) {
    return (
      <Card className="h-64">
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
      const available = item.current_stock + item.in_manufacturing;
      return totalDemand > available;
    })
    .sort((a, b) => {
      const shortfallA = (a.required_quantity + a.threshold) - (a.current_stock + a.in_manufacturing);
      const shortfallB = (b.required_quantity + b.threshold) - (b.current_stock + b.in_manufacturing);
      return shortfallB - shortfallA;
    })
    .slice(0, 3);

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-gray-900">Critical Finished Goods</CardTitle>
          {criticalGoods.length > 0 && (
            <Package className="h-4 w-4 text-orange-500" />
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {criticalGoods.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-sm text-gray-500">All products adequately stocked</div>
          </div>
        ) : (
          <div className="space-y-3">
            {criticalGoods.map((item) => {
              const totalDemand = item.required_quantity + item.threshold;
              const available = item.current_stock + item.in_manufacturing;
              const shortfall = Math.max(0, totalDemand - available);
              
              return (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-900 text-sm">{item.product_code}</div>
                    <div className="text-xs text-gray-500">
                      {item.product_config.category}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Shortfall:</span>
                      <span className="font-medium text-red-600">{shortfall} units</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Available:</span>
                      <span className="text-gray-900">{available} units</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Required:</span>
                      <span className="text-gray-900">{totalDemand} units</span>
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
