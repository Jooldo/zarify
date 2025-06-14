
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Factory, Search } from 'lucide-react';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import ManufacturingOrderDetailsDialog from './ManufacturingOrderDetailsDialog';
import ProductionFlowView from './ProductionFlowView';
import ProductionQueueFilter from './ProductionQueueFilter';

interface ProductionQueueFilters {
  status: string;
  priority: string;
  productName: string;
  orderNumber: string;
  hasInProgressSteps: boolean;
  hasCompletedSteps: boolean;
  urgentOnly: boolean;
}

const ProductionQueueView = () => {
  const { manufacturingOrders, isLoading } = useManufacturingOrders();
  const { manufacturingSteps, orderSteps } = useManufacturingSteps();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ProductionQueueFilters>({
    status: '',
    priority: '',
    productName: '',
    orderNumber: '',
    hasInProgressSteps: false,
    hasCompletedSteps: false,
    urgentOnly: false,
  });

  console.log('ProductionQueueView - Manufacturing Orders:', manufacturingOrders);
  console.log('ProductionQueueView - Manufacturing Steps:', manufacturingSteps);

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
      if (filters.orderNumber && !order.order_number.toLowerCase().includes(filters.orderNumber.toLowerCase())) return false;
      
      // Get order steps for this order
      const orderOrderSteps = orderSteps.filter(step => step.manufacturing_order_id === order.id);
      
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

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
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
          <ProductionQueueFilter onFiltersChange={setFilters} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 rounded-lg bg-muted/20">
          <div className="text-center">
            <Factory className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading production queue...</p>
          </div>
        </div>
      ) : (
        <ProductionFlowView
          manufacturingOrders={filteredOrders}
          onViewDetails={handleViewDetails}
        />
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
