
import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Plus, Package2 } from 'lucide-react';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import CreateManufacturingOrderDialog from './CreateManufacturingOrderDialog';
import ManufacturingOrdersTable from './ManufacturingOrdersTable';
import ManufacturingOrderDetailsDialog from './ManufacturingOrderDetailsDialog';
import ProductionQueueView from './ProductionQueueView';
import CardSkeleton from '@/components/ui/skeletons/CardSkeleton';
import { ManufacturingOrder, ManufacturingFilters } from '@/types/manufacturing';
import { getPriorityColor, getStatusColor } from '@/utils/manufacturingColors';
import ManufacturingDashboardHeader from './ManufacturingDashboardHeader';
import ManufacturingStatsCards from './ManufacturingStatsCards';
import ManufacturingToolbar from './ManufacturingToolbar';

const ManufacturingDashboard = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedOrder, setSelectedOrder] = useState<ManufacturingOrder | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
  
  const { manufacturingOrders, loading, updateOrder } = useManufacturingOrders();

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

  if (loading) {
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

  const handleViewOrder = (order: ManufacturingOrder) => {
    setSelectedOrder(order);
    setShowDetailsDialog(true);
  };

  const handleStatusUpdate = (orderId: string, status: 'pending' | 'in_progress' | 'completed') => {
    updateOrder(orderId, { status });
  };

  return (
    <div className="space-y-6">
      <ManufacturingDashboardHeader onShowCreateDialog={() => setShowCreateDialog(true)} />

      <ManufacturingStatsCards
        totalOrders={totalOrders}
        pendingOrders={pendingOrders}
        inProgressOrders={inProgressOrders}
        completedOrders={completedOrders}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">Manufacturing Orders</TabsTrigger>
          <TabsTrigger value="queue">Production Queue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="space-y-4">
          <ManufacturingToolbar
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onFiltersChange={setFilters}
          />

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
            />
          )}
        </TabsContent>
        
        <TabsContent value="queue" className="mt-4">
          <ProductionQueueView />
        </TabsContent>
      </Tabs>

      <CreateManufacturingOrderDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      <ManufacturingOrderDetailsDialog
        order={selectedOrder}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        onStatusUpdate={handleStatusUpdate}
        getPriorityColor={getPriorityColor}
        getStatusColor={getStatusColor}
      />
    </div>
  );
};

export default ManufacturingDashboard;
