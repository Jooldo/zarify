
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrders } from '@/hooks/useOrders';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import { useActivityLog } from '@/hooks/useActivityLog';
import { format } from 'date-fns';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Factory,
  Boxes,
  Calendar
} from 'lucide-react';
import OrderDistributionChart from './OrderDistributionChart';
import OrderTrendsByCategory from './OrderTrendsByCategory';
import ConversationalQueryWidget from './ConversationalQueryWidget';
import TodaysInsightsSection from './TodaysInsightsSection';
import TodaysActivitiesSection from './TodaysActivitiesSection';
import OrderSection from './OrderSection';
import FinishedGoodsSection from './FinishedGoodsSection';
import RawMaterialSection from './RawMaterialSection';

const UnifiedDashboard = () => {
  const { orders, loading: ordersLoading } = useOrders();
  const { rawMaterials, loading: rawLoading } = useRawMaterials();
  const { finishedGoods, loading: finishedLoading } = useFinishedGoods();
  const { manufacturingOrders, isLoading: manufacturingLoading } = useManufacturingOrders();
  const { logs, loading: logsLoading } = useActivityLog();

  const today = new Date();
  const todayString = format(today, 'yyyy-MM-dd');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-2">
            Zarify Dashboard
          </h1>
          <p className="text-lg text-gray-600">Real-time manufacturing & inventory insights</p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Today's Summary Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Today's Summary</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TodaysInsightsSection 
              orders={orders}
              loading={ordersLoading}
              todayString={todayString}
            />
            <TodaysActivitiesSection 
              logs={logs}
              loading={logsLoading}
              todayString={todayString}
            />
          </div>
        </section>

        {/* Orders Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Orders Overview</h2>
          </div>
          
          <OrderSection 
            orders={orders}
            loading={ordersLoading}
          />
        </section>

        {/* Finished Goods Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <Factory className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Finished Goods</h2>
          </div>
          
          <FinishedGoodsSection 
            finishedGoods={finishedGoods}
            manufacturingOrders={manufacturingOrders}
            loading={finishedLoading || manufacturingLoading}
          />
        </section>

        {/* Raw Materials Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Boxes className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Raw Materials</h2>
          </div>
          
          <RawMaterialSection 
            rawMaterials={rawMaterials}
            loading={rawLoading}
          />
        </section>

        {/* Ask Your Data Widget */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Ask Your Data</h2>
          </div>
          
          <ConversationalQueryWidget />
        </section>
      </div>
    </div>
  );
};

export default UnifiedDashboard;
