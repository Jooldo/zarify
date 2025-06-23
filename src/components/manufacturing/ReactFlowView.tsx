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
    
    // Tree layout constants for dynamic positioning
    const ORDER_SPACING = 1200;
    const BASE_VERTICAL_SPACING = 300;
    const INSTANCE_HORIZONTAL_SPACING = 600; // Base spacing between instances
    const CARD_WIDTH = 500;
    const CARD_HEIGHT = 200;
    const START_Y = 80;

    manufacturingOrders.forEach((order, orderIndex) => {
      const orderY = START_Y + (orderIndex * ORDER_SPACING);
      
      const thisOrderSteps = Array.isArray(orderSteps) 
        ? orderSteps.filter(step => String(step.order_id) === String(order.id))
        : [];

      // Group order steps by step name
      const stepsByName = thisOrderSteps.reduce((acc, step) => {
        if (!acc[step.step_name]) {
          acc[step.step_name] = [];
        }
        acc[step.step_name].push(step);
        return acc;
      }, {} as Record<string, any[]>);

      const activeSteps = manufacturingSteps
        .filter(step => step.is_active)
        .sort((a, b) => a.step_order - b.step_order);

      // First pass: Calculate positions for all step instances
      const stepPositions = new Map<string, { instances: any[], centerX: number, y: number }>();
      
      activeSteps.forEach((step, stepIndex) => {
        const stepInstances = stepsByName[step.step_name] || [];
        
        if (stepInstances.length === 0) {
          return;
        }

        // Enhanced ordering logic for instances
        let orderedInstances;
        
        if (stepIndex === 0) {
          // First step: just sort by instance number
          orderedInstances = stepInstances.sort((a, b) => (a.instance_number || 1) - (b.instance_number || 1));
        } else {
          // Subsequent steps: group by source instance relationship
          const previousStep = activeSteps[stepIndex - 1];
          const previousInstances = stepsByName[previousStep.step_name] || [];
          
          // Create groups based on source relationship
          const instanceGroups: any[][] = [];
          const ungroupedInstances: any[] = [];
          
          // For each previous instance, find its children in current step
          previousInstances
            .sort((a, b) => (a.instance_number || 1) - (b.instance_number || 1))
            .forEach(prevInstance => {
              const children = stepInstances.filter(currentInstance => {
                // Check if this instance was created from the previous instance
                if (currentInstance.notes && currentInstance.notes.includes('Created from instance #')) {
                  const sourceInstanceNumber = parseInt(currentInstance.notes.match(/Created from instance #(\d+)/)?.[1] || '0');
                  return sourceInstanceNumber === (prevInstance.instance_number || 1);
                }
                return false;
              });
              
              if (children.length > 0) {
                // Sort children by instance number
                children.sort((a, b) => (a.instance_number || 1) - (b.instance_number || 1));
                instanceGroups.push(children);
              }
            });
          
          // Find instances without clear parent relationship
          stepInstances.forEach(instance => {
            const hasParent = instanceGroups.some(group => 
              group.some(child => child.id === instance.id)
            );
            if (!hasParent) {
              ungroupedInstances.push(instance);
            }
          });
          
          // Combine grouped and ungrouped instances
          orderedInstances = [
            ...instanceGroups.flat(),
            ...ungroupedInstances.sort((a, b) => (a.instance_number || 1) - (b.instance_number || 1))
          ];
        }

        // Calculate positions for this step's instances
        const instanceCount = orderedInstances.length;
        const totalWidth = (instanceCount - 1) * INSTANCE_HORIZONTAL_SPACING;
        
        // For tree-like layout, we'll calculate the center position based on children
        let centerX: number;
        
        if (stepIndex === 0) {
          // First step positions based on order card center
          centerX = 100 + (CARD_WIDTH / 2);
        } else {
          // For subsequent steps, center based on parent positions
          const previousStep = activeSteps[stepIndex - 1];
          const previousPositions = stepPositions.get(previousStep.step_name);
          
          if (previousPositions) {
            centerX = previousPositions.centerX;
          } else {
            centerX = 100 + (CARD_WIDTH / 2);
          }
        }

        const currentY = orderY + BASE_VERTICAL_SPACING + (stepIndex * BASE_VERTICAL_SPACING);
        
        stepPositions.set(step.step_name, {
          instances: orderedInstances,
          centerX,
          y: currentY
        });
      });

      // Second pass: Adjust parent positions based on children and create nodes
      const adjustedPositions = new Map<string, { centerX: number, y: number }>();
      
      // Work backwards from the last step to adjust parent positions
      for (let stepIndex = activeSteps.length - 1; stepIndex >= 0; stepIndex--) {
        const step = activeSteps[stepIndex];
        const stepData = stepPositions.get(step.step_name);
        
        if (!stepData) continue;

        let finalCenterX = stepData.centerX;

        // If this step has children, adjust position based on children's center
        if (stepIndex < activeSteps.length - 1) {
          const nextStep = activeSteps[stepIndex + 1];
          const childrenData = stepPositions.get(nextStep.step_name);
          
          if (childrenData && childrenData.instances.length > 0) {
            // Calculate center of children that are connected to this step
            const connectedChildren = childrenData.instances.filter(childInstance => {
              if (childInstance.notes && childInstance.notes.includes('Created from instance #')) {
                const sourceInstanceNumber = parseInt(childInstance.notes.match(/Created from instance #(\d+)/)?.[1] || '0');
                return stepData.instances.some(parentInstance => parentInstance.instance_number === sourceInstanceNumber);
              }
              return false;
            });

            if (connectedChildren.length > 0) {
              const childrenSpacing = (connectedChildren.length - 1) * INSTANCE_HORIZONTAL_SPACING;
              const childrenCenterX = childrenData.centerX;
              finalCenterX = childrenCenterX;
            }
          }
        }

        adjustedPositions.set(step.step_name, {
          centerX: finalCenterX,
          y: stepData.y
        });

        // Update the stepPositions with the adjusted center
        stepPositions.set(step.step_name, {
          ...stepData,
          centerX: finalCenterX
        });
      }

      // Create order node (positioned to align with first step)
      const firstStepData = stepPositions.get(activeSteps[0]?.step_name);
      const orderX = firstStepData ? firstStepData.centerX - (CARD_WIDTH / 2) : 100;

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
        position: { x: orderX, y: orderY },
        data: orderNodeData,
        style: { width: CARD_WIDTH, height: CARD_HEIGHT },
      };

      nodes.push(orderNode);

      // Create step nodes using calculated positions
      activeSteps.forEach((step, stepIndex) => {
        const stepData = stepPositions.get(step.step_name);
        
        if (!stepData) return;

        const instanceCount = stepData.instances.length;
        const totalWidth = (instanceCount - 1) * INSTANCE_HORIZONTAL_SPACING;
        const startX = stepData.centerX - (totalWidth / 2);

        stepData.instances.forEach((orderStep, instanceIndex) => {
          const instanceX = startX + (instanceIndex * INSTANCE_HORIZONTAL_SPACING);
          
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
            position: { x: instanceX, y: stepData.y },
            data: stepNodeData,
            style: { width: CARD_WIDTH, height: CARD_HEIGHT },
          };

          nodes.push(stepNode);

          // Create edges with improved routing
          let sourceNodeId: string;
          
          if (stepIndex === 0) {
            sourceNodeId = `order-${order.id}`;
          } else {
            const previousStep = activeSteps[stepIndex - 1];
            const previousInstances = stepsByName[previousStep.step_name] || [];
            
            if (previousInstances.length > 0) {
              let sourceInstance = null;
              if (orderStep.notes && orderStep.notes.includes('Created from instance #')) {
                const sourceInstanceNumber = parseInt(orderStep.notes.match(/Created from instance #(\d+)/)?.[1] || '1');
                sourceInstance = previousInstances.find(inst => inst.instance_number === sourceInstanceNumber);
              }
              
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
