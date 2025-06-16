
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConversationalQueryWidget from './ConversationalQueryWidget';
import OrderDistributionChart from './OrderDistributionChart';
import OrderFunnelChart from './OrderFunnelChart';
import ReadyOrdersTrendChart from './ReadyOrdersTrendChart';
import CriticalStockAlerts from './CriticalStockAlerts';
import DailyInsights from './DailyInsights';
import TodaysActivities from './TodaysActivities';
import ProcurementStatusOverview from './ProcurementStatusOverview';
import OrderTrendsByCategory from './OrderTrendsByCategory';

const DashboardCharts = () => {
  return (
    <div className="space-y-6">
      {/* Conversational Query Widget */}
      <ConversationalQueryWidget />

      {/* Order Trends by Product Category */}
      <OrderTrendsByCategory />

      {/* Chart Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OrderDistributionChart />
            <OrderFunnelChart />
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 gap-6">
            <ReadyOrdersTrendChart />
            <ProcurementStatusOverview />
          </div>
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-6 mt-6">
          <CriticalStockAlerts />
        </TabsContent>
        
        <TabsContent value="activities" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DailyInsights />
            <TodaysActivities />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardCharts;
