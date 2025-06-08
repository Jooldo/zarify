
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useProcurementRequests } from '@/hooks/useProcurementRequests';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { Badge } from "@/components/ui/badge";

const ProcurementAnalytics = () => {
  const { requests } = useProcurementRequests();
  const { suppliers } = useSuppliers();
  const { rawMaterials } = useRawMaterials();
  
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('all');

  // Filter data based on selected filters
  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      if (dateFrom && new Date(request.date_requested) < new Date(dateFrom)) return false;
      if (dateTo && new Date(request.date_requested) > new Date(dateTo)) return false;
      if (selectedSupplier !== 'all' && request.supplier_id !== selectedSupplier) return false;
      if (selectedMaterial !== 'all' && request.raw_material_id !== selectedMaterial) return false;
      return true;
    });
  }, [requests, dateFrom, dateTo, selectedSupplier, selectedMaterial]);

  // Monthly procurement volume data
  const monthlyData = useMemo(() => {
    const monthlyStats = {};
    filteredRequests.forEach(request => {
      const month = new Date(request.date_requested).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      if (!monthlyStats[month]) {
        monthlyStats[month] = { month, volume: 0, count: 0 };
      }
      monthlyStats[month].volume += request.quantity_requested;
      monthlyStats[month].count += 1;
    });
    return Object.values(monthlyStats);
  }, [filteredRequests]);

  // Status distribution data
  const statusData = useMemo(() => {
    const statusCount = { Pending: 0, Approved: 0, Received: 0 };
    filteredRequests.forEach(request => {
      statusCount[request.status]++;
    });
    return Object.entries(statusCount).map(([status, count]) => ({ status, count }));
  }, [filteredRequests]);

  // Supplier performance data
  const supplierData = useMemo(() => {
    const supplierStats = {};
    filteredRequests.forEach(request => {
      const supplier = suppliers.find(s => s.id === request.supplier_id);
      const supplierName = supplier?.company_name || 'Unknown';
      if (!supplierStats[supplierName]) {
        supplierStats[supplierName] = { 
          name: supplierName, 
          totalOrders: 0, 
          completed: 0,
          avgLeadTime: 0 
        };
      }
      supplierStats[supplierName].totalOrders++;
      if (request.status === 'Received') {
        supplierStats[supplierName].completed++;
      }
    });
    return Object.values(supplierStats);
  }, [filteredRequests, suppliers]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const totalRequests = filteredRequests.length;
  const totalValue = filteredRequests.reduce((sum, req) => {
    const material = rawMaterials.find(m => m.id === req.raw_material_id);
    return sum + (req.quantity_requested * (material?.cost_per_unit || 0));
  }, 0);
  const avgLeadTime = filteredRequests.filter(r => r.eta).length > 0 ? 
    filteredRequests.filter(r => r.eta).reduce((sum, req) => {
      const leadTime = Math.abs(new Date(req.eta).getTime() - new Date(req.date_requested).getTime()) / (1000 * 60 * 60 * 24);
      return sum + leadTime;
    }, 0) / filteredRequests.filter(r => r.eta).length : 0;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Filters</CardTitle>
          <CardDescription>Filter analytics data by date range, supplier, and material</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date-from">From Date</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-to">To Date</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger>
                  <SelectValue placeholder="All Suppliers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Material</Label>
              <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                <SelectTrigger>
                  <SelectValue placeholder="All Materials" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Materials</SelectItem>
                  {rawMaterials.map(material => (
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Lead Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgLeadTime.toFixed(1)} days</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Procurement Volume</CardTitle>
            <CardDescription>Procurement volume by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="volume" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>Current status of procurement requests</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Supplier Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Supplier Performance</CardTitle>
            <CardDescription>Order count and completion rate by supplier</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={supplierData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalOrders" fill="#8884d8" name="Total Orders" />
                <Bar dataKey="completed" fill="#82ca9d" name="Completed Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProcurementAnalytics;
