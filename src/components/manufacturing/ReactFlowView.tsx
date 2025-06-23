
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

    try {
      await createStep({
        manufacturingOrderId: orderId,
        stepName: nextStepName,
        fieldValues: {
          sourceInstanceNumber: sourceInstanceNumber // Pass the source instance for proper tracking
        }
      });

      // Refresh the data to show the new step
      await refetchSteps();
    } catch (error) {
      console.error('Failed to start next step:', error);
    }
  }, [createStep, manufacturingSteps, refetchSteps]);

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
    
    // Updated spacing for better layout with source-based grouping
    const ORDER_SPACING = 1200;
    const VERTICAL_SPACING = 300;
    const SOURCE_GROUP_SPACING = 650; // Spacing between different source groups
    const SAME_SOURCE_SPACING = 350; // Spacing between instances from same source
    const CARD_WIDTH = 500;
    const CARD_HEIGHT = 240;
    const START_Y = 80;

    manufacturingOrders.forEach((order, orderIndex) => {
      const orderY = START_Y + (orderIndex * ORDER_SPACING);
      
      const thisOrderSteps = Array.isArray(orderSteps) 
        ? orderSteps.filter(step => String(step.order_id) === String(order.id))
        : [];

      // Group order steps by step name and then by source instance
      const stepsByName = thisOrderSteps.reduce((acc, step) => {
        if (!acc[step.step_name]) {
          acc[step.step_name] = [];
        }
        acc[step.step_name].push(step);
        return acc;
      }, {} as Record<string, any[]>);

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
        position: { x: 100, y: orderY },
        data: orderNodeData,
        style: { width: CARD_WIDTH, height: CARD_HEIGHT },
      };

      nodes.push(orderNode);

      // Create step nodes with source-based grouping
      let currentY = orderY + VERTICAL_SPACING;
      
      const activeSteps = manufacturingSteps
        .filter(step => step.is_active)
        .sort((a, b) => a.step_order - b.step_order);

      activeSteps.forEach((step, stepIndex) => {
        const stepInstances = stepsByName[step.step_name] || [];
        
        if (stepInstances.length === 0) {
          return;
        }

        // Group instances by their source instance number (extracted from notes)
        const instancesBySource = stepInstances.reduce((acc, orderStep) => {
          let sourceInstance = 'order'; // Default source is the manufacturing order
          
          // Extract source instance from notes if available
          if (orderStep.notes && orderStep.notes.includes('Created from instance #')) {
            const sourceInstanceNumber = orderStep.notes.match(/Created from instance #(\d+)/)?.[1];
            if (sourceInstanceNumber) {
              sourceInstance = `instance-${sourceInstanceNumber}`;
            }
          }
          
          if (!acc[sourceInstance]) {
            acc[sourceInstance] = [];
          }
          acc[sourceInstance].push(orderStep);
          return acc;
        }, {} as Record<string, any[]>);

        // Sort each source group by instance number
        Object.keys(instancesBySource).forEach(sourceKey => {
          instancesBySource[sourceKey].sort((a, b) => (a.instance_number || 1) - (b.instance_number || 1));
        });

        // Calculate positions for source groups
        const sourceGroups = Object.keys(instancesBySource).sort();
        let currentX = 100;

        sourceGroups.forEach((sourceKey, sourceIndex) => {
          const sourceInstances = instancesBySource[sourceKey];
          
          sourceInstances.forEach((orderStep, instanceIndex) => {
            const instanceX = currentX + (instanceIndex * SAME_SOURCE_SPACING);
            
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

            const stepNode: Node = {
              id: `step-${order.id}-${step.id}-${orderStep.instance_number || 1}`,
              type: 'manufacturingStep',
              position: { x: instanceX, y: currentY },
              data: stepNodeData,
              style: { width: CARD_WIDTH, height: CARD_HEIGHT },
            };

            nodes.push(stepNode);

            // Enhanced edge creation with proper source tracking
            let sourceNodeId: string;
            
            if (stepIndex === 0) {
              // First step connects to manufacturing order
              sourceNodeId = `order-${order.id}`;
            } else {
              // Connect to the specific source instance
              const previousStep = activeSteps[stepIndex - 1];
              const previousInstances = stepsByName[previousStep.step_name] || [];
              
              if (previousInstances.length > 0) {
                let sourceInstance = null;
                
                // Try to find the source instance from notes
                if (orderStep.notes && orderStep.notes.includes('Created from instance #')) {
                  const sourceInstanceNumber = parseInt(orderStep.notes.match(/Created from instance #(\d+)/)?.[1] || '1');
                  sourceInstance = previousInstances.find(inst => inst.instance_number === sourceInstanceNumber);
                }
                
                // Fallback to most recent completed instance if no specific source found
                if (!sourceInstance) {
                  const sortedPreviousInstances = previousInstances
                    .filter(inst => inst.status === 'completed' || inst.status === 'in_progress')
                    .sort((a, b) => {
                      if (a.status === 'completed' && b.status !== 'completed') return -1;
                      if (b.status === 'completed' && a.status !== 'completed') return 1;
                      if (a.completed_at && b.completed_at) {
                        return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
                      }
                      return (b.instance_number || 1) - (a.instance_number || 1);
                    });
                  
                  sourceInstance = sortedPreviousInstances[0] || previousInstances[0];
                }
                
                sourceNodeId = `step-${order.id}-${previousStep.id}-${sourceInstance.instance_number || 1}`;
              } else {
                sourceNodeId = `order-${order.id}`;
              }
            }

            // Create edge with proper styling
            const edgeId = `edge-${sourceNodeId}-${stepNode.id}`;
            const isAnimated = orderStep?.status === 'in_progress';
            const strokeColor = orderStep?.status === 'completed' ? '#10b981' : 
                               orderStep?.status === 'in_progress' ? '#3b82f6' : '#9ca3af';

            edges.push({
              id: edgeId,
              source: sourceNodeId,
              target: stepNode.id,
              type: 'smoothstep',
              animated: isAnimated,
              style: {
                stroke: strokeColor,
                strokeWidth: 2,
              },
            });
          });

          // Move to next source group position
          currentX += (sourceInstances.length * SAME_SOURCE_SPACING) + SOURCE_GROUP_SPACING;
        });

        currentY += VERTICAL_SPACING;
      });
    });

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
        getPriorityColor={(priority: string) => {
          switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
          }
        }}
        getStatusColor={(status: string) => {
          switch (status) {
            case 'pending': return 'bg-gray-100 text-gray-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
          }
        }}
      />
    </>
  );
};

export default ReactFlowView;
