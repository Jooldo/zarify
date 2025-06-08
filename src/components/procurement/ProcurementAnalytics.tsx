
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useProcurementRequests } from '@/hooks/useProcurementRequests';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, Package, DollarSign } from 'lucide-react';

const ProcurementAnalytics = () => {
  const { requests, loading } = useProcurementRequests();
  const { suppliers } = useSuppliers();
  const { rawMaterials } = useRawMaterials();
  
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('all');

  // Filter requests based on selected filters
  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      if (dateFrom && new Date(request.date_requested) < new Date(dateFrom)) return false;
      if (dateTo && new Date(request.date_requested) > new Date(dateTo)) return false;
      if (selectedSupplier !== 'all' && request.supplier_id !== selectedSupplier) return false;
      if (selectedMaterial !== 'all' && request.raw_material_id !== selectedMaterial) return false;
      return true;
    });
  }, [requests, dateFrom, dateTo, selectedSupplier, selectedMaterial]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalRequests = filteredRequests.length;
    const totalValue = filteredRequests.reduce((sum, req) => {
      const material = rawMaterials.find(m => m.id === req.raw_material_id);
      return sum + (material?.cost_per_unit || 0) * req.quantity_requested;
    }, 0);

    const avgLeadTime = filteredRequests
      .filter(req => req.status === 'Received' && req.eta)
      .reduce((sum, req, _, arr) => {
        const leadTime = new Date(req.eta!).getTime() - new Date(req.date_requested).getTime();
        return sum + leadTime / (1000 * 60 * 60 * 24) / arr.length;
      }, 0);

    const statusCounts = filteredRequests.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalRequests, totalValue, avgLeadTime, statusCounts };
  }, [filteredRequests, rawMaterials]);

  // Monthly procurement volume data
  const monthlyData = useMemo(() => {
    const monthlyVolume = filteredRequests.reduce((acc, req) => {
      const month = new Date(req.date_requested).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const material = rawMaterials.find(m => m.id === req.raw_material_id);
      const value = (material?.cost_per_unit || 0) * req.quantity_requested;
      
      if (!acc[month]) {
        acc[month] = { month, volume: 0, count: 0, value: 0 };
      }
      acc[month].volume += req.quantity_requested;
      acc[month].count += 1;
      acc[month].value += value;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(monthlyVolume).sort((a: any, b: any) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [filteredRequests, rawMaterials]);

  // Supplier performance data
  const supplierData = useMemo(() => {
    const supplierStats = filteredRequests.reduce((acc, req) => {
      const supplier = suppliers.find(s => s.id === req.supplier_id);
      const supplierName = supplier?.company_name || 'Unknown';
      
      if (!acc[supplierName]) {
        acc[supplierName] = { name: supplierName, requests: 0, avgLeadTime: 0, onTimeDelivery: 0, totalRequests: 0 };
      }
      
      acc[supplierName].requests += 1;
      acc[supplierName].totalRequests += 1;
      
      if (req.status === 'Received' && req.eta) {
        const leadTime = new Date(req.eta).getTime() - new Date(req.date_requested).getTime();
        acc[supplierName].avgLeadTime += leadTime / (1000 * 60 * 60 * 24);
        acc[supplierName].onTimeDelivery += 1;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(supplierStats).map((supplier: any) => ({
      ...supplier,
      avgLeadTime: supplier.onTimeDelivery > 0 ? supplier.avgLeadTime / supplier.onTimeDelivery : 0,
      onTimeRate: supplier.totalRequests > 0 ? (supplier.onTimeDelivery / supplier.totalRequests * 100) : 0
    }));
  }, [filteredRequests, suppliers]);

  // Status distribution for pie chart
  const statusData = Object.entries(analytics.statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
    color: status === 'Pending' ? '#f59e0b' : status === 'Approved' ? '#3b82f6' : '#10b981'
  }));

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Analytics Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs">From Date</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">To Date</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Supplier</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Material</Label>
              <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Materials</SelectItem>
                  {rawMaterials.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Total Requests</p>
                <p className="text-lg font-semibold">{analytics.totalRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Total Value</p>
                <p className="text-lg font-semibold">₹{analytics.totalValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Avg Lead Time</p>
                <p className="text-lg font-semibold">{analytics.avgLeadTime.toFixed(1)} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Completion Rate</p>
                <p className="text-lg font-semibold">
                  {analytics.totalRequests > 0 ? ((analytics.statusCounts['Received'] || 0) / analytics.totalRequests * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Procurement Volume</CardTitle>
            <CardDescription>Procurement requests and value over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Requests" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Request Status Distribution</CardTitle>
            <CardDescription>Current status of all requests</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Cost Trends</CardTitle>
            <CardDescription>Total procurement value over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip formatter={(value) => [`₹${value}`, 'Value']} />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Supplier Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Supplier Performance</CardTitle>
            <CardDescription>Average lead time by supplier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {supplierData.map((supplier: any) => (
                <div key={supplier.name} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium text-sm">{supplier.name}</p>
                    <p className="text-xs text-gray-600">{supplier.requests} requests</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {supplier.avgLeadTime.toFixed(1)} days
                    </Badge>
                    <p className="text-xs text-gray-600 mt-1">
                      {supplier.onTimeRate.toFixed(1)}% on-time
                    </p>
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

export default ProcurementAnalytics;
