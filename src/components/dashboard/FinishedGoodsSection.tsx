
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Factory, AlertTriangle } from 'lucide-react';

interface FinishedGoodsSectionProps {
  finishedGoods: any[];
  loading: boolean;
}

const FinishedGoodsSection = ({ finishedGoods, loading }: FinishedGoodsSectionProps) => {
  const finishedGoodsMetrics = useMemo(() => {
    if (!finishedGoods.length) return {
      stockDistribution: [],
      readyByCategory: [],
      topPerformers: [],
      bottomPerformers: [],
      toBeRestocked: []
    };

    // Stock Volume Distribution
    const goodStock = finishedGoods.filter(item => item.current_stock >= item.threshold * 1.5).length;
    const lowStock = finishedGoods.filter(item => item.current_stock < item.threshold && item.current_stock >= item.threshold * 0.5).length;
    const criticalStock = finishedGoods.filter(item => item.current_stock < item.threshold * 0.5).length;

    const stockDistribution = [
      { name: 'Good Stock', value: goodStock, color: '#10b981' },
      { name: 'Low Stock', value: lowStock, color: '#f59e0b' },
      { name: 'Critical Stock', value: criticalStock, color: '#ef4444' }
    ].filter(item => item.value > 0);

    // Ready Orders by Product Category
    const categoryData = finishedGoods.reduce((acc, item) => {
      const category = item.product_configs?.category || 'Unknown';
      if (!acc[category]) {
        acc[category] = { category, ready: 0 };
      }
      acc[category].ready += item.current_stock;
      return acc;
    }, {} as Record<string, any>);

    const readyByCategory = Object.values(categoryData).slice(0, 6);

    // Top and Bottom Performers (by stock levels)
    const performers = finishedGoods
      .map(item => ({
        ...item,
        performance: item.current_stock / (item.threshold || 1)
      }))
      .sort((a, b) => b.performance - a.performance);

    const topPerformers = performers.slice(0, 5);
    const bottomPerformers = performers.slice(-5).reverse();

    // SKUs to be restocked (low stock items)
    const toBeRestocked = finishedGoods
      .filter(item => item.current_stock < item.threshold)
      .sort((a, b) => (a.current_stock / a.threshold) - (b.current_stock / b.threshold))
      .slice(0, 10);

    return {
      stockDistribution,
      readyByCategory,
      topPerformers,
      bottomPerformers,
      toBeRestocked
    };
  }, [finishedGoods]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Top Performers */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Top Performing SKUs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {finishedGoodsMetrics.topPerformers.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      #{index + 1}
                    </Badge>
                    <span className="text-sm font-medium text-gray-800">{item.product_code}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-700">{item.current_stock}</p>
                    <p className="text-xs text-gray-500">stock</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Performers */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Low Stock SKUs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {finishedGoodsMetrics.bottomPerformers.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-gray-800">{item.product_code}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-700">{item.current_stock}/{item.threshold}</p>
                    <p className="text-xs text-gray-500">stock/threshold</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SKUs to be Restocked */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Factory className="h-5 w-5 text-orange-600" />
              To Be Restocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {finishedGoodsMetrics.toBeRestocked.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.product_code}</p>
                    <p className="text-xs text-gray-500">{item.product_configs?.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-700">
                      {Math.max(0, item.threshold - item.current_stock)}
                    </p>
                    <p className="text-xs text-gray-500">needed</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinishedGoodsSection;
