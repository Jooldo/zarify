
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, TrendingUp, AlertTriangle, CheckCircle, Clock, Plus, FileText, History, Download, Users, Calendar } from 'lucide-react';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { useProcurementRequests } from '@/hooks/useProcurementRequests';
import { useActivityLog } from '@/hooks/useActivityLog';
import { useMaterialTypes } from '@/hooks/useMaterialTypes';

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
    
    // Breakdown by type
    const typeBreakdown = rawMaterials.reduce((acc, material) => {
      const type = material.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalMaterials,
      lowStockMaterials,
      criticalStockMaterials,
      typeBreakdown
    };
  }, [rawMaterials]);

  // Calculate procurement metrics
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

    return {
      openRequests: openRequests.length,
      pendingDeliveries,
      recentlyReceived: recentlyReceived.length
    };
  }, [requests]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Raw Material Management - Home
        </h3>
        <p className="text-muted-foreground">
          Central hub providing quick insights across inventory, procurement, and stock health.
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

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Inventory Snapshot */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {inventoryMetrics.totalMaterials}
                </div>
                <div className="text-sm text-blue-600">Total Materials</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {inventoryMetrics.lowStockMaterials.length}
                </div>
                <div className="text-sm text-red-600">Low Stock</div>
              </div>
            </div>
            
            {inventoryMetrics.criticalStockMaterials.length > 0 && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                <div className="flex items-center gap-2 text-red-700 font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  Critical Stock Alert
                </div>
                <div className="text-sm text-red-600 mt-1">
                  {inventoryMetrics.criticalStockMaterials.length} materials are out of stock
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-sm font-medium">Breakdown by Type:</div>
              {Object.entries(inventoryMetrics.typeBreakdown).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm">{type}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Procurement Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Procurement Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <div>
                  <div className="text-lg font-bold text-yellow-700">
                    {procurementMetrics.openRequests}
                  </div>
                  <div className="text-sm text-yellow-600">Open Requests</div>
                </div>
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="text-lg font-bold text-blue-700">
                    {procurementMetrics.pendingDeliveries.length}
                  </div>
                  <div className="text-sm text-blue-600">Pending Deliveries</div>
                </div>
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="text-lg font-bold text-green-700">
                    {procurementMetrics.recentlyReceived}
                  </div>
                  <div className="text-sm text-green-600">Recently Received</div>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>

            {procurementMetrics.pendingDeliveries.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Upcoming Deliveries:</div>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {procurementMetrics.pendingDeliveries.slice(0, 3).map((delivery) => (
                    <div key={delivery.id} className="text-xs p-2 bg-blue-50 rounded">
                      <div className="font-medium">{delivery.raw_material?.name}</div>
                      <div className="text-blue-600">ETA: {formatDate(delivery.eta!)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Last 10 activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
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
