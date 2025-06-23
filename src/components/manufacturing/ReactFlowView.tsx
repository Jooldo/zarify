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
import { calculateHierarchicalLayout, DEFAULT_LAYOUT_CONFIG } from '@/utils/hierarchicalLayoutUtils';

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

  // Get step color based on step name for connector coherence
  const getStepColor = (stepName: string) => {
    const stepColors = {
      'Jhalai': '#f97316', // orange
      'Dhol': '#a855f7',   // purple
      'Casting': '#10b981' // green
    };
    return stepColors[stepName as keyof typeof stepColors] || '#6b7280';
  };

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    const activeSteps = manufacturingSteps
      .filter(step => step.is_active)
      .sort((a, b) => a.step_order - b.step_order);

    manufacturingOrders.forEach((order, orderIndex) => {
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
        cardType: 'order',
      };

      const orderNode: Node = {
        id: `order-${order.id}`,
        type: 'manufacturingStep',
        position: { x: 0, y: 0 }, // Will be positioned by layout algorithm
        data: orderNodeData,
        style: { width: DEFAULT_LAYOUT_CONFIG.nodeWidth, height: DEFAULT_LAYOUT_CONFIG.nodeHeight },
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

        // Create nodes for each instance
        stepInstances.forEach((orderStep, instanceIndex) => {
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
            cardType: 'step',
          };

          const stepNodeId = `step-${order.id}-${step.id}-${orderStep.instance_number || 1}`;
          
          const stepNode: Node = {
            id: stepNodeId,
            type: 'manufacturingStep',
            position: { x: 0, y: 0 }, // Will be positioned by layout algorithm
            data: stepNodeData,
            style: { width: DEFAULT_LAYOUT_CONFIG.nodeWidth, height: DEFAULT_LAYOUT_CONFIG.nodeHeight },
          };

          nodes.push(stepNode);

          // Create edges with hierarchical relationships and L-shaped connectors
          let sourceNodeId: string;
          
          if (stepIndex === 0) {
            // First step connects to order
            sourceNodeId = `order-${order.id}`;
          } else {
            // Find parent step instance using parent_instance_id
            const previousStep = activeSteps[stepIndex - 1];
            let parentInstance = null;
            
            // Use parent_instance_id if available
            if (orderStep.parent_instance_id) {
              parentInstance = thisOrderSteps.find(inst => inst.id === orderStep.parent_instance_id);
            }
            
            // Fallback to first available instance of previous step
            if (!parentInstance) {
              const previousStepInstances = thisOrderSteps.filter(inst => inst.step_name === previousStep.step_name);
              if (previousStepInstances.length > 0) {
                parentInstance = previousStepInstances[0];
              }
            }
            
            if (parentInstance) {
              sourceNodeId = `step-${order.id}-${previousStep.id}-${parentInstance.instance_number || 1}`;
            } else {
              sourceNodeId = `order-${order.id}`;
            }
          }

          // Create edge with L-shaped/step styling
          const edgeId = `edge-${sourceNodeId}-${stepNodeId}`;
          const isAnimated = orderStep?.status === 'in_progress';
          
          // Step-coherent edge styling
          const baseColor = getStepColor(step.step_name);
          let strokeColor = baseColor;
          let strokeWidth = 3;
          let strokeDasharray = undefined;
          
          switch (orderStep?.status) {
            case 'completed':
              strokeColor = baseColor;
              strokeWidth = 4;
              break;
            case 'in_progress':
              strokeColor = baseColor;
              strokeWidth = 3;
              break;
            case 'blocked':
              strokeColor = '#ef4444';
              strokeWidth = 2;
              strokeDasharray = '5,5';
              break;
            default:
              strokeColor = '#d1d5db';
              strokeWidth = 2;
              strokeDasharray = '3,3';
          }

          edges.push({
            id: edgeId,
            source: sourceNodeId,
            target: stepNodeId,
            type: 'smoothstep', // L-shaped/elbow connectors
            animated: isAnimated,
            style: {
              stroke: strokeColor,
              strokeWidth: strokeWidth,
              strokeDasharray: strokeDasharray,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: strokeColor,
            },
          });
        });
      });
    });

    console.log('Generated nodes before layout:', nodes.length, 'edges:', edges.length);
    
    // Apply compact hierarchical layout with minimal spacing
    const layoutResult = calculateHierarchicalLayout(nodes, edges, {
      ...DEFAULT_LAYOUT_CONFIG,
      horizontalGap: 50,      // Compact horizontal gap
      verticalGap: 70,        // Compact vertical gap
      minSiblingGap: 30,      // Minimal sibling spacing
    });

    console.log('Generated nodes after layout:', layoutResult.nodes.length, 'edges:', layoutResult.edges.length);
    return layoutResult;
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

        <div className={`w-full border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 ${isFullScreen ? 'h-full' : ''}`} style={{ height: flowHeight }}>
          <ReactFlow
            nodes={nodesWithCallbacks}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
            proOptions={{ hideAttribution: true }}
            minZoom={0.1}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
          >
            <Background color="#e5e7eb" gap={20} />
            <Controls />
            <MiniMap 
              nodeColor={(node) => {
                if (node.data.cardType === 'order') return '#3b82f6';
                switch (node.data.status) {
                  case 'completed': return '#10b981';
                  case 'in_progress': return '#f59e0b';
                  case 'blocked': return '#ef4444';
                  default: return '#9ca3af';
                }
              }}
              maskColor="rgba(255, 255, 255, 0.8)"
            />
          </ReactFlow>
        </div>
      </div>

      <UpdateStepDialog
        step={selectedOrderStep}
        open={updateStepDialogOpen}
        onOpenChange={setUpdateStepDialogOpen}
        onStepUpdate={handleStepUpdate}
        orderSteps={orderSteps}
        manufacturingSteps={manufacturingSteps}
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
