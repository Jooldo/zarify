import React, { useState, useCallback, useMemo } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package2, Calendar, Play } from 'lucide-react';
import { format } from 'date-fns';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import StartStepDialog from './StartStepDialog';
import ManufacturingStepProgressCard from './ManufacturingStepProgressCard';
import UpdateStepDialog from './UpdateStepDialog';
import ManufacturingOrderDetailsDialog from './ManufacturingOrderDetailsDialog';

interface ProductionFlowViewProps {
  manufacturingOrders: ManufacturingOrder[];
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  onViewDetails: (order: ManufacturingOrder) => void;
}

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
  };
  
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <ManufacturingStepProgressCard
        orderStep={stepData.orderStep}
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
  getPriorityColor,
  getStatusColor,
  onViewDetails
}) => {
  const { orderSteps, manufacturingSteps, stepFields } = useManufacturingSteps();
  const [selectedOrder, setSelectedOrder] = useState<ManufacturingOrder | null>(null);
  const [selectedOrderStep, setSelectedOrderStep] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [updateStepDialogOpen, setUpdateStepDialogOpen] = useState(false);
  const [startStepDialogOpen, setStartStepDialogOpen] = useState(false);
  const [selectedStepForStart, setSelectedStepForStart] = useState<any>(null);

  const handleViewDetails = (order: ManufacturingOrder) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  const handleStepClick = (orderStep: any) => {
    setSelectedOrderStep(orderStep);
    setUpdateStepDialogOpen(true);
  };

  const handleNextStepClick = (orderStep: any) => {
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
  };

  // Convert manufacturing orders and their steps to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];
    let yOffset = 50;
    
    manufacturingOrders.forEach((order, orderIndex) => {
      const xStart = 50;
      
      // Add manufacturing order node
      nodes.push({
        id: `order-${order.id}`,
        type: 'manufacturingOrder',
        position: { x: xStart, y: yOffset },
        data: { ...order, onViewDetails: handleViewDetails } as unknown as Record<string, unknown>,
      });

      // Add step progress nodes for this order
      const orderStepsFiltered = orderSteps.filter(step => 
        step.manufacturing_order_id === order.id && 
        step.status !== 'pending'
      ).sort((a, b) => (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0));

      orderStepsFiltered.forEach((orderStep, stepIndex) => {
        const stepXOffset = xStart + 400 + (stepIndex * 320);
        
        nodes.push({
          id: `step-${orderStep.id}`,
          type: 'stepProgress',
          position: { x: stepXOffset, y: yOffset },
          data: { 
            orderStep, 
            onStepClick: handleStepClick,
            onNextStepClick: handleNextStepClick
          } as unknown as Record<string, unknown>,
        });
      });

      yOffset += 250; // Space between order rows
    });

    return nodes;
  }, [manufacturingOrders, orderSteps, manufacturingSteps]);

  const initialEdges: Edge[] = useMemo(() => {
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
          style: { stroke: '#3b82f6', strokeWidth: 2 },
        });

        // Connect steps to each other
        for (let i = 0; i < orderStepsFiltered.length - 1; i++) {
          edges.push({
            id: `edge-step-${orderStepsFiltered[i].id}-step-${orderStepsFiltered[i + 1].id}`,
            source: `step-${orderStepsFiltered[i].id}`,
            target: `step-${orderStepsFiltered[i + 1].id}`,
            type: 'smoothstep',
            style: { stroke: '#3b82f6', strokeWidth: 2 },
          });
        }
      }
    });

    return edges;
  }, [manufacturingOrders, orderSteps]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => [...eds]),
    [setEdges]
  );

  // Get current order step data for update dialog
  const currentOrderStep = selectedOrderStep;
  const currentStepFields = stepFields.filter(field => 
    field.manufacturing_step_id === currentOrderStep?.manufacturing_step_id
  );
  const previousSteps = orderSteps
    .filter(step => 
      step.manufacturing_order_id === currentOrderStep?.manufacturing_order_id &&
      (step.manufacturing_steps?.step_order || 0) < (currentOrderStep?.manufacturing_steps?.step_order || 0)
    )
    .sort((a, b) => (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0));

  return (
    <>
      <div className="w-full h-[600px] border rounded-lg bg-background">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          className="bg-background"
        >
          <Controls />
          <MiniMap 
            className="bg-background border"
            nodeClassName={() => 'fill-primary/20'}
          />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
        </ReactFlow>
      </div>

      {/* Dialogs */}
      <ManufacturingOrderDetailsDialog
        order={selectedOrder}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        getPriorityColor={getPriorityColor}
        getStatusColor={getStatusColor}
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
