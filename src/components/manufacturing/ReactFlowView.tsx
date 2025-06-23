
import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { ReactFlow, Node, Edge, Background, Controls, MiniMap, useNodesState, useEdgesState, MarkerType } from '@xyflow/react';
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

// Visual style configurations for different step types
const getStepVisualStyle = (stepName: string, stepOrder: number, isOrderCard: boolean) => {
  if (isOrderCard) {
    return {
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-50',
      headerBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      accentColor: '#3b82f6'
    };
  }

  const stepStyles = {
    'Jhalai': {
      borderColor: 'border-emerald-500',
      bgColor: 'bg-emerald-50',
      headerBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      accentColor: '#10b981'
    },
    'Dhol': {
      borderColor: 'border-purple-500',
      bgColor: 'bg-purple-50',
      headerBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      accentColor: '#8b5cf6'
    },
    'Casting': {
      borderColor: 'border-amber-500',
      bgColor: 'bg-amber-50',
      headerBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      accentColor: '#f59e0b'
    }
  };

  return stepStyles[stepName as keyof typeof stepStyles] || {
    borderColor: 'border-gray-500',
    bgColor: 'bg-gray-50',
    headerBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    accentColor: '#6b7280'
  };
};

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
    
    // Layout constants
    const ORDER_SPACING = 1200;
    const VERTICAL_SPACING = 300;
    const PARALLEL_INSTANCE_SPACING = 650;
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

      // Create manufacturing order node with visual styling
      const orderVisualStyle = getStepVisualStyle('Manufacturing Order', 0, true);
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
        visualStyle: orderVisualStyle,
        isOrderCard: true,
      };

      const orderNode: Node = {
        id: `order-${order.id}`,
        type: 'manufacturingStep',
        position: { x: 100, y: orderY },
        data: orderNodeData,
        style: { width: CARD_WIDTH, height: CARD_HEIGHT },
      };

      nodes.push(orderNode);

      // Create step nodes with improved ordering and visual differentiation
      let currentY = orderY + VERTICAL_SPACING;
      
      const activeSteps = manufacturingSteps
        .filter(step => step.is_active)
        .sort((a, b) => a.step_order - b.step_order);

      activeSteps.forEach((step, stepIndex) => {
        const stepInstances = stepsByName[step.step_name] || [];
        
        if (stepInstances.length === 0) {
          return;
        }

        // Enhanced ordering logic with parent relationship grouping
        let orderedInstances;
        let instanceGroups: any[][] = [];
        
        if (stepIndex === 0) {
          // First step: just sort by instance number
          orderedInstances = stepInstances.sort((a, b) => (a.instance_number || 1) - (b.instance_number || 1));
        } else {
          // Subsequent steps: group by source instance relationship
          const previousStep = activeSteps[stepIndex - 1];
          const previousInstances = stepsByName[previousStep.step_name] || [];
          
          // Create groups based on source relationship
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

        // Calculate positions for instances with same spacing
        const instanceCount = orderedInstances.length;
        const totalWidth = (instanceCount - 1) * PARALLEL_INSTANCE_SPACING;
        const startX = 100 + (instanceCount > 1 ? -totalWidth / 2 : 0);

        // Get visual style for this step type
        const stepVisualStyle = getStepVisualStyle(step.step_name, step.step_order, false);

        orderedInstances.forEach((orderStep, instanceIndex) => {
          const instanceX = startX + (instanceIndex * PARALLEL_INSTANCE_SPACING);
          
          // Determine if this instance is part of a group (has siblings from same parent)
          const isPartOfGroup = instanceCount > 1;
          const groupIndex = Math.floor(instanceIndex / Math.max(1, instanceCount / Math.max(1, instanceGroups.length)));
          
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
            visualStyle: stepVisualStyle,
            isPartOfGroup,
            groupIndex,
            isOrderCard: false,
          };

          const stepNode: Node = {
            id: `step-${order.id}-${step.id}-${orderStep.instance_number || 1}`,
            type: 'manufacturingStep',
            position: { x: instanceX, y: currentY },
            data: stepNodeData,
            style: { width: CARD_WIDTH, height: CARD_HEIGHT },
          };

          nodes.push(stepNode);

          // Enhanced edge creation with visual styling
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
          
          // Enhanced edge styling based on step type and status
          let strokeColor = stepVisualStyle.accentColor;
          let strokeWidth = 2;
          
          switch (orderStep?.status) {
            case 'completed':
              strokeColor = '#10b981'; // Green for completed
              strokeWidth = 3;
              break;
            case 'in_progress':
              strokeColor = stepVisualStyle.accentColor;
              strokeWidth = 3;
              break;
            case 'pending':
            default:
              strokeColor = '#9ca3af'; // Gray for pending
              strokeWidth = 2;
              break;
          }

          edges.push({
            id: edgeId,
            source: sourceNodeId,
            target: stepNode.id,
            type: 'smoothstep',
            animated: isAnimated,
            style: {
              stroke: strokeColor,
              strokeWidth,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: strokeColor,
            },
          });
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
