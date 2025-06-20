import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Boxes, AlertTriangle, ShoppingCart, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import RawMaterialManufacturingDistribution from './RawMaterialManufacturingDistribution';

interface RawMaterialSectionProps {
  rawMaterials: any[];
  loading: boolean;
}

const RawMaterialSection = ({ rawMaterials, loading }: RawMaterialSectionProps) => {
  const rawMaterialMetrics = useMemo(() => {
    if (!rawMaterials.length) return {
      stockDistribution: [],
      availabilityDistribution: [],
      toBeOrdered: [],
      procurementOverview: {
        requested: 0,
        approved: 0,
        ordered: 0
      },
      expectedToday: []
    };

    // Stock Volume Distribution
    const goodStock = rawMaterials.filter(material => material.current_stock >= material.minimum_stock * 2).length;
    const lowStock = rawMaterials.filter(material => material.current_stock < material.minimum_stock * 2 && material.current_stock >= material.minimum_stock).length;
    const criticalStock = rawMaterials.filter(material => material.current_stock < material.minimum_stock).length;

    const stockDistribution = [
      { name: 'Good Stock', value: goodStock, color: '#10b981' },
      { name: 'Low Stock', value: lowStock, color: '#f59e0b' },
      { name: 'Critical Stock', value: criticalStock, color: '#ef4444' }
    ].filter(item => item.value > 0);

    // RM Availability Distribution
    const totalInventory = rawMaterials.reduce((sum, material) => sum + material.current_stock, 0);
    const totalInManufacturing = rawMaterials.reduce((sum, material) => sum + (material.in_procurement || 0), 0);
    const totalRequired = rawMaterials.reduce((sum, material) => sum + (material.required || 0), 0);

    const availabilityDistribution = [
      { name: 'In Inventory', value: totalInventory, color: '#3b82f6' },
      { name: 'In Manufacturing', value: totalInManufacturing, color: '#8b5cf6' },
      { name: 'Required', value: totalRequired, color: '#f59e0b' }
    ].filter(item => item.value > 0);

    // Materials to be ordered (critical stock)
    const toBeOrdered = rawMaterials
      .filter(material => material.current_stock < material.minimum_stock)
      .sort((a, b) => (a.current_stock / a.minimum_stock) - (b.current_stock / b.minimum_stock))
      .slice(0, 10);

    // Procurement Overview (mock data - would come from procurement_requests)
    const procurementOverview = {
      requested: rawMaterials.filter(m => m.request_status === 'Pending').length,
      approved: rawMaterials.filter(m => m.request_status === 'Approved').length,
      ordered: rawMaterials.filter(m => m.request_status === 'Ordered').length
    };

    // Expected today (mock data)
    const expectedToday = rawMaterials
      .filter(material => material.request_status === 'Ordered')
      .slice(0, 5);

    return {
      stockDistribution,
      availabilityDistribution,
      toBeOrdered,
      procurementOverview,
      expectedToday
    };
  }, [rawMaterials]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Manufacturing Distribution Loading */}
        <RawMaterialManufacturingDistribution loading={true} />
        
        {/* Existing loading cards */}
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
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Manufacturing Distribution Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Manufacturing Process Distribution</h3>
        <RawMaterialManufacturingDistribution />
      </div>

      {/* Existing Analytics Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventory Analytics</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Stock Volume Distribution */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Boxes className="h-5 w-5 text-purple-600" />
                Stock Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={rawMaterialMetrics.stockDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {rawMaterialMetrics.stockDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-4">
                {rawMaterialMetrics.stockDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* RM Availability */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                RM Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={rawMaterialMetrics.availabilityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {rawMaterialMetrics.availabilityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-4">
                {rawMaterialMetrics.availabilityDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Procurement Overview */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                Procurement Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-700">Requested</span>
                  <span className="text-xl font-bold text-blue-800">
                    {rawMaterialMetrics.procurementOverview.requested}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium text-orange-700">Approved</span>
                  <span className="text-xl font-bold text-orange-800">
                    {rawMaterialMetrics.procurementOverview.approved}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <span className="text-sm font-medium text-emerald-700">Ordered</span>
                  <span className="text-xl font-bold text-emerald-800">
                    {rawMaterialMetrics.procurementOverview.ordered}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Materials to be Ordered */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                To Be Ordered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {rawMaterialMetrics.toBeOrdered.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm">All materials well stocked</p>
                  </div>
                ) : (
                  rawMaterialMetrics.toBeOrdered.map((material, index) => (
                    <div key={material.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{material.name}</p>
                        <p className="text-xs text-gray-500">{material.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-700">
                          {material.current_stock}/{material.minimum_stock}
                        </p>
                        <p className="text-xs text-gray-500">current/min</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Expected Today */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                Expected Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rawMaterialMetrics.expectedToday.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No deliveries expected today</p>
                  </div>
                ) : (
                  rawMaterialMetrics.expectedToday.map((material, index) => (
                    <div key={material.id} className="flex items-center justify-between p-2 bg-indigo-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{material.name}</p>
                        <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200 text-xs">
                          {material.type}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-indigo-700">
                          {material.in_procurement || 0}
                        </p>
                        <p className="text-xs text-gray-500">units</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RawMaterialSection;
