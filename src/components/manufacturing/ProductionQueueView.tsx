
import React, { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Factory, Search, Kanban, GitBranch, X, Table } from 'lucide-react';
import { useManufacturingOrders, ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import ManufacturingOrderDetailsDialog from './ManufacturingOrderDetailsDialog';
import ReactFlowView from './ReactFlowView';
import ProductionKanbanView from './ProductionKanbanView';
import ManufacturingOrdersTable from './ManufacturingOrdersTable';
import ProductionQueueFilter from './ProductionQueueFilter';
import { Badge } from '@/components/ui/badge';

interface ProductionQueueFilters {
  status: string;
  priority: string;
  productName: string;
  orderNumber: string;
  hasInProgressSteps: boolean;
  hasCompletedSteps: boolean;
  urgentOnly: boolean;
}

interface ProductionQueueViewProps {
  selectedOrderForFlow?: ManufacturingOrder | null;
  onClearOrderFilter?: () => void;
}

const ProductionQueueView = ({ selectedOrderForFlow, onClearOrderFilter }: ProductionQueueViewProps) => {
  const { manufacturingOrders, isLoading } = useManufacturingOrders();
  const { manufacturingSteps, orderSteps } = useManufacturingSteps();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState('table');
  const [filters, setFilters] = useState<ProductionQueueFilters>({
    status: '',
    priority: '',
    productName: '',
    orderNumber: '',
    hasInProgressSteps: false,
    hasCompletedSteps: false,
    urgentOnly: false,
  });

  // Apply filter when selectedOrderForFlow changes
  useEffect(() => {
    if (selectedOrderForFlow) {
      setFilters(prev => ({
        ...prev,
        orderNumber: selectedOrderForFlow.order_number,
      }));
      setSearchTerm('');
    }
  }, [selectedOrderForFlow]);

  const clearOrderFilter = () => {
    setFilters(prev => ({
      ...prev,
      orderNumber: '',
    }));
    // Notify parent component to clear the selectedOrderForFlow state
    if (onClearOrderFilter) {
      onClearOrderFilter();
    }
  };

  console.log('ProductionQueueView - Manufacturing Orders:', manufacturingOrders);
  console.log('ProductionQueueView - Manufacturing Steps:', manufacturingSteps);

  const filteredOrders = useMemo(() => {
    const orders = Array.isArray(manufacturingOrders) ? manufacturingOrders : [];
    const steps = Array.isArray(orderSteps) ? orderSteps : [];
    
    return orders.filter(order => {
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
      if (filters.orderNumber && !order.order_number.toLowerCase().includes(filters.orderNumber.toLowerCase())) return false;
      
      // Get order steps for this order
      const orderOrderSteps = steps.filter(step => step.order_id === order.id);
      
      // Quick filters
      if (filters.hasInProgressSteps) {
        const hasInProgress = orderOrderSteps.some(step => step.status === 'in_progress');
        if (!hasInProgress) return false;
      }
      
      if (filters.hasCompletedSteps) {
        const hasCompleted = orderOrderSteps.some(step => step.status === 'completed');
        if (!hasCompleted) return false;
      }
      
      if (filters.urgentOnly && order.priority !== 'urgent') return false;

      return true;
    });
  }, [manufacturingOrders, orderSteps, searchTerm, filters]);

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

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  const handleViewFlow = (order: ManufacturingOrder) => {
    setActiveView('reactflow');
    setFilters(prev => ({
      ...prev,
      orderNumber: order.order_number,
    }));
  };

  const isOrderFiltered = Boolean(filters.orderNumber);

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Production Queue</h2>
          {isOrderFiltered && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                Order: {filters.orderNumber}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearOrderFilter}
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            </div>
          )}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={activeView === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('table')}
              className="h-8 px-3"
            >
              <Table className="h-4 w-4 mr-1" />
              Table View
            </Button>
            <Button
              variant={activeView === 'reactflow' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('reactflow')}
              className="h-8 px-3"
            >
              <GitBranch className="h-4 w-4 mr-1" />
              React Flow View
            </Button>
            <Button
              variant={activeView === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('kanban')}
              className="h-8 px-3"
            >
              <Kanban className="h-4 w-4 mr-1" />
              Kanban View
            </Button>
          </div>
        </div>

        {/* Search and Filter Controls - Only show for table view and reactflow view when not filtered by order */}
        {(activeView === 'table' || activeView === 'reactflow') && !isOrderFiltered && (
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search production queue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-8"
              />
            </div>
            {activeView === 'table' && <ProductionQueueFilter onFiltersChange={setFilters} />}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 rounded-lg bg-muted/20">
          <div className="text-center">
            <Factory className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading production queue...</p>
          </div>
        </div>
      ) : (
        <div>
          {activeView === 'table' ? (
            <ManufacturingOrdersTable
              orders={filteredOrders}
              getPriorityColor={getPriorityColor}
              getStatusColor={getStatusColor}
              onViewOrder={handleViewDetails}
              onViewFlow={handleViewFlow}
            />
          ) : activeView === 'reactflow' ? (
            <ReactFlowView
              manufacturingOrders={filteredOrders}
              onViewDetails={handleViewDetails}
            />
          ) : (
            <ProductionKanbanView />
          )}
        </div>
      )}

      {/* Manufacturing Order Details Dialog */}
      <ManufacturingOrderDetailsDialog
        order={selectedOrder}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        getPriorityColor={getPriorityColor}
        getStatusColor={getStatusColor}
      />
    </div>
  );
};

export default ProductionQueueView;
