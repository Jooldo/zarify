
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ManufacturingOrder } from '@/types/manufacturingOrders';
import ProductionFlowView from './ProductionFlowView';
import { Badge } from '@/components/ui/badge';

interface FullPageProductionFlowProps {
  order: ManufacturingOrder;
  onBack: () => void;
}

const FullPageProductionFlow: React.FC<FullPageProductionFlowProps> = ({
  order,
  onBack
}) => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Orders
              </Button>
              
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold">Production Flow</h1>
                <div className="text-sm text-muted-foreground">•</div>
                <span className="text-lg font-medium">{order.product_name}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge className={`${getPriorityColor(order.priority)}`}>
                {order.priority}
              </Badge>
              <Badge className={`${getStatusColor(order.status)}`}>
                {order.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {/* Order Details */}
          <div className="flex items-center gap-6 mt-3 text-sm text-muted-foreground">
            <span className="font-mono">{order.order_number}</span>
            <div className="flex items-center gap-2">
              <Package2 className="h-4 w-4" />
              <span>Qty: {order.quantity_required}</span>
            </div>
            {order.due_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Due: {format(new Date(order.due_date), 'MMM dd, yyyy')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Production Flow Content */}
      <div className="p-6">
        <div className="h-[calc(100vh-200px)]">
          <ProductionFlowView
            manufacturingOrders={[order]}
            onViewDetails={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default FullPageProductionFlow;
