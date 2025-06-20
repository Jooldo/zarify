import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, User, Calendar, Hash, Play, Clock, Target } from 'lucide-react';
import { format } from 'date-fns';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useWorkers } from '@/hooks/useWorkers';
import { useNodePositions } from '@/hooks/useNodePositions';
import { useFlowViewport } from '@/hooks/useFlowViewport';
import { generateOrderRowLayout, generateStepLayout } from '@/utils/nodeLayoutUtils';
import ManufacturingStepProgressCard from './ManufacturingStepProgressCard';
import StartStepDialog from './StartStepDialog';

interface ManufacturingOrderNodeData {
  id: string;
  order_number: string;
  product_name: string;
  priority: string;
  status: string;
  quantity_required: number;
  createdAt: Date;
  dueDate?: Date;
  productConfigs?: any;
}

interface ManufacturingStepNodeData {
  id: string;
  step_name: string;
  step_order: number;
  qc_required: boolean;
  orderStep: any;
}

interface ProductionFlowViewProps {
  manufacturingOrders: any[];
  onViewDetails: (order: any) => void;
}

const nodeTypes = {
  manufacturingOrder: ({ data }: { data: ManufacturingOrderNodeData }) => {
    return (
      <Card className="w-72">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">{data.product_name}</CardTitle>
              <p className="text-sm text-gray-600 font-mono">{data.order_number}</p>
            </div>
            <div className="flex flex-col gap-1">
              <Badge className="text-xs">{data.priority}</Badge>
              <Badge className="text-xs">{data.status}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Quantity: <span className="font-semibold">{data.quantity_required}</span></span>
          </div>
          {data.dueDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Due: {format(data.dueDate, 'MMM dd, yyyy')}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Created: {format(data.createdAt, 'MMM dd, yyyy')}</span>
          </div>
          {data.productConfigs && (
            <div className="p-2 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-blue-600 font-mono">{data.productConfigs.product_code}</p>
              <p className="text-xs text-blue-600">{data.productConfigs.category} - {data.productConfigs.subcategory}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  },
  manufacturingStep: ({ data }: { data: ManufacturingStepNodeData }) => {
    return (
      <ManufacturingStepProgressCard
        orderStep={data.orderStep}
        stepFields={data.orderStep.manufacturing_steps?.manufacturing_step_fields}
        manufacturingSteps={data.orderStep.manufacturing_steps}
      />
    );
  },
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending': return 'bg-gray-100 text-gray-800';
    case 'in_progress': return 'bg-blue-100 text-blue-800';
    case 'completed': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
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

const FlowContent = ({ manufacturingOrders, onViewDetails }: ProductionFlowViewProps) => {
  const { manufacturingSteps, orderSteps } = useManufacturingSteps();
  const { workers } = useWorkers();
  const { nodePositions, updateNodePosition } = useNodePositions();
  const { fitView, setViewport } = useReactFlow();
  
  const [selectedOrderStep, setSelectedOrderStep] = React.useState<{
    order: any;
    step: any;
  } | null>(null);
  const [startStepDialogOpen, setStartStepDialogOpen] = React.useState(false);

  const handleStartStep = (order: any, step: any) => {
    setSelectedOrderStep({ order, step });
    setStartStepDialogOpen(true);
  };

  const canStartStep = (order: any, step: any) => {
    // Can start if this is the first step and no steps exist yet
    if (!order.currentStep && step.step_order === 1) {
      return true;
    }
    
    // Can start if current step status is pending
    if (order.currentStep && order.stepStatus === 'pending') {
      return true;
    }
    
    return false;
  };

  // Generate nodes and edges
  const { nodes, edges } = useMemo(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    manufacturingOrders.forEach((order, orderIndex) => {
      // 1. Manufacturing Order Node
      const orderNodeId = `order-${order.id}`;
      const orderPosition = generateOrderRowLayout(
        manufacturingOrders.length,
        orderIndex,
        nodePositions[orderNodeId]
      );

      newNodes.push({
        id: orderNodeId,
        type: 'manufacturingOrder',
        position: orderPosition,
        data: {
          id: order.id,
          order_number: order.order_number,
          product_name: order.product_name,
          priority: order.priority,
          status: order.status,
          quantity_required: order.quantity_required,
          createdAt: new Date(order.created_at),
          dueDate: order.due_date ? new Date(order.due_date) : undefined,
          productConfigs: order.product_configs,
        },
      });

      // 2. Manufacturing Step Nodes
      const orderOrderSteps = orderSteps.filter(step => String(step.manufacturing_order_id) === String(order.id));

      if (orderOrderSteps.length === 0) {
        // No steps created yet - this order should appear in first step as "not started"
        const firstStep = manufacturingSteps
          .filter(step => step.is_active)
          .sort((a, b) => a.step_order - b.step_order)[0];

        if (firstStep) {
          const stepNodeId = `step-${firstStep.id}-${order.id}`;
          const stepIndex = 0; // First step
          const stepPosition = generateStepLayout(
            orderPosition,
            stepIndex,
            nodePositions[stepNodeId]
          );

          newNodes.push({
            id: stepNodeId,
            type: 'manufacturingStep',
            position: stepPosition,
            data: {
              id: firstStep.id,
              step_name: firstStep.step_name,
              step_order: firstStep.step_order,
              qc_required: firstStep.qc_required,
              orderStep: {
                ...order,
                manufacturing_steps: firstStep,
                status: 'not_started',
                manufacturing_order_id: order.id,
              }
            },
          });

          newEdges.push({
            id: `edge-${orderNodeId}-${stepNodeId}`,
            source: orderNodeId,
            target: stepNodeId,
            type: 'smoothstep',
            animated: true,
            style: {
              strokeWidth: 2,
              stroke: '#a1a1aa',
            },
          });
        }
      } else {
        orderOrderSteps.forEach((orderStep, stepIndex) => {
          const stepNodeId = `step-${orderStep.manufacturing_step_id}-${order.id}`;
          const stepPosition = generateStepLayout(
            orderPosition,
            stepIndex,
            nodePositions[stepNodeId]
          );

          newNodes.push({
            id: stepNodeId,
            type: 'manufacturingStep',
            position: stepPosition,
            data: {
              id: orderStep.manufacturing_step_id,
              step_name: orderStep.manufacturing_steps?.step_name || 'Step Name N/A',
              step_order: orderStep.manufacturing_steps?.step_order || stepIndex + 1,
              qc_required: orderStep.manufacturing_steps?.qc_required || false,
              orderStep: {
                ...orderStep,
                manufacturing_steps: orderStep.manufacturing_steps,
                manufacturing_order_id: order.id,
              }
            },
          });

          newEdges.push({
            id: `edge-${orderNodeId}-${stepNodeId}`,
            source: orderNodeId,
            target: stepNodeId,
            type: 'smoothstep',
            animated: true,
            style: {
              strokeWidth: 2,
              stroke: '#a1a1aa',
            },
          });
        });
      }
    });

    return {
      nodes: newNodes,
      edges: newEdges,
    };
  }, [manufacturingOrders, orderSteps, manufacturingSteps, nodePositions, workers]);

  // Set default viewport on component mount
  useEffect(() => {
    if (nodes.length > 0) {
      // Set viewport to focus on the upper-left area where the first card is positioned
      setViewport({ x: 0, y: 0, zoom: 1 });
    }
  }, [nodes.length, setViewport]);

  const [nodesState, setNodes, onNodesChange] = useNodesState(nodes);
  const [edgesState, setEdges, onEdgesChange] = useEdgesState(edges);

  const onNodeDragStop = useCallback(
    (event, node) => {
      updateNodePosition(node.id, node.position);
    },
    [updateNodePosition]
  );

  const onNodeClick = useCallback(
    (event, node) => {
      if (node.type === 'manufacturingOrder') {
        const orderId = node.id.split('-')[1];
        const order = manufacturingOrders.find(order => order.id === orderId);
        if (order) {
          onViewDetails(order);
        }
      }
    },
    [manufacturingOrders, onViewDetails]
  );

  return (
    <div className="h-[800px] w-full border rounded-lg bg-gray-50">
      <ReactFlow
        nodes={nodesState}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView={false}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.5}
        maxZoom={2}
        snapToGrid={true}
        snapGrid={[15, 15]}
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeStrokeColor={(n) => {
            if (n.type === 'manufacturingOrder') return '#3b82f6';
            if (n.type === 'manufacturingStep') return '#10b981';
            return '#6b7280';
          }}
          nodeColor={(n) => {
            if (n.type === 'manufacturingOrder') return '#dbeafe';
            if (n.type === 'manufacturingStep') return '#d1fae5';
            return '#f3f4f6';
          }}
          maskColor="rgb(240, 240, 240, 0.8)"
        />
      </ReactFlow>

      {/* Start Step Dialog */}
      <StartStepDialog
        isOpen={startStepDialogOpen}
        onClose={() => {
          setStartStepDialogOpen(false);
          setSelectedOrderStep(null);
        }}
        order={selectedOrderStep?.order || null}
        step={selectedOrderStep?.step || null}
      />
    </div>
  );
};

const ProductionFlowView = ({ manufacturingOrders, onViewDetails }: ProductionFlowViewProps) => {
  return (
    <ReactFlowProvider>
      <FlowContent manufacturingOrders={manufacturingOrders} onViewDetails={onViewDetails} />
    </ReactFlowProvider>
  );
};

export default ProductionFlowView;
