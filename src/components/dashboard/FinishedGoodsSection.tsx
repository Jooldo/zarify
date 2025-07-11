import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Factory, AlertTriangle, Settings, Users } from 'lucide-react';
import FinishedGoodsManufacturingDistribution from './FinishedGoodsManufacturingDistribution';
import WorkerAssignmentsDisplay from './WorkerAssignmentsDisplay';

interface FinishedGoodsSectionProps {
  finishedGoods: any[];
  manufacturingOrders: any[];
  loading: boolean;
}

interface StepData {
  step: string;
  count: number;
  color: string;
}

const FinishedGoodsSection = ({ finishedGoods, manufacturingOrders, loading }: FinishedGoodsSectionProps) => {
  const getStepColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  const finishedGoodsMetrics = useMemo(() => {
    if (!finishedGoods.length) return {
      stockDistribution: [],
      readyByCategory: [],
      inProcessByStep: [],
      topPerformers: [],
      bottomPerformers: [],
      toBeManufactured: []
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

    // Ready Orders by Product Category (mock data - would need order items with ready status)
    const categoryData = finishedGoods.reduce((acc, item) => {
      const category = item.product_configs?.category || 'Unknown';
      if (!acc[category]) {
        acc[category] = { category, ready: 0 };
      }
      acc[category].ready += item.current_stock;
      return acc;
    }, {} as Record<string, any>);

    const readyByCategory = Object.values(categoryData).slice(0, 6);

    // In-Process SKUs by Step (mock data - would need manufacturing order steps)
    const stepData = manufacturingOrders.reduce((acc, order) => {
      const status = order.status || 'pending';
      if (!acc[status]) {
        acc[status] = { step: status, count: 0, color: getStepColor(status) };
      }
      acc[status].count += 1;
      return acc;
    }, {} as Record<string, StepData>);

    const inProcessByStep = Object.values(stepData) as StepData[];

    // Top and Bottom Performers (by stock levels)
    const performers = finishedGoods
      .map(item => ({
        ...item,
        performance: item.current_stock / (item.threshold || 1)
      }))
      .sort((a, b) => b.performance - a.performance);

    const topPerformers = performers.slice(0, 5);
    const bottomPerformers = performers.slice(-5).reverse();

    // SKUs to be manufactured (low stock items)
    const toBeManufactured = finishedGoods
      .filter(item => item.current_stock < item.threshold)
      .sort((a, b) => (a.current_stock / a.threshold) - (b.current_stock / b.threshold))
      .slice(0, 10);

    return {
      stockDistribution,
      readyByCategory,
      inProcessByStep,
      topPerformers,
      bottomPerformers,
      toBeManufactured
    };
  }, [finishedGoods, manufacturingOrders]);

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
      {/* Manufacturing Distribution - Full Width */}
      <div className="w-full">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-600" />
            Manufacturing Step Distribution
          </h3>
          <p className="text-sm text-gray-600">Real-time view of quantity and weight at each manufacturing step</p>
        </div>
        <FinishedGoodsManufacturingDistribution 
          manufacturingOrders={manufacturingOrders}
        />
      </div>

      {/* Worker Assignments - Full Width */}
      <div className="w-full">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Current Worker Assignments
          </h3>
          <p className="text-sm text-gray-600">Workers currently handling materials and orders at each manufacturing step</p>
        </div>
        <WorkerAssignmentsDisplay 
          manufacturingOrders={manufacturingOrders} 
          loading={loading} 
        />
      </div>

      {/* Other Metrics */}
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

        {/* SKUs to be Manufactured */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Factory className="h-5 w-5 text-orange-600" />
              To Be Manufactured
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {finishedGoodsMetrics.toBeManufactured.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.product_code}</p>
                    <p className="text-xs text-gray-500">{item.product_configs?.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-700">
                      {item.required_quantity - item.current_stock}
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
