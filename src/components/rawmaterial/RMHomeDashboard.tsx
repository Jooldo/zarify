import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, TrendingUp, AlertTriangle, CheckCircle, Clock, Plus, FileText, History, Download, Users, Calendar, BarChart3, PieChart, TrendingDown, Activity } from 'lucide-react';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { useProcurementRequests } from '@/hooks/useProcurementRequests';
import { useActivityLog } from '@/hooks/useActivityLog';
import { useMaterialTypes } from '@/hooks/useMaterialTypes';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, LineChart, Line, Pie } from 'recharts';

interface RMHomeDashboardProps {
  onNavigateToTab?: (tab: string) => void;
}

const RMHomeDashboard = ({ onNavigateToTab }: RMHomeDashboardProps) => {
  const { rawMaterials } = useRawMaterials();
  const { requests } = useProcurementRequests();
  const { logs } = useActivityLog();
  const { materialTypes } = useMaterialTypes();
  
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Calculate inventory metrics
  const inventoryMetrics = useMemo(() => {
    const totalMaterials = rawMaterials.length;
    const lowStockMaterials = rawMaterials.filter(m => m.current_stock <= m.minimum_stock);
    const criticalStockMaterials = rawMaterials.filter(m => m.current_stock === 0);
    const healthyStockMaterials = rawMaterials.filter(m => m.current_stock > m.minimum_stock);
    
    // Calculate total value
    const totalValue = rawMaterials.reduce((sum, material) => {
      return sum + (material.current_stock * (material.cost_per_unit || 0));
    }, 0);

    // Breakdown by type
    const typeBreakdown = rawMaterials.reduce((acc, material) => {
      const type = material.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Stock health distribution for pie chart
    const stockHealthData = [
      { name: 'Healthy Stock', value: healthyStockMaterials.length, color: '#10b981' },
      { name: 'Low Stock', value: lowStockMaterials.length, color: '#f59e0b' },
      { name: 'Critical Stock', value: criticalStockMaterials.length, color: '#ef4444' },
    ].filter(item => item.value > 0);

    return {
      totalMaterials,
      lowStockMaterials,
      criticalStockMaterials,
      healthyStockMaterials,
      typeBreakdown,
      totalValue,
      stockHealthData
    };
  }, [rawMaterials]);

  // Calculate procurement metrics and timeline data
  const procurementMetrics = useMemo(() => {
    const openRequests = requests.filter(r => r.status === 'Pending' || r.status === 'Approved');
    const pendingDeliveries = requests.filter(r => r.status === 'Approved' && r.eta);
    const recentlyReceived = requests.filter(r => {
      if (r.status !== 'Received') return false;
      const requestDate = new Date(r.date_requested);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return requestDate >= sevenDaysAgo;
    });

    // Generate procurement timeline data for last 30 days
    const timelineData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayRequests = requests.filter(r => {
        const requestDate = new Date(r.date_requested).toISOString().split('T')[0];
        return requestDate === dateStr;
      });

      timelineData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: dateStr,
        created: dayRequests.filter(r => r.status === 'Pending').length,
        approved: dayRequests.filter(r => r.status === 'Approved').length,
        received: dayRequests.filter(r => r.status === 'Received').length,
        total: dayRequests.length
      });
    }

    // Status distribution for chart
    const statusData = [
      { name: 'Pending', value: requests.filter(r => r.status === 'Pending').length, color: '#f59e0b' },
      { name: 'Approved', value: requests.filter(r => r.status === 'Approved').length, color: '#3b82f6' },
      { name: 'Received', value: requests.filter(r => r.status === 'Received').length, color: '#10b981' }
    ].filter(item => item.value > 0);

    return {
      openRequests: openRequests.length,
      pendingDeliveries,
      recentlyReceived: recentlyReceived.length,
      timelineData,
      statusData
    };
  }, [requests]);

  // Activity timeline data
  const activityTimelineData = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp).toISOString().split('T')[0];
        return logDate === dateStr && (log.entity_type === 'Raw Material' || log.entity_type === 'Procurement Request');
      });

      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        activities: dayLogs.length,
        stockUpdates: dayLogs.filter(l => l.action === 'Stock Updated').length,
        requests: dayLogs.filter(l => l.action === 'Request Created').length
      });
    }
    return last7Days;
  }, [logs]);

  // Get recent activity (filtered)
  const recentActivity = useMemo(() => {
    let filteredLogs = logs.filter(log => 
      log.entity_type === 'Raw Material' || 
      log.entity_type === 'Procurement Request'
    );

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= filterDate
      );
    }

    return filteredLogs.slice(0, 10);
  }, [logs, dateFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'Stock Updated':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'Status Updated':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Request Created':
        return <Plus className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const chartConfig = {
    created: { label: "Created", color: "#f59e0b" },
    approved: { label: "Approved", color: "#3b82f6" },
    received: { label: "Received", color: "#10b981" },
    activities: { label: "Activities", color: "#6366f1" },
    stockUpdates: { label: "Stock Updates", color: "#10b981" },
    requests: { label: "Requests", color: "#f59e0b" }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Raw Material Management - Home
        </h3>
        <p className="text-muted-foreground">
          Central hub providing comprehensive insights across inventory, procurement, and stock health with real-time analytics.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Dashboard Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date From</Label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Material Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {materialTypes.map(type => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDateFilter('');
                  setTypeFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Materials</p>
                <p className="text-2xl font-bold">{inventoryMetrics.totalMaterials}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold">{formatCurrency(inventoryMetrics.totalValue)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Requests</p>
                <p className="text-2xl font-bold">{procurementMetrics.openRequests}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-600">{inventoryMetrics.lowStockMaterials.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Procurement Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Procurement Timeline (30 Days)
            </CardTitle>
            <CardDescription>Daily procurement request activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={procurementMetrics.timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="created" 
                    stackId="1"
                    stroke={chartConfig.created.color}
                    fill={chartConfig.created.color}
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="approved" 
                    stackId="1"
                    stroke={chartConfig.approved.color}
                    fill={chartConfig.approved.color}
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="received" 
                    stackId="1"
                    stroke={chartConfig.received.color}
                    fill={chartConfig.received.color}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Stock Health Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Stock Health Distribution
            </CardTitle>
            <CardDescription>Overview of current stock status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={inventoryMetrics.stockHealthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {inventoryMetrics.stockHealthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Weekly Activity Trend
            </CardTitle>
            <CardDescription>Daily activities for the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="stockUpdates" stackId="a" fill={chartConfig.stockUpdates.color} />
                  <Bar dataKey="requests" stackId="a" fill={chartConfig.requests.color} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Last 10 activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[250px] overflow-y-auto">
              {recentActivity.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-4">
                  No recent activity found
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                    <div className="mt-1">
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{activity.action}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {activity.description}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(activity.timestamp)} • {activity.user_name}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Critical Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Critical Stock Alerts
            </CardTitle>
            <CardDescription>
              {inventoryMetrics.criticalStockMaterials.length > 10 
                ? `Showing 10 of ${inventoryMetrics.criticalStockMaterials.length} critical items`
                : `${inventoryMetrics.criticalStockMaterials.length} critical items`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inventoryMetrics.criticalStockMaterials.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-4">
                No critical stock alerts
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {inventoryMetrics.criticalStockMaterials.slice(0, 10).map((material) => (
                  <div key={material.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{material.name}</div>
                      <div className="text-xs text-red-600">Out of stock</div>
                    </div>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                ))}
                {inventoryMetrics.criticalStockMaterials.length > 10 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => onNavigateToTab?.('rm-inventory')}
                  >
                    View All {inventoryMetrics.criticalStockMaterials.length} Items
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Deliveries
            </CardTitle>
            <CardDescription>
              {procurementMetrics.pendingDeliveries.length > 10 
                ? `Showing 10 of ${procurementMetrics.pendingDeliveries.length} deliveries`
                : `${procurementMetrics.pendingDeliveries.length} deliveries`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {procurementMetrics.pendingDeliveries.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-4">
                No pending deliveries
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {procurementMetrics.pendingDeliveries.slice(0, 10).map((delivery) => (
                  <div key={delivery.id} className="p-2 bg-blue-50 rounded">
                    <div className="font-medium text-sm">{delivery.raw_material?.name}</div>
                    <div className="text-xs text-blue-600">
                      ETA: {formatDate(delivery.eta!)} • Qty: {delivery.quantity_requested} {delivery.unit}
                    </div>
                  </div>
                ))}
                {procurementMetrics.pendingDeliveries.length > 10 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => onNavigateToTab?.('rm-procurement')}
                  >
                    View All {procurementMetrics.pendingDeliveries.length} Deliveries
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Material Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Type Breakdown
            </CardTitle>
            <CardDescription>Materials by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {Object.entries(inventoryMetrics.typeBreakdown).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{type}</span>
                  <Badge variant="outline">{count} items</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Frequently used actions for efficient workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => onNavigateToTab?.('rm-inventory')}
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">Add Raw Material</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => onNavigateToTab?.('rm-procurement')}
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">Raise Request</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => onNavigateToTab?.('rm-procurement')}
            >
              <History className="h-6 w-6" />
              <span className="text-sm">Procurement History</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => onNavigateToTab?.('rm-suppliers')}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Manage Suppliers</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RMHomeDashboard;
