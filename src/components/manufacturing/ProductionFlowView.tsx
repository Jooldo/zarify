
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Clock, 
  User, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Target,
  Calendar,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import CreateReworkOrderDialog from './CreateReworkOrderDialog';

interface ProductionFlowViewProps {
  manufacturingOrders: any[];
  onViewDetails: (order: any) => void;
}

const ProductionFlowView = ({ manufacturingOrders, onViewDetails }: ProductionFlowViewProps) => {
  const { manufacturingSteps, orderSteps } = useManufacturingSteps();
  const [reworkDialogOpen, setReworkDialogOpen] = useState(false);
  const [selectedOrderForRework, setSelectedOrderForRework] = useState<any>(null);

  const getOrderStepsForOrder = (orderId: string) => {
    return orderSteps.filter(step => String(step.manufacturing_order_id) === String(orderId));
  };

  const getStepProgress = (orderId: string) => {
    const steps = getOrderStepsForOrder(orderId);
    if (steps.length === 0) return { completed: 0, total: 0, inProgress: 0 };
    
    const completed = steps.filter(step => step.status === 'completed').length;
    const inProgress = steps.filter(step => step.status === 'in_progress').length;
    const total = steps.length;
    
    return { completed, total, inProgress };
  };

  const getCurrentStep = (orderId: string) => {
    const steps = getOrderStepsForOrder(orderId)
      .sort((a, b) => a.step_order - b.step_order);
    
    // Find first non-completed step or return last step if all completed
    const currentStep = steps.find(step => step.status !== 'completed') || steps[steps.length - 1];
    
    if (currentStep) {
      const manufacturingStep = manufacturingSteps.find(ms => ms.id === currentStep.manufacturing_step_id);
      return {
        ...currentStep,
        step_name: manufacturingStep?.step_name || 'Unknown Step'
      };
    }
    
    return null;
  };

  const getOrderStatus = (order: any) => {
    const progress = getStepProgress(order.id);
    
    if (order.status === 'pending_rework') {
      return { status: 'pending_rework', label: 'Pending Rework', color: 'bg-orange-100 text-orange-800' };
    }
    
    if (progress.total === 0) {
      return { status: 'not_started', label: 'Not Started', color: 'bg-gray-100 text-gray-800' };
    }
    
    if (progress.completed === progress.total) {
      return { status: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' };
    }
    
    if (progress.inProgress > 0) {
      return { status: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' };
    }
    
    return { status: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const handleCreateRework = (order: any) => {
    setSelectedOrderForRework(order);
    setReworkDialogOpen(true);
  };

  const isReworkOrder = (order: any) => {
    return order.parent_order_id !== null && order.parent_order_id !== undefined;
  };

  if (manufacturingOrders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Manufacturing Orders</h3>
        <p className="text-gray-500">No orders match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {manufacturingOrders.map((order) => {
          const progress = getStepProgress(order.id);
          const currentStep = getCurrentStep(order.id);
          const orderStatus = getOrderStatus(order);
          
          return (
            <Card key={order.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {isReworkOrder(order) && (
                      <RotateCcw className="h-5 w-5 text-orange-600" />
                    )}
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        {order.order_number}
                        {isReworkOrder(order) && (
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            Rework
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{order.product_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(order.priority)}>
                      {order.priority.toUpperCase()}
                    </Badge>
                    <Badge className={orderStatus.color}>
                      {orderStatus.label}
                    </Badge>
                  </div>
                </div>

                {/* Rework information */}
                {isReworkOrder(order) && order.rework_reason && (
                  <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-orange-700 mb-1">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium text-sm">Rework Reason</span>
                    </div>
                    <p className="text-sm text-orange-600">{order.rework_reason}</p>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold">{order.quantity_required}</span>
                  </div>
                  
                  {order.due_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Due:</span>
                      <span className="font-semibold">
                        {new Date(order.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Created:</span>
                    <span className="font-semibold">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-600">
                      {progress.completed}/{progress.total} steps completed
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Current Step */}
                {currentStep && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {currentStep.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : currentStep.status === 'in_progress' ? (
                          <Play className="h-4 w-4 text-blue-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                        )}
                        <span className="font-medium text-sm">
                          Current Step: {currentStep.step_name}
                        </span>
                      </div>
                      
                      {currentStep.workers?.name && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <User className="h-3 w-3" />
                          {currentStep.workers.name}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(order)}
                  >
                    View Details
                  </Button>
                  
                  {/* Rework Button - show for completed orders that aren't already rework orders */}
                  {orderStatus.status === 'completed' && !isReworkOrder(order) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                      onClick={() => handleCreateRework(order)}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Create Rework
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Rework Dialog */}
      <CreateReworkOrderDialog
        isOpen={reworkDialogOpen}
        onClose={() => {
          setReworkDialogOpen(false);
          setSelectedOrderForRework(null);
        }}
        originalOrder={selectedOrderForRework}
      />
    </div>
  );
};

export default ProductionFlowView;
