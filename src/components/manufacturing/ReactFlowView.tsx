import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { ReactFlow, Node, Edge, Background, Controls, MiniMap, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useCreateManufacturingStep } from '@/hooks/useCreateManufacturingStep';
import ManufacturingStepCard, { StepCardData } from './ManufacturingStepCard';
import UpdateStepDialog from './UpdateStepDialog';
import ManufacturingOrderDetailsDialog from './ManufacturingOrderDetailsDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Factory, Package, Maximize, Minimize } from 'lucide-react';

// Custom node types
const nodeTypes = {
  manufacturingStep: ManufacturingStepCard,
};

interface ReactFlowViewProps {
  manufacturingOrders: ManufacturingOrder[];
  onViewDetails?: (order: ManufacturingOrder) => void;
  onStartNextStep?: (orderId: string) => void;
}

const ReactFlowView: React.FC<ReactFlowViewProps> = ({ 
  manufacturingOrders,
  onViewDetails,
  onStartNextStep 
}) => {
  const { manufacturingSteps, orderSteps, refetch: refetchSteps } = useManufacturingSteps();
  const { createStep, isCreating } = useCreateManufacturingStep();
  const [updateStepDialogOpen, setUpdateStepDialogOpen] = useState(false);
  const [orderDetailsDialogOpen, setOrderDetailsDialogOpen] = useState(false);
  const [selectedOrderStep, setSelectedOrderStep] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<ManufacturingOrder | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  console.log('ReactFlowView props:', {
    ordersCount: manufacturingOrders.length,
    hasOnStartNextStep: !!onStartNextStep
  });

  // Handle starting a new manufacturing step
  const handleStartNextStep = useCallback(async (orderId: string, stepName?: string, sourceInstanceNumber?: number) => {
    console.log('Starting next step for order:', orderId, 'step:', stepName, 'sourceInstance:', sourceInstanceNumber);
    
    // If no specific step name provided, determine the next step
    let nextStepName = stepName;
    if (!nextStepName) {
      // For Manufacturing Order cards, start with the first step (Jhalai)
      const firstStep = manufacturingSteps
        .filter(step => step.is_active)
        .sort((a, b) => a.step_order - b.step_order)[0];
      nextStepName = firstStep?.step_name;
    }

    if (!nextStepName) {
      console.error('No next step found');
      return;
    }

    // Find the parent instance ID if creating a child step
    let parentInstanceId = null;
    if (sourceInstanceNumber && stepName !== 'Jhalai') {
      const parentStepName = manufacturingSteps
        .filter(step => step.is_active)
        .sort((a, b) => a.step_order - b.step_order)
        .find(step => {
          const currentStepIndex = manufacturingSteps
            .filter(s => s.is_active)
            .sort((a, b) => a.step_order - b.step_order)
            .findIndex(s => s.step_name === nextStepName);
          const stepIndex = manufacturingSteps
            .filter(s => s.is_active)
            .sort((a, b) => a.step_order - b.step_order)
            .findIndex(s => s.step_name === step.step_name);
          return stepIndex === currentStepIndex - 1;
        })?.step_name;

      if (parentStepName) {
        const parentStep = orderSteps.find(step => 
          step.step_name === parentStepName && 
          step.instance_number === sourceInstanceNumber &&
          String(step.order_id) === String(orderId)
        );
        parentInstanceId = parentStep?.id;
      }
    }

    try {
      await createStep({
        manufacturingOrderId: orderId,
        stepName: nextStepName,
        fieldValues: {
          sourceInstanceNumber: sourceInstanceNumber,
          parent_instance_id: parentInstanceId // Pass the parent instance ID
        }
      });

      // Refresh the data to show the new step
      await refetchSteps();
    } catch (error) {
      console.error('Failed to start next step:', error);
    }
  }, [createStep, manufacturingSteps, refetchSteps, orderSteps]);

  // Combine the passed callback with our implementation
  const combinedStartNextStep = useCallback((orderId: string, stepName?: string, sourceInstanceNumber?: number) => {
    // Call our implementation first
    handleStartNextStep(orderId, stepName, sourceInstanceNumber);
    
    // Then call the passed callback if it exists
    if (onStartNextStep) {
      onStartNextStep(orderId);
    }
  }, [handleStartNextStep, onStartNextStep]);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Fixed layout constants for consistent positioning
    const CARD_WIDTH = 350;
    const CARD_HEIGHT = 200;
    const ORDER_Y_SPACING = 600;
    const STEP_Y_SPACING = 300;
    const INSTANCE_X_SPACING = 400;
    const START_X = 50;
    const START_Y = 50;

    const activeSteps = manufacturingSteps
      .filter(step => step.is_active)
      .sort((a, b) => a.step_order - b.step_order);

    manufacturingOrders.forEach((order, orderIndex) => {
      const orderY = START_Y + (orderIndex * ORDER_Y_SPACING);
      
      const thisOrderSteps = Array.isArray(orderSteps) 
        ? orderSteps.filter(step => String(step.order_id) === String(order.id))
        : [];

      // Create manufacturing order node
      const orderNodeData: StepCardData = {
        stepName: 'Manufacturing Order',
        stepOrder: 0,
        orderId: order.id,
        orderNumber: order.order_number,
        productName: order.product_name,
        status: order.status as any,
        progress: 0,
        productCode: order.product_configs?.product_code,
        quantityRequired: order.quantity_required,
        priority: order.priority,
        dueDate: order.due_date,
        isJhalaiStep: false,
      };

      const orderNode: Node = {
        id: `order-${order.id}`,
        type: 'manufacturingStep',
        position: { x: START_X, y: orderY },
        data: orderNodeData,
        style: { width: CARD_WIDTH, height: CARD_HEIGHT },
      };

      nodes.push(orderNode);

      // Process each step type
      activeSteps.forEach((step, stepIndex) => {
        const stepInstances = thisOrderSteps.filter(orderStep => orderStep.step_name === step.step_name);
        
        if (stepInstances.length === 0) {
          return;
        }

        // Sort instances by instance number
        stepInstances.sort((a, b) => (a.instance_number || 1) - (b.instance_number || 1));

        const stepY = orderY + ((stepIndex + 1) * STEP_Y_SPACING);

        // Position instances horizontally
        stepInstances.forEach((orderStep, instanceIndex) => {
          const instanceX = START_X + (instanceIndex * INSTANCE_X_SPACING);
          
          const stepNodeData: StepCardData = {
            stepName: step.step_name,
            stepOrder: step.step_order,
            orderId: order.id,
            orderNumber: order.order_number,
            productName: order.product_name,
            status: orderStep?.status as any || 'pending',
            progress: orderStep?.status === 'completed' ? 100 : orderStep?.status === 'in_progress' ? 50 : 0,
            assignedWorker: orderStep?.assigned_worker || undefined,
            productCode: order.product_configs?.product_code,
            quantityRequired: order.quantity_required,
            priority: order.priority,
            dueDate: orderStep?.due_date || order.due_date,
            isJhalaiStep: false,
            instanceNumber: orderStep?.instance_number || 1,
            orderStepData: orderStep,
          };

          const stepNodeId = `step-${order.id}-${step.id}-${orderStep.instance_number || 1}`;
          
          const stepNode: Node = {
            id: stepNodeId,
            type: 'manufacturingStep',
            position: { x: instanceX, y: stepY },
            data: stepNodeData,
            style: { width: CARD_WIDTH, height: CARD_HEIGHT },
          };

          nodes.push(stepNode);

          // Create edges
          let sourceNodeId: string;
          
          if (stepIndex === 0) {
            // First step connects to order
            sourceNodeId = `order-${order.id}`;
          } else {
            // Find parent step instance
            const previousStep = activeSteps[stepIndex - 1];
            let parentInstance = null;
            
            // Use parent_instance_id if available
            if (orderStep.parent_instance_id) {
              parentInstance = thisOrderSteps.find(inst => inst.id === orderStep.parent_instance_id);
            }
            
            // Fallback to notes-based or first available instance
            if (!parentInstance) {
              const previousStepInstances = thisOrderSteps.filter(inst => inst.step_name === previousStep.step_name);
              if (previousStepInstances.length > 0) {
                // Try to match by notes
                if (orderStep.notes && orderStep.notes.includes('Created from instance #')) {
                  const sourceInstanceNumber = parseInt(orderStep.notes.match(/Created from instance #(\d+)/)?.[1] || '1');
                  parentInstance = previousStepInstances.find(inst => inst.instance_number === sourceInstanceNumber);
                }
                
                // Final fallback to first instance
                if (!parentInstance) {
                  parentInstance = previousStepInstances[0];
                }
              }
            }
            
            if (parentInstance) {
              sourceNodeId = `step-${order.id}-${previousStep.id}-${parentInstance.instance_number || 1}`;
            } else {
              sourceNodeId = `order-${order.id}`;
            }
          }

          // Only create edge if source node exists
          const sourceExists = nodes.some(node => node.id === sourceNodeId) || sourceNodeId === `order-${order.id}`;
          
          if (sourceExists) {
            const edgeId = `edge-${sourceNodeId}-${stepNodeId}`;
            const isAnimated = orderStep?.status === 'in_progress';
            const strokeColor = orderStep?.status === 'completed' ? '#10b981' : 
                               orderStep?.status === 'in_progress' ? '#3b82f6' : '#9ca3af';

            edges.push({
              id: edgeId,
              source: sourceNodeId,
              target: stepNodeId,
              type: 'smoothstep',
              animated: isAnimated,
              style: {
                stroke: strokeColor,
                strokeWidth: 2,
              },
            });
          }
        });
      });
    });

    console.log('Generated nodes:', nodes.length, 'edges:', edges.length);
    return { nodes, edges };
  }, [manufacturingOrders, manufacturingSteps, orderSteps]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when data changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onStepClick = useCallback((stepData: StepCardData) => {
    console.log('Step clicked in ReactFlow:', stepData);
    
    if (stepData.stepName !== 'Manufacturing Order' && stepData.orderStepData) {
      setSelectedOrderStep(stepData.orderStepData);
      setUpdateStepDialogOpen(true);
    }
  }, []);

  const onOrderClick = useCallback((orderId: string) => {
    console.log('Order clicked in ReactFlow:', orderId);
    
    const order = manufacturingOrders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setOrderDetailsDialogOpen(true);
    }
  }, [manufacturingOrders]);

  const handleStepUpdate = async () => {
    await refetchSteps();
    setUpdateStepDialogOpen(false);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Update node data with callbacks
  const nodesWithCallbacks = useMemo(() => {
    console.log('Creating nodes with callbacks, onStartNextStep available:', !!combinedStartNextStep);
    
    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        manufacturingSteps,
        orderSteps,
        onStepClick,
        onOrderClick,
        onStartNextStep: combinedStartNextStep,
      },
    }));
  }, [nodes, manufacturingSteps, orderSteps, onStepClick, onOrderClick, combinedStartNextStep]);

  if (manufacturingOrders.length === 0) {
    return (
      <Card className="h-96">
        <CardContent className="flex flex-col items-center justify-center h-full">
          <Factory className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Manufacturing Orders</h3>
          <p className="text-gray-500 text-center">
            Create manufacturing orders to see the production flow visualization.
          </p>
        </CardContent>
      </Card>
    );
  }

  const containerClass = isFullScreen 
    ? "fixed inset-0 z-50 bg-white" 
    : "relative";
  const flowHeight = isFullScreen ? "100vh" : "800px";

  return (
    <>
      <div className={containerClass}>
        {/* Full screen header */}
        {isFullScreen && (
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullScreen}
              className="bg-white shadow-md"
            >
              <Minimize className="h-4 w-4 mr-2" />
              Exit Full Screen
            </Button>
          </div>
        )}
        
        {/* Normal view header */}
        {!isFullScreen && (
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Production Flow</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullScreen}
            >
              <Maximize className="h-4 w-4 mr-2" />
              Full Screen
            </Button>
          </div>
        )}

        <div className={`w-full border rounded-lg bg-gray-50 ${isFullScreen ? 'h-full' : ''}`} style={{ height: flowHeight }}>
          <ReactFlow
            nodes={nodesWithCallbacks}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>

      <UpdateStepDialog
        step={selectedOrderStep}
        open={updateStepDialogOpen}
        onOpenChange={setUpdateStepDialogOpen}
        onStepUpdate={handleStepUpdate}
      />

      <ManufacturingOrderDetailsDialog
        order={selectedOrder}
        open={orderDetailsDialogOpen}
        onOpenChange={setOrderDetailsDialogOpen}
        getPriorityColor={getPriorityColor}
        getStatusColor={getStatusColor}
      />
    </>
  );
};

export default ReactFlowView;
