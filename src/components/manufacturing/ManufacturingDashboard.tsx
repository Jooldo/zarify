import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Package2, Clock, CheckCircle, Workflow, Search } from 'lucide-react';
import { useManufacturingOrders, ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import CreateManufacturingOrderDialog from './CreateManufacturingOrderDialog';
import ManufacturingOrdersTable from './ManufacturingOrdersTable';
import ManufacturingOrderDetailsDialog from './ManufacturingOrderDetailsDialog';
import ProductionQueueView from './ProductionQueueView';
import ManufacturingOrdersFilter from './ManufacturingOrdersFilter';
import CardSkeleton from '@/components/ui/skeletons/CardSkeleton';

interface ManufacturingFilters {
  status: string;
  priority: string;
  productName: string;
  dueDateFrom: Date | null;
  dueDateTo: Date | null;
  createdDateRange: string;
  hasSpecialInstructions: boolean;
  overdueOrders: boolean;
}

const ManufacturingDashboard = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedOrder, setSelectedOrder] = useState<ManufacturingOrder | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderForFlow, setSelectedOrderForFlow] = useState<ManufacturingOrder | null>(null);
  const [filters, setFilters] = useState<ManufacturingFilters>({
    status: '',
    priority: '',
    productName: '',
    dueDateFrom: null,
    dueDateTo: null,
    createdDateRange: '',
    hasSpecialInstructions: false,
    overdueOrders: false,
  });
  
  const { manufacturingOrders, isLoading, updateOrder, deleteOrder, refetch } = useManufacturingOrders();

  // Filter and search logic
  const filteredOrders = useMemo(() => {
    return manufacturingOrders.filter(order => {
      // Text search filter
      if (searchTerm) {
        const searchMatch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
               order.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (order.product_configs?.product_code || '').toLowerCase().includes(searchTerm.toLowerCase());
        if (!searchMatch) return false;
      }

      // Apply filters
      if (filters.status && order.status !== filters.status) return false;
      if (filters.priority && order.priority !== filters.priority) return false;
      if (filters.productName && !order.product_name.toLowerCase().includes(filters.productName.toLowerCase())) return false;
      
      // Date range filter for creation
      if (filters.createdDateRange) {
        const orderDate = new Date(order.created_at);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (filters.createdDateRange) {
          case 'Today':
            if (daysDiff !== 0) return false;
            break;
          case 'Last 7 days':
            if (daysDiff > 7) return false;
            break;
          case 'Last 30 days':
            if (daysDiff > 30) return false;
            break;
          case 'Last 90 days':
            if (daysDiff > 90) return false;
            break;
        }
      }

      // Due date range filter
      if (filters.dueDateFrom || filters.dueDateTo) {
        if (!order.due_date) return false;
        
        const dueDate = new Date(order.due_date);
        
        if (filters.dueDateFrom) {
          const fromDate = new Date(filters.dueDateFrom);
          fromDate.setHours(0, 0, 0, 0);
          dueDate.setHours(0, 0, 0, 0);
          if (dueDate < fromDate) return false;
        }
        
        if (filters.dueDateTo) {
          const toDate = new Date(filters.dueDateTo);
          toDate.setHours(23, 59, 59, 999);
          dueDate.setHours(0, 0, 0, 0);
          if (dueDate > toDate) return false;
        }
      }

      // Quick filters
      if (filters.hasSpecialInstructions && !order.special_instructions) return false;
      if (filters.overdueOrders) {
        if (!order.due_date || new Date(order.due_date) >= new Date()) return false;
      }

      return true;
    });
  }, [manufacturingOrders, searchTerm, filters]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} showHeader={true} headerHeight="h-6" contentHeight="h-20" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} showHeader={true} headerHeight="h-8" contentHeight="h-32" />
          ))}
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalOrders = manufacturingOrders.length;
  const pendingOrders = manufacturingOrders.filter(order => order.status === 'pending').length;
  const inProgressOrders = manufacturingOrders.filter(order => order.status === 'in_progress').length;
  const completedOrders = manufacturingOrders.filter(order => order.status === 'completed').length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'tagged_in': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewOrder = (order: ManufacturingOrder) => {
    setSelectedOrder(order);
    setShowDetailsDialog(true);
  };

  const handleViewFlow = (order: ManufacturingOrder) => {
    setSelectedOrderForFlow(order);
    setActiveTab('queue');
  };

  const handleStatusUpdate = (orderId: string, status: 'pending' | 'in_progress' | 'completed') => {
    updateOrder(orderId, { status });
  };

  const handleDeleteOrder = (orderId: string) => {
    deleteOrder(orderId);
  };

  const handleDetailsDialogClose = (open: boolean) => {
    setShowDetailsDialog(open);
    if (!open) {
      // Clear selected order to ensure fresh data on next open
      setSelectedOrder(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Manufacturing Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage production orders and track manufacturing progress
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Manufacturing Order
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-blue-50 border-blue-200 border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-blue-800">Total Orders</CardTitle>
            <div className="p-1.5 bg-blue-200 rounded-full">
              <Package2 className="h-4 w-4 text-blue-700" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold text-blue-900">{totalOrders}</div>
            <p className="text-xs text-blue-700 mt-0.5">All manufacturing orders</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-gray-50 border-gray-200 border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-800">Pending</CardTitle>
            <div className="p-1.5 bg-gray-200 rounded-full">
              <Clock className="h-4 w-4 text-gray-700" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold text-gray-900">{pendingOrders}</div>
            <p className="text-xs text-gray-700 mt-0.5">Awaiting production</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-orange-50 border-orange-200 border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-orange-800">In Progress</CardTitle>
            <div className="p-1.5 bg-orange-200 rounded-full">
              <Workflow className="h-4 w-4 text-orange-700" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold text-orange-900">{inProgressOrders}</div>
            <p className="text-xs text-orange-700 mt-0.5">Currently being manufactured</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] bg-green-50 border-green-200 border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-green-800">Completed</CardTitle>
            <div className="p-1.5 bg-green-200 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-700" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold text-green-900">{completedOrders}</div>
            <p className="text-xs text-green-700 mt-0.5">Finished production</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">Manufacturing Orders</TabsTrigger>
          <TabsTrigger value="queue">Production Queue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search manufacturing orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-8"
                />
              </div>
              <ManufacturingOrdersFilter onFiltersChange={setFilters} />
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package2 className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Manufacturing Orders</h3>
                <p className="text-gray-500 text-center mb-4">
                  {searchTerm || Object.values(filters).some(f => f) 
                    ? 'No orders found matching your search and filters.'
                    : 'Create your first manufacturing order to start tracking production'
                  }
                </p>
                {!searchTerm && !Object.values(filters).some(f => f) && (
                  <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Manufacturing Order
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <ManufacturingOrdersTable 
              orders={filteredOrders}
              getPriorityColor={getPriorityColor}
              getStatusColor={getStatusColor}
              onViewOrder={handleViewOrder}
              onDeleteOrder={handleDeleteOrder}
              onOrderUpdate={refetch}
              onViewFlow={handleViewFlow}
            />
          )}
        </TabsContent>
        
        <TabsContent value="queue" className="mt-4">
          <ProductionQueueView selectedOrderForFlow={selectedOrderForFlow} />
        </TabsContent>
      </Tabs>

      <CreateManufacturingOrderDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      <ManufacturingOrderDetailsDialog
        order={selectedOrder}
        open={showDetailsDialog}
        onOpenChange={handleDetailsDialogClose}
        onStatusUpdate={handleStatusUpdate}
        getPriorityColor={getPriorityColor}
        getStatusColor={getStatusColor}
      />
    </div>
  );
};

export default ManufacturingDashboard;
