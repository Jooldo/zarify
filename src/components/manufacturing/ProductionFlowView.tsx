import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeProps,
  Handle,
  Position,
  BackgroundVariant,
  OnNodeDrag,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Package2, Calendar, Play, RotateCcw, Maximize2, X, Factory, Hash } from 'lucide-react';
import { format } from 'date-fns';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useNodePositions } from '@/hooks/useNodePositions';
import { generateOrderRowLayout, generateStepLayout } from '@/utils/nodeLayoutUtils';
import StartStepDialog from './StartStepDialog';
import ManufacturingStepProgressCard from './ManufacturingStepProgressCard';
import UpdateStepDialog from './UpdateStepDialog';
import ManufacturingOrderDetailsDialog from './ManufacturingOrderDetailsDialog';
import { useFlowViewport } from '@/hooks/useFlowViewport';
import { ManufacturingOrder } from '@/types/manufacturingOrders';

interface ProductionFlowViewProps {
  manufacturingOrders: ManufacturingOrder[];
  onViewDetails: (order: ManufacturingOrder) => void;
}

// Loading component for React Flow
const ProductionFlowLoader = () => (
  <div className="w-full h-full flex items-center justify-center bg-background/50 backdrop-blur-sm">
    <div className="text-center space-y-4">
      <div className="relative">
        <Factory className="h-12 w-12 mx-auto text-primary animate-pulse" />
        <div className="absolute inset-0 h-12 w-12 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Loading Production Flow</h3>
        <p className="text-sm text-muted-foreground">Organizing manufacturing orders and steps...</p>
      </div>
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

// Enhanced sequence indicator component with better styling
const SequenceIndicatorNodeComponent: React.FC<NodeProps> = ({ data }) => {
  const sequenceData = data as { sequenceNumber: number; isFirst: boolean; isLast: boolean };
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        {/* Main circle with gradient background */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-white flex items-center justify-center font-bold text-xl shadow-lg border-2 border-white">
          {sequenceData.sequenceNumber}
        </div>
        
        {/* Small decorative badge */}
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
          <Hash className="w-3 h-3 text-white" />
        </div>
        
        {/* Pulse effect for first item */}
        {sequenceData.isFirst && (
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-primary/20 animate-pulse"></div>
        )}
      </div>
      
      {/* Status label with enhanced styling */}
      <div className="mt-3 px-3 py-1 rounded-full bg-white shadow-sm border border-gray-200">
        <span className="text-xs font-semibold text-gray-700">
          {sequenceData.isFirst ? '🚀 Start' : sequenceData.isLast ? '🏁 End' : '⏳ Queue'}
        </span>
      </div>
    </div>
  );
};

// Custom node component for manufacturing orders (unchanged functionality)
const ManufacturingOrderNodeComponent: React.FC<NodeProps> = ({ data }) => {
  const { manufacturingSteps, orderSteps } = useManufacturingSteps();
  const [startStepDialogOpen, setStartStepDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<any>(null);
  
  // Cast data to ManufacturingOrder since we know the structure
  const orderData = data as unknown as ManufacturingOrder & { 
    onViewDetails: (order: ManufacturingOrder) => void;
    sequenceNumber: number;
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFirstStep = () => {
    return manufacturingSteps
      .filter(step => step.is_active)
      .sort((a, b) => a.step_order - b.step_order)[0];
  };

  // Check if any order steps exist for this order
  const hasAnyOrderSteps = orderSteps.some(step => step.manufacturing_order_id === orderData.id);
  
  const firstStep = getFirstStep();
  const shouldShowStartButton = !hasAnyOrderSteps && firstStep;

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when button is clicked
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    orderData.onViewDetails(orderData);
  };

  const handleStartStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (firstStep) {
      setSelectedStep(firstStep);
      setStartStepDialogOpen(true);
    }
  };

  return (
    <>
      <Card className="w-80 hover:shadow-xl transition-all duration-300 cursor-pointer relative border-2 border-gray-200 hover:border-primary/30 bg-gradient-to-br from-white to-gray-50/50" onClick={handleCardClick}>
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-primary border-2 border-white shadow-md" />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-gray-800">{orderData.product_name}</CardTitle>
              <p className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded mt-1">{orderData.order_number}</p>
            </div>
            <div className="flex flex-col gap-1">
              <Badge className={`text-xs shadow-sm ${getPriorityColor(orderData.priority)}`}>
                {orderData.priority}
              </Badge>
              <Badge className={`text-xs shadow-sm ${getStatusColor(orderData.status)}`}>
                {orderData.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Package2 className="h-3 w-3" />
              <span className="text-xs">Qty: <span className="font-semibold text-gray-800">{orderData.quantity_required}</span></span>
            </div>
            
            {orderData.due_date && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-3 w-3" />
                <span className="text-xs">Due: <span className="font-semibold text-gray-800">{format(new Date(orderData.due_date), 'MMM dd')}</span></span>
              </div>
            )}
          </div>

          {/* Start First Step Button */}
          {shouldShowStartButton && (
            <div className="pt-2 border-t border-gray-200">
              <Button 
                onClick={handleStartStep}
                className="w-full text-xs h-7 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm"
              >
                <Play className="h-3 w-3 mr-1" />
                Start {firstStep.step_name}
              </Button>
            </div>
          )}
        </CardContent>
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-primary border-2 border-white shadow-md" />
      </Card>

      <StartStepDialog
        isOpen={startStepDialogOpen}
        onClose={() => setStartStepDialogOpen(false)}
        order={orderData}
        step={selectedStep}
      />
    </>
  );
};

// Custom node component for step progress cards (unchanged functionality)
const StepProgressNodeComponent: React.FC<NodeProps> = ({ data }) => {
  const stepData = data as unknown as { 
    orderStep: any; 
    onStepClick: (orderStep: any) => void;
    onNextStepClick: (orderStep: any) => void;
    stepValues: any[];
    stepFields: any[];
    manufacturingSteps: any[];
  };
  
  return (
    <>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500 border-2 border-white shadow-md" />
      <ManufacturingStepProgressCard
        orderStep={stepData.orderStep}
        stepFields={stepData.stepFields}
        manufacturingSteps={stepData.manufacturingSteps}
        onClick={() => stepData.onStepClick(stepData.orderStep)}
        onNextStepClick={() => stepData.onNextStepClick(stepData.orderStep)}
      />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500 border-2 border-white shadow-md" />
    </>
  );
};

const nodeTypes = {
  manufacturingOrder: ManufacturingOrderNodeComponent,
  stepProgress: StepProgressNodeComponent,
  sequenceIndicator: SequenceIndicatorNodeComponent,
};

// Auto-focus hook that works within ReactFlow context (unchanged)
const useAutoFocus = (manufacturingOrders: ManufacturingOrder[], isLoading: boolean) => {
  const hasAutoFocused = useRef(false);

  // Return the fitView function to be called from within ReactFlow
  const shouldAutoFocus = !isLoading && manufacturingOrders.length > 0 && !hasAutoFocused.current;
  
  // Reset the flag when manufacturing orders change significantly
  useEffect(() => {
    if (manufacturingOrders.length === 0) {
      hasAutoFocused.current = false;
    }
  }, [manufacturingOrders.length]);

  const markAsAutoFocused = useCallback(() => {
    hasAutoFocused.current = true;
  }, []);

  return { shouldAutoFocus, markAsAutoFocused, firstOrderId: manufacturingOrders[0]?.id };
};

// Main Flow Content Component (unchanged functionality)
const FlowContent: React.FC<{
  manufacturingOrders: ManufacturingOrder[];
  isLoading: boolean;
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: any;
  onNodeDragStop: OnNodeDrag;
}> = ({ manufacturingOrders, isLoading, nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodeDragStop }) => {
  const { shouldAutoFocus, markAsAutoFocused, firstOrderId } = useAutoFocus(manufacturingOrders, isLoading);
  const { saveViewport, restoreViewport } = useFlowViewport();

  const onInit = useCallback((reactFlowInstance: any) => {
    if (shouldAutoFocus && firstOrderId) {
      // Small delay to ensure nodes are rendered
      setTimeout(() => {
        reactFlowInstance.fitView({ 
          nodes: [{ id: `order-${firstOrderId}` }],
          padding: 0.2,
          duration: 800
        });
        markAsAutoFocused();
      }, 100);
    } else {
      // Restore previous viewport if no auto-focus needed
      const viewport = restoreViewport();
      reactFlowInstance.setViewport(viewport, { duration: 300 });
    }
  }, [shouldAutoFocus, firstOrderId, markAsAutoFocused, restoreViewport]);

  const onViewportChange = useCallback((viewport: any) => {
    // Save viewport changes with debouncing
    const timeoutId = setTimeout(() => {
      saveViewport(viewport);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [saveViewport]);

  if (isLoading) {
    return <ProductionFlowLoader />;
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeDragStop={onNodeDragStop}
      onInit={onInit}
      onViewportChange={onViewportChange}
      nodeTypes={nodeTypes}
      fitView={false}
      attributionPosition="bottom-left"
      className="bg-gradient-to-br from-gray-50 to-blue-50/30"
      panOnScroll={true}
      panOnScrollSpeed={0.5}
      zoomOnScroll={true}
      zoomOnPinch={true}
      minZoom={0.5}
      maxZoom={1.5}
    >
      <Controls showZoom={true} showFitView={true} className="shadow-lg" />
      <MiniMap 
        className="bg-white border border-gray-200 shadow-lg rounded-lg"
        nodeClassName={() => 'fill-primary/20'}
      />
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
    </ReactFlow>
  );
};

// Main component with enhanced node positioning and edge styling
const ProductionFlowView: React.FC<ProductionFlowViewProps> = ({
  manufacturingOrders,
  onViewDetails
}) => {
  const { orderSteps, manufacturingSteps, stepFields, isLoading: isLoadingSteps } = useManufacturingSteps();
  const { stepValues, isLoading: isLoadingValues } = useManufacturingStepValues();
  const { userNodePositions, updateNodePosition, resetPositions, hasUserPosition } = useNodePositions();
  const [selectedOrder, setSelectedOrder] = useState<ManufacturingOrder | null>(null);
  const [selectedOrderStep, setSelectedOrderStep] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [updateStepDialogOpen, setUpdateStepDialogOpen] = useState(false);
  const [startStepDialogOpen, setStartStepDialogOpen] = useState<any>(false);
  const [selectedStepForStart, setSelectedStepForStart] = useState<any>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Simplified loading state management - only show loading on initial load
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // Only show loading on the very first load
  const isLoading = (isLoadingSteps || isLoadingValues || manufacturingOrders.length === 0) && !hasInitiallyLoaded;

  // Mark as initially loaded once we have data
  useEffect(() => {
    if (!isLoadingSteps && !isLoadingValues && manufacturingOrders.length > 0 && !hasInitiallyLoaded) {
      setHasInitiallyLoaded(true);
    }
  }, [isLoadingSteps, isLoadingValues, manufacturingOrders.length, hasInitiallyLoaded]);

  console.log('ProductionFlowView render - orderSteps:', orderSteps.length, 'stepValues:', stepValues.length, 'stepFields:', stepFields.length);

  const handleViewDetails = useCallback((order: ManufacturingOrder) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  }, []);

  const handleStepClick = useCallback((orderStep: any) => {
    console.log('Step clicked:', orderStep);
    setSelectedOrderStep(orderStep);
    setUpdateStepDialogOpen(true);
  }, []);

  const handleNextStepClick = useCallback((orderStep: any) => {
    // Find the current order
    const currentOrder = manufacturingOrders.find(o => o.id === orderStep.manufacturing_order_id);
    if (!currentOrder) return;

    const currentStepOrder = orderStep.manufacturing_steps?.step_order;
    
    // Find the next step from merchant's configuration
    const nextStep = manufacturingSteps
      .filter(step => step.is_active && step.step_order > currentStepOrder)
      .sort((a, b) => a.step_order - b.step_order)[0];

    console.log('Next step found:', nextStep);

    if (nextStep) {
      setSelectedOrder(currentOrder);
      setSelectedStepForStart(nextStep);
      setStartStepDialogOpen(true);
    } else {
      console.log('No next step found - this is the final step');
    }
  }, [manufacturingOrders, manufacturingSteps]);

  // Handle node drag to save positions
  const onNodeDragStop: OnNodeDrag = useCallback((event, node) => {
    updateNodePosition(node.id, node.position);
  }, [updateNodePosition]);

  // Enhanced nodes generation with better positioning
  const initialNodes: Node[] = useMemo(() => {
    if (isLoading) return [];
    
    console.log('Recalculating nodes...');
    const nodes: Node[] = [];
    
    manufacturingOrders.forEach((order, orderIndex) => {
      // Enhanced sequence indicator positioning
      const sequenceNodeId = `sequence-${order.id}`;
      const sequencePosition = {
        x: orderIndex * 600 - 120, // More spacing between sequences
        y: 50
      };
      
      nodes.push({
        id: sequenceNodeId,
        type: 'sequenceIndicator',
        position: sequencePosition,
        data: {
          sequenceNumber: orderIndex + 1,
          isFirst: orderIndex === 0,
          isLast: orderIndex === manufacturingOrders.length - 1
        } as unknown as Record<string, unknown>,
        draggable: false,
        selectable: false,
      });
      
      // Calculate order node position with better spacing
      const orderNodeId = `order-${order.id}`;
      const orderPosition = {
        x: orderIndex * 600 + 40, // Consistent spacing from sequence indicator
        y: 50
      };
      
      // Add manufacturing order node
      nodes.push({
        id: orderNodeId,
        type: 'manufacturingOrder',
        position: orderPosition,
        data: { 
          ...order, 
          onViewDetails: handleViewDetails,
          sequenceNumber: orderIndex + 1,
        } as unknown as Record<string, unknown>,
      });

      // Add step progress nodes for this order with enhanced positioning
      const orderStepsFiltered = orderSteps.filter(step => 
        step.manufacturing_order_id === order.id && 
        step.status !== 'pending'
      ).sort((a, b) => (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0));

      orderStepsFiltered.forEach((orderStep, stepIndex) => {
        const stepNodeId = `step-${orderStep.id}`;
        const stepPosition = {
          x: orderPosition.x + 50, // Slightly offset from order card
          y: orderPosition.y + 200 + (stepIndex * 150) // Vertical stacking with more space
        };
        
        const stepStepValues = stepValues.filter(v => v.manufacturing_order_step_id === orderStep.id);
        
        // Get step fields for this specific step
        const stepStepFields = stepFields.filter(field => 
          field.manufacturing_step_id === orderStep.manufacturing_step_id
        );
        
        console.log(`Step ${orderStep.id} - stepFields:`, stepStepFields);
        console.log(`Step ${orderStep.id} - stepValues:`, stepStepValues);
        
        nodes.push({
          id: stepNodeId,
          type: 'stepProgress',
          position: stepPosition,
          data: { 
            orderStep, 
            onStepClick: handleStepClick,
            onNextStepClick: handleNextStepClick,
            stepValues: stepStepValues,
            stepFields: stepStepFields,
            manufacturingSteps: manufacturingSteps,
          } as unknown as Record<string, unknown>,
        });
      });
    });

    return nodes;
  }, [manufacturingOrders, orderSteps, manufacturingSteps, stepValues, stepFields, userNodePositions, hasUserPosition, handleViewDetails, handleStepClick, handleNextStepClick, isLoading]);

  // Enhanced edges with better styling and connection types
  const initialEdges: Edge[] = useMemo(() => {
    if (isLoading) return [];
    
    const edges: Edge[] = [];
    
    manufacturingOrders.forEach((order, orderIndex) => {
      // Enhanced connection from sequence indicator to order with custom styling
      edges.push({
        id: `edge-sequence-${order.id}-order-${order.id}`,
        source: `sequence-${order.id}`,
        target: `order-${order.id}`,
        type: 'smoothstep',
        animated: false,
        style: { 
          stroke: '#3b82f6', 
          strokeWidth: 4,
          strokeDasharray: '0',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
        },
      });
      
      const orderStepsFiltered = orderSteps.filter(step => 
        step.manufacturing_order_id === order.id && 
        step.status !== 'pending'
      ).sort((a, b) => (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0));

      if (orderStepsFiltered.length > 0) {
        // Enhanced connection from order to first step
        edges.push({
          id: `edge-order-${order.id}-step-${orderStepsFiltered[0].id}`,
          source: `order-${order.id}`,
          target: `step-${orderStepsFiltered[0].id}`,
          type: 'smoothstep',
          animated: true,
          style: { 
            stroke: '#3b82f6', 
            strokeWidth: 3,
            strokeDasharray: '8,4',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
          },
        });

        // Enhanced step-to-step connections
        for (let i = 0; i < orderStepsFiltered.length - 1; i++) {
          edges.push({
            id: `edge-step-${orderStepsFiltered[i].id}-step-${orderStepsFiltered[i + 1].id}`,
            source: `step-${orderStepsFiltered[i].id}`,
            target: `step-${orderStepsFiltered[i + 1].id}`,
            type: 'smoothstep',
            animated: true,
            style: { 
              stroke: '#3b82f6', 
              strokeWidth: 3,
              strokeDasharray: '8,4',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
            },
          });
        }
      }
      
      // Enhanced connection to next order sequence indicator
      if (orderIndex < manufacturingOrders.length - 1) {
        const nextOrder = manufacturingOrders[orderIndex + 1];
        const hasCurrentSteps = orderStepsFiltered.length > 0;
        
        if (hasCurrentSteps) {
          // Connect from last step to next sequence indicator
          const lastStep = orderStepsFiltered[orderStepsFiltered.length - 1];
          edges.push({
            id: `edge-step-${lastStep.id}-sequence-${nextOrder.id}`,
            source: `step-${lastStep.id}`,
            target: `sequence-${nextOrder.id}`,
            type: 'smoothstep',
            animated: false,
            style: { 
              stroke: '#10b981', 
              strokeWidth: 3,
              strokeDasharray: '12,8',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            },
          });
        } else {
          // Connect from order to next sequence indicator
          edges.push({
            id: `edge-order-${order.id}-sequence-${nextOrder.id}`,
            source: `order-${order.id}`,
            target: `sequence-${nextOrder.id}`,
            type: 'smoothstep',
            animated: false,
            style: { 
              stroke: '#10b981', 
              strokeWidth: 3,
              strokeDasharray: '12,8',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            },
          });
        }
      }
    });

    return edges;
  }, [manufacturingOrders, orderSteps, isLoading]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Update nodes when initialNodes change with debouncing to prevent excessive updates
  useEffect(() => {
    if (!isLoading) {
      console.log('Updating React Flow nodes due to data changes');
      // Small delay to ensure smooth updates
      const timeoutId = setTimeout(() => {
        setNodes(initialNodes);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [initialNodes, isLoading, setNodes]);

  // Update edges when initialEdges change
  useEffect(() => {
    if (!isLoading) {
      const timeoutId = setTimeout(() => {
        setEdges(initialEdges);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [initialEdges, isLoading, setEdges]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => [...eds]),
    [setEdges]
  );

  const currentOrderStep = selectedOrderStep;
  const currentStepFields = stepFields.filter(field => 
    field.manufacturing_step_id === currentOrderStep?.manufacturing_step_id
  );
  
  const previousSteps = useMemo(() => {
    if (!currentOrderStep) return [];
    
    const steps = orderSteps
      .filter(step => 
        step.manufacturing_order_id === currentOrderStep.manufacturing_order_id &&
        (step.manufacturing_steps?.step_order || 0) < (currentOrderStep.manufacturing_steps?.step_order || 0)
      )
      .sort((a, b) => (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0));
    
    console.log('Previous steps for step', currentOrderStep.id, ':', steps);
    return steps;
  }, [orderSteps, currentOrderStep]);

  if (isFullScreen) {
    return (
      <>
        <div className="fixed inset-0 z-50 bg-background">
          {/* Full-screen controls */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              onClick={resetPositions}
              variant="outline"
              size="sm"
              className="bg-background/80 backdrop-blur-sm"
              disabled={isLoading}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset Layout
            </Button>
            <Button
              onClick={() => setIsFullScreen(false)}
              variant="outline"
              size="sm"
              className="bg-background/80 backdrop-blur-sm"
            >
              <X className="h-4 w-4 mr-1" />
              Exit Full Screen
            </Button>
          </div>
          <ReactFlowProvider>
            <FlowContent
              manufacturingOrders={manufacturingOrders}
              isLoading={isLoading}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeDragStop={onNodeDragStop}
            />
          </ReactFlowProvider>
        </div>

        {/* Dialogs remain accessible in full screen */}
        <ManufacturingOrderDetailsDialog
          order={selectedOrder}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          getPriorityColor={(priority: string) => {
            switch (priority.toLowerCase()) {
              case 'urgent': return 'bg-red-500 text-white';
              case 'high': return 'bg-orange-500 text-white';
              case 'medium': return 'bg-yellow-500 text-white';
              case 'low': return 'bg-green-500 text-white';
              default: return 'bg-gray-500 text-white';
            }
          }}
          getStatusColor={(status: string) => {
            switch (status.toLowerCase()) {
              case 'pending': return 'bg-gray-100 text-gray-800';
              case 'in_progress': return 'bg-blue-100 text-blue-800';
              case 'completed': return 'bg-green-100 text-green-800';
              default: return 'bg-gray-100 text-gray-800';
            }
          }}
        />

        <UpdateStepDialog
          open={updateStepDialogOpen}
          onOpenChange={setUpdateStepDialogOpen}
          stepData={currentOrderStep ? {
            stepName: currentOrderStep.manufacturing_steps?.step_name || '',
            stepOrder: currentOrderStep.manufacturing_steps?.step_order || 0,
            orderId: currentOrderStep.manufacturing_order_id,
            orderNumber: manufacturingOrders.find(o => o.id === currentOrderStep.manufacturing_order_id)?.order_number || '',
            productName: manufacturingOrders.find(o => o.id === currentOrderStep.manufacturing_order_id)?.product_name || '',
            status: currentOrderStep.status,
            progress: currentOrderStep.progress_percentage || 0,
            stepFields: currentStepFields, // Pass stepFields to UpdateStepDialog
          } : null}
          currentOrderStep={currentOrderStep}
          stepFields={currentStepFields}
          previousSteps={previousSteps}
        />

        <StartStepDialog
          isOpen={startStepDialogOpen}
          onClose={() => setStartStepDialogOpen(false)}
          order={selectedOrder}
          step={selectedStepForStart}
        />
      </>
    );
  }

  return (
    <>
      <div className="w-full h-[600px] border rounded-lg bg-background relative">
        {/* Control buttons */}
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <Button
            onClick={() => setIsFullScreen(true)}
            variant="outline"
            size="sm"
            className="bg-background/80 backdrop-blur-sm"
            disabled={isLoading}
          >
            <Maximize2 className="h-4 w-4 mr-1" />
            Full Screen
          </Button>
          <Button
            onClick={resetPositions}
            variant="outline"
            size="sm"
            className="bg-background/80 backdrop-blur-sm"
            disabled={isLoading}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset Layout
          </Button>
        </div>

        <ReactFlowProvider>
          <FlowContent
            manufacturingOrders={manufacturingOrders}
            isLoading={isLoading}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
          />
        </ReactFlowProvider>
      </div>

      {/* Dialogs */}
      <ManufacturingOrderDetailsDialog
        order={selectedOrder}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        getPriorityColor={(priority: string) => {
          switch (priority.toLowerCase()) {
            case 'urgent': return 'bg-red-500 text-white';
            case 'high': return 'bg-orange-500 text-white';
            case 'medium': return 'bg-yellow-500 text-white';
            case 'low': return 'bg-green-500 text-white';
            default: return 'bg-gray-500 text-white';
          }
        }}
        getStatusColor={(status: string) => {
          switch (status.toLowerCase()) {
            case 'pending': return 'bg-gray-100 text-gray-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
          }
        }}
      />

      <UpdateStepDialog
        open={updateStepDialogOpen}
        onOpenChange={setUpdateStepDialogOpen}
        stepData={currentOrderStep ? {
          stepName: currentOrderStep.manufacturing_steps?.step_name || '',
          stepOrder: currentOrderStep.manufacturing_steps?.step_order || 0,
          orderId: currentOrderStep.manufacturing_order_id,
          orderNumber: manufacturingOrders.find(o => o.id === currentOrderStep.manufacturing_order_id)?.order_number || '',
          productName: manufacturingOrders.find(o => o.id === currentOrderStep.manufacturing_order_id)?.product_name || '',
          status: currentOrderStep.status,
          progress: currentOrderStep.progress_percentage || 0,
          stepFields: currentStepFields,
        } : null}
        currentOrderStep={currentOrderStep}
        stepFields={currentStepFields}
        previousSteps={previousSteps}
      />

      <StartStepDialog
        isOpen={startStepDialogOpen}
        onClose={() => setStartStepDialogOpen(false)}
        order={selectedOrder}
        step={selectedStepForStart}
      />
    </>
  );
};

export default ProductionFlowView;
