import React, { useState, useMemo, useCallback } from 'react';
import { useManufacturingOrders, ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { Button } from '@/components/ui/button';
import { Plus, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ManufacturingOrdersTable from './ManufacturingOrdersTable';
import ManufacturingOrderDetailsDialog from './ManufacturingOrderDetailsDialog';
import CreateManufacturingOrderDialog from './CreateManufacturingOrderDialog';
import ManufacturingOrdersFilter from './ManufacturingOrdersFilter';
import { useToast } from '@/hooks/use-toast';

interface ManufacturingDashboardProps {
  onViewFlow?: (order: ManufacturingOrder) => void;
}

interface FilterState {
  search: string;
  status: string;
  priority: string;
  productName: string;
  dueDateFrom: Date | null;
  dueDateTo: Date | null;
  createdDateRange: string;
  hasSpecialInstructions: boolean;
  overdueOrders: boolean;
}

const ManufacturingDashboard: React.FC<ManufacturingDashboardProps> = ({ onViewFlow }) => {
  const { manufacturingOrders, isLoading, createOrder, updateOrder, deleteOrder, refetch } = useManufacturingOrders();
  const { manufacturingSteps } = useManufacturingSteps();
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [createOrderDialogOpen, setCreateOrderDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ManufacturingOrder | null>(null);
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    status: '',
    priority: '',
    productName: '',
    dueDateFrom: null,
    dueDateTo: null,
    createdDateRange: '',
    hasSpecialInstructions: false,
    overdueOrders: false,
  });
  const { toast } = useToast();

  const handleViewOrder = (order: ManufacturingOrder) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder(orderId);
      toast({
        title: 'Success',
        description: 'Manufacturing order deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting manufacturing order:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete manufacturing order',
        variant: 'destructive',
      });
    }
  };

  const handleOrderUpdate = () => {
    refetch();
  };

  const handleViewFlow = useCallback((order: ManufacturingOrder) => {
    if (onViewFlow) {
      onViewFlow(order);
    }
  }, [onViewFlow]);

  const handleFiltersChange = (newFilters: any) => {
    setFilter(newFilters);
  };

  const filteredOrders = useMemo(() => {
    return manufacturingOrders.filter(order => {
      if (filter.search && !order.order_number.toLowerCase().includes(filter.search.toLowerCase()) &&
          !order.product_name.toLowerCase().includes(filter.search.toLowerCase())) {
        return false;
      }
      if (filter.status && order.status !== filter.status) {
        return false;
      }
      if (filter.priority && order.priority !== filter.priority) {
        return false;
      }
      if (filter.productName && !order.product_name.toLowerCase().includes(filter.productName.toLowerCase())) {
        return false;
      }
      // Add more filter logic as needed for the new filter properties
      if (filter.dueDateFrom && order.due_date && new Date(order.due_date) < filter.dueDateFrom) {
        return false;
      }
      if (filter.dueDateTo && order.due_date && new Date(order.due_date) > filter.dueDateTo) {
        return false;
      }
      if (filter.overdueOrders && order.due_date && new Date(order.due_date) > new Date()) {
        return false;
      }
      return true;
    });
  }, [manufacturingOrders, filter]);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalOrders = manufacturingOrders.length;
  const pendingOrders = manufacturingOrders.filter(order => order.status === 'pending').length;
  const inProgressOrders = manufacturingOrders.filter(order => order.status === 'in_progress').length;
  const completedOrders = manufacturingOrders.filter(order => order.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
            <CardDescription>All manufacturing orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Orders</CardTitle>
            <CardDescription>Orders waiting to start</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>In Progress Orders</CardTitle>
            <CardDescription>Orders currently being manufactured</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed Orders</CardTitle>
            <CardDescription>Finished manufacturing orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <Input
            type="text"
            placeholder="Search by order number or product name..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="flex-1"
          />
        </div>
        <Button onClick={() => setCreateOrderDialogOpen(true)} className="whitespace-nowrap">
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </Button>
      </div>

      <ManufacturingOrdersFilter onFiltersChange={handleFiltersChange} />

      <ManufacturingOrdersTable
        orders={filteredOrders}
        getPriorityColor={getPriorityColor}
        getStatusColor={getStatusColor}
        onViewOrder={handleViewOrder}
        onDeleteOrder={handleDeleteOrder}
        onOrderUpdate={handleOrderUpdate}
        onViewFlow={handleViewFlow}
      />

      <ManufacturingOrderDetailsDialog
        order={selectedOrder}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        getPriorityColor={getPriorityColor}
        getStatusColor={getStatusColor}
      />

      <CreateManufacturingOrderDialog
        open={createOrderDialogOpen}
        onOpenChange={setCreateOrderDialogOpen}
      />
    </div>
  );
};

export default ManufacturingDashboard;
