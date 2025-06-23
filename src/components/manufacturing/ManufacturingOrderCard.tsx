import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Package, AlertTriangle, CheckCircle2, Clock, User, Factory, Play } from 'lucide-react';
import { format } from 'date-fns';
import { ManufacturingOrder } from '@/types/manufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import ManufacturingOrderDetailsDialog from './ManufacturingOrderDetailsDialog';
import StepSummaryTable from './StepSummaryTable';

interface ManufacturingOrderCardProps {
  order: ManufacturingOrder;
  onStatusUpdate?: (orderId: string, status: ManufacturingOrder['status']) => void;
  onDelete?: (orderId: string) => void;
  onStartNextStep?: (orderId: string) => void;
}

const ManufacturingOrderCard: React.FC<ManufacturingOrderCardProps> = ({
  order,
  onStatusUpdate,
  onDelete,
  onStartNextStep
}) => {
  const { manufacturingSteps, orderSteps } = useManufacturingSteps();
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Get order steps for this specific order using order_id
  const thisOrderSteps = Array.isArray(orderSteps) 
    ? orderSteps.filter(step => step.order_id === order.id)
    : [];

  // Calculate progress
  const completedSteps = thisOrderSteps.filter(step => step.status === 'completed').length;
  const totalSteps = thisOrderSteps.length;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Get current step (latest created step that's in progress)
  const currentStep = thisOrderSteps
    .filter(step => step.status === 'in_progress')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  // Simplified: Manufacturing Order cards always show "Start Jhalai" (first step)
  const getNextStep = () => {
    const firstStep = manufacturingSteps
      .filter(step => step.is_active)
      .sort((a, b) => a.step_order - b.step_order)[0];
    
    return firstStep;
  };

  const nextStep = getNextStep();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'in_progress': return <Factory className="h-4 w-4" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const handleStartNextStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStartNextStep) {
      onStartNextStep(order.id);
    }
  };

  const handleCardClick = () => {
    setDetailsOpen(true);
  };

  const handleViewDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDetailsOpen(true);
  };

  return (
    <>
      <Card 
        className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500"
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {order.product_configs?.product_code || order.product_name}
              </CardTitle>
              <p className="text-sm text-gray-600 font-mono">{order.order_number}</p>
              <p className="text-sm text-gray-500">Qty: {order.quantity_required}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={getPriorityColor(order.priority)}>
                {order.priority}
              </Badge>
              <Badge className={getStatusColor(order.status)}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(order.status)}
                  {order.status.replace('_', ' ')}
                </div>
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {totalSteps > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{completedSteps} of {totalSteps} steps completed</span>
                {currentStep && (
                  <span>Current: {currentStep.step_name}</span>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-gray-600">Quantity</p>
                <p className="font-semibold">{order.quantity_required}</p>
              </div>
            </div>

            {order.due_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-gray-600">Due Date</p>
                  <p className="font-semibold">{format(new Date(order.due_date), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            )}
          </div>

          {order.special_instructions && (
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <span className="font-medium">Instructions:</span> {order.special_instructions}
              </p>
            </div>
          )}

          {/* Step Summary Table */}
          <StepSummaryTable order={order} />

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleViewDetailsClick}
              className="flex-1"
            >
              View Details
            </Button>
            {nextStep && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleStartNextStep}
                className="flex items-center gap-1"
              >
                <Play className="h-3 w-3" />
                Start {nextStep.step_name}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <ManufacturingOrderDetailsDialog
        order={order}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        getPriorityColor={getPriorityColor}
        getStatusColor={getStatusColor}
        onStatusUpdate={onStatusUpdate}
      />
    </>
  );
};

export default ManufacturingOrderCard;
