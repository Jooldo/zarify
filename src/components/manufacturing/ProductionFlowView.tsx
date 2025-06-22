import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Package, Hash, Eye, GitBranch } from 'lucide-react';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import CreateChildOrderDialog from './CreateChildOrderDialog';
import ReworkOrderDetailsDialog from './ReworkOrderDetailsDialog';

interface ProductionFlowViewProps {
  manufacturingOrders: any[];
  onViewDetails: (order: any) => void;
}

const ProductionFlowView = ({ manufacturingOrders, onViewDetails }: ProductionFlowViewProps) => {
  const { manufacturingSteps, orderSteps } = useManufacturingSteps();
  const [selectedOrderForChild, setSelectedOrderForChild] = useState<any>(null);
  const [selectedStepForChild, setSelectedStepForChild] = useState<any>(null);
  const [childOrderDialogOpen, setChildOrderDialogOpen] = useState(false);
  const [reworkOrderDialogOpen, setReworkOrderDialogOpen] = useState(false);
  const [selectedReworkOrder, setSelectedReworkOrder] = useState<any>(null);

  const activeSteps = useMemo(() => {
    return manufacturingSteps
      .filter(step => step.is_active)
      .sort((a, b) => a.step_order - b.step_order);
  }, [manufacturingSteps]);

  const ordersByStep = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    
    activeSteps.forEach(step => {
      grouped[step.id] = [];
    });

    console.log('Processing manufacturing orders:', manufacturingOrders.length);
    console.log('Available order steps:', orderSteps.length);

    manufacturingOrders.forEach(order => {
      console.log(`Processing order ${order.order_number}:`, {
        id: order.id,
        isChild: Boolean(order.parent_order_id),
        assignedToStep: order.assigned_to_step
      });

      const orderOrderSteps = orderSteps.filter(step => 
        String(step.manufacturing_order_id) === String(order.id)
      );

      console.log(`Found ${orderOrderSteps.length} order steps for order ${order.order_number}`);

      // Handle child orders (rework orders) differently
      if (order.parent_order_id && order.assigned_to_step) {
        // This is a child/rework order - place it in the assigned step
        const assignedStep = activeSteps.find(step => step.step_order === order.assigned_to_step);
        if (assignedStep) {
          console.log(`Placing child order ${order.order_number} in step ${assignedStep.step_name}`);
          grouped[assignedStep.id].push({
            ...order,
            currentStep: null,
            stepStatus: 'pending',
            isChildOrder: true,
            parentOrderNumber: order.special_instructions?.split(' - ')[0]?.replace('Rework from ', ''),
            reworkFromStep: order.special_instructions?.split(' - Step ')[1]?.split(' ')[0]
          });
        }
        return; // Skip normal processing for child orders
      }

      // Normal processing for parent orders
      if (orderOrderSteps.length === 0) {
        // No steps created yet - place in first step
        if (activeSteps[0]) {
          console.log(`Placing order ${order.order_number} with no steps in first step`);
          grouped[activeSteps[0].id].push({
            ...order,
            currentStep: null,
            stepStatus: 'not_started',
            isChildOrder: false,
            parentOrderNumber: null,
            reworkFromStep: null
          });
        }
      } else {
        // Find the latest step for this order
        const sortedSteps = orderOrderSteps.sort((a, b) => b.step_order - a.step_order);
        const latestOrderStep = sortedSteps[0];

        if (latestOrderStep && latestOrderStep.manufacturing_step_id) {
          const stepId = latestOrderStep.manufacturing_step_id;
          
          if (!grouped[stepId]) {
            grouped[stepId] = [];
          }
          
          console.log(`Placing order ${order.order_number} in step based on latest order step`);
          grouped[stepId].push({
            ...order,
            currentStep: latestOrderStep,
            stepStatus: latestOrderStep.status,
            assignedWorker: latestOrderStep.workers?.name,
            isChildOrder: false,
            parentOrderNumber: null,
            reworkFromStep: null
          });
        }
      }
    });

    // Log final grouping
    Object.keys(grouped).forEach(stepId => {
      const step = activeSteps.find(s => s.id === stepId);
      console.log(`Step ${step?.step_name}: ${grouped[stepId].length} orders`);
      grouped[stepId].forEach(order => {
        console.log(`  - ${order.order_number} (${order.isChildOrder ? 'child' : 'parent'})`);
      });
    });

    return grouped;
  }, [manufacturingOrders, orderSteps, activeSteps]);

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
      case 'pending':
      case 'not_started':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'partially_completed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCreateChildOrder = (order: any, step: any) => {
    setSelectedOrderForChild(order);
    setSelectedStepForChild(step);
    setChildOrderDialogOpen(true);
  };

  const handleChildOrderSuccess = () => {
    setSelectedOrderForChild(null);
    setSelectedStepForChild(null);
  };

  const handleViewDetails = (order: any) => {
    console.log('handleViewDetails called with:', { 
      orderNumber: order.order_number, 
      isChild: order.isChildOrder,
      parentId: order.parent_order_id 
    });
    
    if (order.isChildOrder || order.parent_order_id) {
      console.log('Opening rework dialog for:', order.order_number);
      setSelectedReworkOrder(order);
      setReworkOrderDialogOpen(true);
    } else {
      console.log('Opening regular dialog for:', order.order_number);
      onViewDetails(order);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-6 overflow-x-auto pb-6">
        {activeSteps.map((step) => (
          <div key={step.id} className="flex-shrink-0 w-80">
            <Card className="h-full bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-black">
                    {step.step_order}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">{step.step_name}</div>
                    <div className="text-xs text-gray-600 font-normal">Production Step</div>
                  </div>
                  <Badge variant="secondary" className="bg-white text-gray-700 font-semibold">
                    {ordersByStep[step.id]?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {ordersByStep[step.id]?.map((order) => (
                    <Card 
                      key={order.id} 
                      className={`bg-white shadow-sm hover:shadow-md transition-all duration-200 border ${
                        order.isChildOrder ? 'border-l-4 border-l-orange-400 bg-orange-50/30' : 'border-gray-200'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header with child order indicator */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {order.isChildOrder && (
                                <GitBranch className="h-4 w-4 text-orange-600" />
                              )}
                              <span className={`font-bold text-sm ${
                                order.isChildOrder ? 'text-orange-700' : 'text-blue-700'
                              }`}>
                                {order.order_number}
                              </span>
                              {order.isChildOrder && (
                                <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300">
                                  Rework
                                </Badge>
                              )}
                            </div>
                            <Badge className={`${getPriorityColor(order.priority)} shadow-sm`}>
                              {order.priority.toUpperCase()}
                            </Badge>
                          </div>

                          {/* Child order source info */}
                          {order.isChildOrder && order.parentOrderNumber && (
                            <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
                              <p className="text-xs text-orange-700">
                                <strong>From:</strong> {order.parentOrderNumber}
                                {order.reworkFromStep && ` (Step ${order.reworkFromStep})`}
                              </p>
                            </div>
                          )}

                          {/* Product Info */}
                          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Package className="h-4 w-4 text-emerald-600" />
                              <span className="font-semibold text-gray-800">{order.product_name}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Hash className="h-4 w-4" />
                              <span>Quantity: </span>
                              <span className="font-semibold text-gray-800">{order.quantity_required}</span>
                            </div>
                          </div>

                          {/* Worker Assignment */}
                          {order.assignedWorker && (
                            <div className="flex items-center gap-2 text-sm bg-blue-50 rounded-lg p-2">
                              <User className="h-4 w-4 text-blue-600" />
                              <span className="text-gray-600">Assigned to:</span>
                              <span className="font-semibold text-blue-700">{order.assignedWorker}</span>
                            </div>
                          )}

                          {/* Status & Timeline */}
                          <div className="flex items-center justify-between">
                            <Badge className={`${getStatusColor(order.stepStatus)} border shadow-sm`}>
                              {order.stepStatus === 'not_started' ? 'Not Started' : 
                               order.stepStatus === 'in_progress' ? 'In Progress' : 
                               order.stepStatus === 'partially_completed' ? 'Partial (QC Failed)' :
                               order.stepStatus.replace('_', ' ').toUpperCase()}
                            </Badge>
                            
                            {order.currentStep?.started_at && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 rounded px-2 py-1">
                                <Clock className="h-3 w-3" />
                                {new Date(order.currentStep.started_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleViewDetails(order)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                            
                            {!order.isChildOrder && order.stepStatus === 'in_progress' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-orange-600 border-orange-300 hover:bg-orange-50"
                                onClick={() => handleCreateChildOrder(order, step)}
                              >
                                <GitBranch className="h-4 w-4 mr-1" />
                                Rework
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {ordersByStep[step.id]?.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <Package className="h-8 w-8 opacity-40" />
                      </div>
                      <p className="text-sm font-medium">No orders in this step</p>
                      <p className="text-xs text-gray-400 mt-1">Orders will appear here when assigned</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Create Child Order Dialog */}
      <CreateChildOrderDialog
        isOpen={childOrderDialogOpen}
        onClose={() => {
          setChildOrderDialogOpen(false);
          setSelectedOrderForChild(null);
          setSelectedStepForChild(null);
        }}
        parentOrder={selectedOrderForChild}
        currentStep={selectedStepForChild}
        onSuccess={handleChildOrderSuccess}
      />

      {/* Rework Order Details Dialog */}
      <ReworkOrderDetailsDialog
        order={selectedReworkOrder}
        open={reworkOrderDialogOpen}
        onOpenChange={(open) => {
          console.log('Rework dialog state change:', open);
          setReworkOrderDialogOpen(open);
          if (!open) {
            setSelectedReworkOrder(null);
          }
        }}
        getPriorityColor={getPriorityColor}
        getStatusColor={getStatusColor}
      />
    </div>
  );
};

export default ProductionFlowView;
