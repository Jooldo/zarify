
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, Users, ShoppingCart, TrendingUp } from 'lucide-react';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import { useCustomers } from '@/hooks/useCustomers';
import { useOrders } from '@/hooks/useOrders';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import TodaysActivitiesSection from './TodaysActivitiesSection';
import FinishedGoodsSection from './FinishedGoodsSection';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const UnifiedDashboard = () => {
  const { finishedGoods } = useFinishedGoods();
  const { customers } = useCustomers();
  const { orders } = useOrders();
  const { rawMaterials } = useRawMaterials();

  // Calculate metrics
  const totalProducts = finishedGoods.length;
  const totalCustomers = customers.length;
  const totalOrders = orders.length;
  const lowStockItems = finishedGoods.filter(item => 
    item.current_stock <= (item.threshold || 0)
  ).length;

  // Prepare chart data
  const stockData = finishedGoods.slice(0, 8).map(item => ({
    name: item.product_code,
    stock: item.current_stock,
    threshold: item.threshold || 0
  }));

  const orderStatusData = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(orderStatusData).map(([status, count]) => ({
    name: status,
    value: count
  }));

  const rawMaterialsData = rawMaterials.slice(0, 6).map(material => ({
    name: material.name,
    current: material.current_stock,
    minimum: material.minimum_stock
  }));

  return (
    <div className="space-y-6 p-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active product configurations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items below threshold</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Finished Goods Stock Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Finished Goods Stock Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stock" fill="#8884d8" name="Current Stock" />
                <Bar dataKey="threshold" fill="#82ca9d" name="Threshold" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Raw Materials Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Materials Stock Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rawMaterialsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="current" fill="#8884d8" name="Current Stock" />
              <Bar dataKey="minimum" fill="#ff7300" name="Minimum Stock" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sections Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodaysActivitiesSection />
        <FinishedGoodsSection />
      </div>
    </div>
  );
};

export default UnifiedDashboard;
