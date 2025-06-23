
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, CheckCircle2, Factory, Users, Package, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';

const ProductionKanbanView = () => {
  const { manufacturingOrders, isLoading } = useManufacturingOrders();
  const { orderSteps } = useManufacturingSteps();

  const ordersByStatus = useMemo(() => {
    const orders = Array.isArray(manufacturingOrders) ? manufacturingOrders : [];
    
    const pending = orders.filter(order => order.status === 'pending');
    const inProgress = orders.filter(order => order.status === 'in_progress');
    const completed = orders.filter(order => order.status === 'completed');
    const cancelled = orders.filter(order => order.status === 'cancelled');

    return { pending, inProgress, completed, cancelled };
  }, [manufacturingOrders]);

  const getStepProgress = (orderId: string) => {
    const steps = Array.isArray(orderSteps) 
      ? orderSteps.filter(step => step.order_id === orderId)
      : [];
    
    if (steps.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = steps.filter(step => step.status === 'completed').length;
    const total = steps.length;
    const percentage = Math.round((completed / total) * 100);
    
    return { completed, total, percentage };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Factory className="h-4 w-4 text-blue-600" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const renderOrderCard = (order: any) => {
    const progress = getStepProgress(order.id);
    
    return (
      <Card key={order.id} className="mb-4 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">{order.product_name}</CardTitle>
              <p className="text-xs text-muted-foreground font-mono">{order.order_number}</p>
            </div>
            <Badge className={`text-xs ${getPriorityColor(order.priority)}`}>
              {order.priority}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Progress */}
          {progress.total > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{progress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {progress.completed} of {progress.total} steps
              </p>
            </div>
          )}
          
          {/* Order Details */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Package className="h-3 w-3 text-muted-foreground" />
              <span>{order.quantity_required}</span>
            </div>
            {order.due_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span>{format(new Date(order.due_date), 'MMM dd')}</span>
              </div>
            )}
          </div>
          
          {/* Product Code */}
          {order.product_configs?.product_code && (
            <div className="text-xs">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                {order.product_configs.product_code}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Factory className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading production data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Pending Column */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <Clock className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Pending</h3>
          <Badge variant="secondary">{ordersByStatus.pending.length}</Badge>
        </div>
        <div className="space-y-2">
          {ordersByStatus.pending.map(renderOrderCard)}
        </div>
      </div>

      {/* In Progress Column */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <Factory className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">In Progress</h3>
          <Badge variant="secondary">{ordersByStatus.inProgress.length}</Badge>
        </div>
        <div className="space-y-2">
          {ordersByStatus.inProgress.map(renderOrderCard)}
        </div>
      </div>

      {/* Completed Column */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-green-900">Completed</h3>
          <Badge variant="secondary">{ordersByStatus.completed.length}</Badge>
        </div>
        <div className="space-y-2">
          {ordersByStatus.completed.map(renderOrderCard)}
        </div>
      </div>

      {/* Cancelled Column */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h3 className="font-semibold text-red-900">Cancelled</h3>
          <Badge variant="secondary">{ordersByStatus.cancelled.length}</Badge>
        </div>
        <div className="space-y-2">
          {ordersByStatus.cancelled.map(renderOrderCard)}
        </div>
      </div>
    </div>
  );
};

export default ProductionKanbanView;
