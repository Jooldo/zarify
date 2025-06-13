
import React, { useMemo, useState } from 'react';
import { ReactFlow, Background, Controls, Node, Edge, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ManufacturingOrder, useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import ManufacturingOrderCard from './ManufacturingOrderCard';
import ManufacturingStepProgressCard from './ManufacturingStepProgressCard';
import StepProgressDialog from './StepProgressDialog';
import StartStepDialog from './StartStepDialog';

// Custom node component for manufacturing orders
const ManufacturingOrderNode = ({ data }: { data: { order: ManufacturingOrder; onViewDetails: (order: ManufacturingOrder) => void } }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-w-[300px]">
      <ManufacturingOrderCard
        order={data.order}
        getPriorityColor={getPriorityColor}
        getStatusColor={getStatusColor}
        onViewDetails={data.onViewDetails}
      />
    </div>
  );
};

// Custom node component for step progress cards
const StepProgressNode = ({ data }: { 
  data: { 
    orderStep: any; 
    onClick: () => void; 
    onStartNextStep: () => void;
  } 
}) => {
  return (
    <div className="min-w-[320px]">
      <ManufacturingStepProgressCard
        orderStep={data.orderStep}
        onClick={data.onClick}
        onStartNextStep={data.onStartNextStep}
      />
    </div>
  );
};

const nodeTypes = {
  manufacturingOrder: ManufacturingOrderNode,
  stepProgress: StepProgressNode,
};

const ProductionFlowView = () => {
  const { manufacturingOrders } = useManufacturingOrders();
  const { orderSteps, manufacturingSteps } = useManufacturingSteps();
  const [selectedOrder, setSelectedOrder] = useState<ManufacturingOrder | null>(null);
  const [selectedOrderSteps, setSelectedOrderSteps] = useState<any[]>([]);
  const [stepProgressDialogOpen, setStepProgressDialogOpen] = useState(false);
  const [startStepDialogOpen, setStartStepDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<any>(null);

  // Filter for in-progress orders only
  const inProgressOrders = manufacturingOrders.filter(order => order.status === 'in_progress');

  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let yPosition = 0;

    inProgressOrders.forEach((order, orderIndex) => {
      // Add manufacturing order node
      const orderNodeId = `order-${order.id}`;
      nodes.push({
        id: orderNodeId,
        type: 'manufacturingOrder',
        position: { x: 0, y: yPosition },
        data: { 
          order,
          onViewDetails: (order: ManufacturingOrder) => {
            setSelectedOrder(order);
            const steps = orderSteps.filter(step => step.manufacturing_order_id === order.id);
            setSelectedOrderSteps(steps);
            setStepProgressDialogOpen(true);
          }
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });

      // Get active steps for this order
      const activeSteps = orderSteps.filter(step => 
        step.manufacturing_order_id === order.id && 
        step.status !== 'pending'
      ).sort((a, b) => (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0));

      // Add step progress nodes
      activeSteps.forEach((step, stepIndex) => {
        const stepNodeId = `step-${step.id}`;
        const xPosition = 350 + (stepIndex * 350);

        nodes.push({
          id: stepNodeId,
          type: 'stepProgress',
          position: { x: xPosition, y: yPosition },
          data: { 
            orderStep: step,
            onClick: () => {
              setSelectedOrder(order);
              const steps = orderSteps.filter(s => s.manufacturing_order_id === order.id);
              setSelectedOrderSteps(steps);
              setStepProgressDialogOpen(true);
            },
            onStartNextStep: () => {
              const currentStepOrder = step.manufacturing_steps?.step_order || 0;
              const nextStep = manufacturingSteps.find(s => 
                s.step_order === currentStepOrder + 1 && s.is_active
              );
              
              if (nextStep) {
                setSelectedStep(nextStep);
                setSelectedOrder(order);
                setStartStepDialogOpen(true);
              }
            }
          },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        });

        // Add edge from previous node
        const previousNodeId = stepIndex === 0 ? orderNodeId : `step-${activeSteps[stepIndex - 1].id}`;
        edges.push({
          id: `edge-${previousNodeId}-${stepNodeId}`,
          source: previousNodeId,
          target: stepNodeId,
          type: 'smoothstep',
          style: { stroke: '#3b82f6', strokeWidth: 2 },
        });
      });

      yPosition += 250; // Space between order rows
    });

    return { nodes, edges };
  }, [inProgressOrders, orderSteps, manufacturingSteps]);

  return (
    <div className="h-[800px] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background />
        <Controls />
      </ReactFlow>

      <StepProgressDialog
        order={selectedOrder}
        orderSteps={selectedOrderSteps}
        open={stepProgressDialogOpen}
        onOpenChange={setStepProgressDialogOpen}
      />

      <StartStepDialog
        isOpen={startStepDialogOpen}
        onClose={() => setStartStepDialogOpen(false)}
        order={selectedOrder}
        step={selectedStep}
      />
    </div>
  );
};

export default ProductionFlowView;
