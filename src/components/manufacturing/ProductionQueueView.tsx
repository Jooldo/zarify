
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Factory } from 'lucide-react';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import ManufacturingOrderDetailsDialog from './ManufacturingOrderDetailsDialog';
import ProductionFlowView from './ProductionFlowView';

const ProductionQueueView = () => {
  const { manufacturingOrders, isLoading } = useManufacturingOrders();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

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
      case 'qc_failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Factory className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading production queue...</p>
        </div>
      </div>
    );
  }

  const pendingOrders = manufacturingOrders.filter(order => order.status === 'pending');
  const inProgressOrders = manufacturingOrders.filter(order => order.status === 'in_progress');
  const completedOrders = manufacturingOrders.filter(order => order.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Factory className="h-6 w-6" />
            Production Queue
          </h2>
          <p className="text-muted-foreground">
            Manage and track manufacturing orders through production stages
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            {pendingOrders.length} Pending
          </Badge>
          <Badge variant="outline">
            {inProgressOrders.length} In Progress
          </Badge>
          <Badge variant="outline">
            {completedOrders.length} Completed
          </Badge>
        </div>
      </div>

      {/* Production Flow View */}
      <ProductionFlowView />

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
