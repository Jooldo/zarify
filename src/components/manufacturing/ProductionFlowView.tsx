import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Package2, Calendar, Play, RotateCcw, Maximize2, X, Factory, Workflow } from 'lucide-react';
import { format } from 'date-fns';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useNodePositions } from '@/hooks/useNodePositions';
import { generateOrderRowLayout, generateStepLayout } from '@/utils/nodeLayoutUtils';
import StartStepDialog from './StartStepDialog';
import ManufacturingStepProgressCard from './ManufacturingStepProgressCard';
import UpdateStepDialog from './UpdateStepDialog';
import ManufacturingOrderDetailsDialog from './ManufacturingOrderDetailsDialog';

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

// Custom node component for manufacturing orders
const ManufacturingOrderNodeComponent: React.FC<NodeProps> = ({ data }) => {
  const { manufacturingSteps, orderSteps } = useManufacturingSteps();
  const [startStepDialogOpen, setStartStepDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<any>(null);
  
  // Cast data to ManufacturingOrder since we know the structure
  const orderData = data as unknown as ManufacturingOrder & { onViewDetails: (order: ManufacturingOrder) => void };
  
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

  const getNextStep = () => {
    const currentOrderSteps = orderSteps.filter(step => step.manufacturing_order_id === orderData.id);
    
    if (currentOrderSteps.length === 0) {
      return manufacturingSteps
        .filter(step => step.is_active)
        .sort((a, b) => a.step_order - b.step_order)[0];
    }
    
    const nextPendingStep = currentOrderSteps
      .filter(step => step.status === 'pending')
      .sort((a, b) => (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0))[0];
    
    return nextPendingStep?.manufacturing_steps;
  };

  const nextStep = getNextStep();
  const hasStarted = orderSteps.some(step => step.manufacturing_order_id === orderData.id && step.status !== 'pending');

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when button is clicked
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    orderData.onViewDetails(orderData);
  };

  const handleStartStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nextStep) {
      setSelectedStep(nextStep);
      setStartStepDialogOpen(true);
    }
  };

  return (
    <>
      <Card className="w-80 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCardClick}>
        <Handle type="target" position={Position.Left} />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">{orderData.product_name}</CardTitle>
              <p className="text-xs text-gray-600 font-mono">{orderData.order_number}</p>
            </div>
            <div className="flex flex-col gap-1">
              <Badge className={`text-xs ${getPriorityColor(orderData.priority)}`}>
                {orderData.priority}
              </Badge>
              <Badge className={`text-xs ${getStatusColor(orderData.status)}`}>
                {orderData.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package2 className="h-3 w-3 text-gray-500" />
              <span className="text-xs">Qty: <span className="font-semibold">{orderData.quantity_required}</span></span>
            </div>
            
            {orderData.due_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-gray-500" />
                <span className="text-xs">Due: {format(new Date(orderData.due_date), 'MMM dd')}</span>
              </div>
            )}
          </div>

          {/* Single CTA Button */}
          {nextStep && !hasStarted && (
            <div className="pt-2 border-t">
              <Button 
                onClick={handleStartStep}
                className="w-full text-xs h-7 bg-primary hover:bg-primary/90"
              >
                <Play className="h-3 w-3 mr-1" />
                Start {nextStep.step_name}
              </Button>
            </div>
          )}
        </CardContent>
        <Handle type="source" position={Position.Right} />
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

// Custom node component for step progress cards
const StepProgressNodeComponent: React.FC<NodeProps> = ({ data }) => {
  const stepData = data as unknown as { 
    orderStep: any; 
    onStepClick: (orderStep: any) => void;
    onNextStepClick: (orderStep: any) => void;
    stepValues: any[];
    stepFields: any[];
  };
  
  console.log('StepProgressNodeComponent - stepData:', stepData);
  
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <ManufacturingStepProgressCard
        orderStep={stepData.orderStep}
        stepFields={stepData.stepFields} // Pass stepFields here
        onClick={() => stepData.onStepClick(stepData.orderStep)}
        onNextStepClick={() => stepData.onNextStepClick(stepData.orderStep)}
      />
      <Handle type="source" position={Position.Right} />
    </>
  );
};

const nodeTypes = {
  manufacturingOrder: ManufacturingOrderNodeComponent,
  stepProgress: StepProgressNodeComponent,
};

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
  
  // Fixed loading state management
  const [isFixedLoading, setIsFixedLoading] = useState(true);
  const [lastDataVersion, setLastDataVersion] = useState<string>('');

  // Create a data version string to detect changes
  const currentDataVersion = useMemo(() => {
    return `${manufacturingOrders.length}-${orderSteps.length}-${stepValues.length}`;
  }, [manufacturingOrders.length, orderSteps.length, stepValues.length]);

  // Handle initial load and data changes with fixed 1-second loading
  useEffect(() => {
    if (currentDataVersion !== lastDataVersion) {
      setIsFixedLoading(true);
      const timer = setTimeout(() => {
        setIsFixedLoading(false);
        setLastDataVersion(currentDataVersion);
      }, 1000); // Fixed 1-second loading time

      return () => clearTimeout(timer);
    }
  }, [currentDataVersion, lastDataVersion]);

  // Check if we're loading critical data or in fixed loading state
  const isLoading = isLoadingSteps || isLoadingValues || manufacturingOrders.length === 0 || isFixedLoading;

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
    // Find the next step after this completed step
    const currentOrder = manufacturingOrders.find(o => o.id === orderStep.manufacturing_order_id);
    if (!currentOrder) return;

    const currentStepOrder = orderStep.manufacturing_steps?.step_order;
    const nextStep = manufacturingSteps
      .filter(step => step.is_active && step.step_order > currentStepOrder)
      .sort((a, b) => a.step_order - b.step_order)[0];

    if (nextStep) {
      setSelectedOrder(currentOrder);
      setSelectedStepForStart(nextStep);
      setStartStepDialogOpen(true);
    }
  }, [manufacturingOrders, manufacturingSteps]);

  // Handle node drag to save positions
  const onNodeDragStop: OnNodeDrag = useCallback((event, node) => {
    updateNodePosition(node.id, node.position);
  }, [updateNodePosition]);

  // Convert manufacturing orders and their steps to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    if (isLoading) return [];
    
    console.log('Recalculating nodes...');
    const nodes: Node[] = [];
    
    manufacturingOrders.forEach((order, orderIndex) => {
      // Calculate order node position
      const orderNodeId = `order-${order.id}`;
      const orderPosition = generateOrderRowLayout(
        manufacturingOrders.length,
        orderIndex,
        hasUserPosition(orderNodeId) ? userNodePositions[orderNodeId] : undefined
      );
      
      // Add manufacturing order node
      nodes.push({
        id: orderNodeId,
        type: 'manufacturingOrder',
        position: orderPosition,
        data: { 
          ...order, 
          onViewDetails: handleViewDetails,
        } as unknown as Record<string, unknown>,
      });

      // Add step progress nodes for this order
      const orderStepsFiltered = orderSteps.filter(step => 
        step.manufacturing_order_id === order.id && 
        step.status !== 'pending'
      ).sort((a, b) => (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0));

      orderStepsFiltered.forEach((orderStep, stepIndex) => {
        const stepNodeId = `step-${orderStep.id}`;
        const stepPosition = generateStepLayout(
          orderPosition,
          stepIndex,
          hasUserPosition(stepNodeId) ? userNodePositions[stepNodeId] : undefined
        );
        
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
            stepFields: stepStepFields, // Pass step fields to the node
          } as unknown as Record<string, unknown>,
        });
      });
    });

    return nodes;
  }, [manufacturingOrders, orderSteps, manufacturingSteps, stepValues, stepFields, userNodePositions, hasUserPosition, handleViewDetails, handleStepClick, handleNextStepClick, isLoading]);

  const initialEdges: Edge[] = useMemo(() => {
    if (isLoading) return [];
    
    const edges: Edge[] = [];
    
    manufacturingOrders.forEach((order) => {
      const orderStepsFiltered = orderSteps.filter(step => 
        step.manufacturing_order_id === order.id && 
        step.status !== 'pending'
      ).sort((a, b) => (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0));

      if (orderStepsFiltered.length > 0) {
        // Connect order to first step
        edges.push({
          id: `edge-order-${order.id}-step-${orderStepsFiltered[0].id}`,
          source: `order-${order.id}`,
          target: `step-${orderStepsFiltered[0].id}`,
          type: 'smoothstep',
          animated: true,
          style: { 
            stroke: '#3b82f6', 
            strokeWidth: 2,
            strokeDasharray: '5,5'
          },
        });

        // Connect steps to each other
        for (let i = 0; i < orderStepsFiltered.length - 1; i++) {
          edges.push({
            id: `edge-step-${orderStepsFiltered[i].id}-step-${orderStepsFiltered[i + 1].id}`,
            source: `step-${orderStepsFiltered[i].id}`,
            target: `step-${orderStepsFiltered[i + 1].id}`,
            type: 'smoothstep',
            animated: true,
            style: { 
              stroke: '#3b82f6', 
              strokeWidth: 2,
              strokeDasharray: '5,5'
            },
          });
        }
      }
    });

    return edges;
  }, [manufacturingOrders, orderSteps, isLoading]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Update nodes when initialNodes change (this ensures real-time updates)
  React.useEffect(() => {
    if (!isLoading) {
      console.log('Updating React Flow nodes due to data changes');
      setNodes(initialNodes);
    }
  }, [initialNodes, isLoading]);

  // Update edges when initialEdges change
  React.useEffect(() => {
    if (!isLoading) {
      setEdges(initialEdges);
    }
  }, [initialEdges, isLoading]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => [...eds]),
    [setEdges]
  );

  // Get current order step data for update dialog with improved debugging
  const currentOrderStep = selectedOrderStep;
  const currentStepFields = stepFields.filter(field => 
    field.manufacturing_step_id === currentOrderStep?.manufacturing_step_id
  );
  
  // Improved previous steps calculation with debugging
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

  const FlowContent = () => {
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
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-background"
        panOnScroll={true}
        panOnScrollSpeed={0.5}
        zoomOnScroll={true}
        zoomOnPinch={true}
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Controls showZoom={true} showFitView={true} />
        <MiniMap 
          className="bg-background border"
          nodeClassName={() => 'fill-primary/20'}
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
      </ReactFlow>
    );
  };

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
          <FlowContent />
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

        <FlowContent />
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
            default: return 'bg-gray-500 text-white';
          }
        }}
        getStatusColor={(status: string) => {
          switch (status.toLowerCase()) {
            case 'pending': return 'bg-gray-100 text-gray-800';
            case 'in_progress':return 'bg-blue-100 text-blue-800';
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
};

export default ProductionFlowView;
