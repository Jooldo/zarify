
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle } from 'lucide-react';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';

const FinishedGoodsSection = () => {
  const { finishedGoods, loading } = useFinishedGoods();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Finished Goods Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const lowStockItems = finishedGoods.filter(item => 
    item.current_stock <= (item.threshold || 0)
  );

  const criticalItems = finishedGoods.filter(item => 
    item.current_stock === 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Finished Goods Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{finishedGoods.length}</div>
            <div className="text-sm text-blue-600">Total Products</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-700">{lowStockItems.length}</div>
            <div className="text-sm text-red-600">Low Stock</div>
          </div>
        </div>

        {/* Critical Items Alert */}
        {criticalItems.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
              <AlertTriangle className="h-4 w-4" />
              Out of Stock Items ({criticalItems.length})
            </div>
            <div className="space-y-1">
              {criticalItems.slice(0, 3).map(item => (
                <div key={item.id} className="text-sm text-red-600">
                  {item.product_code}
                </div>
              ))}
              {criticalItems.length > 3 && (
                <div className="text-sm text-red-500">
                  +{criticalItems.length - 3} more items
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Items */}
        <div>
          <h4 className="font-medium mb-3">Recent Stock Status</h4>
          <div className="space-y-2">
            {finishedGoods.slice(0, 5).map(item => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.product_code}</div>
                  <div className="text-xs text-gray-500">
                    Stock: {item.current_stock} | Threshold: {item.threshold || 0}
                  </div>
                </div>
                <div>
                  {item.current_stock === 0 ? (
                    <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                  ) : item.current_stock <= (item.threshold || 0) ? (
                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Low Stock</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">In Stock</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinishedGoodsSection;
