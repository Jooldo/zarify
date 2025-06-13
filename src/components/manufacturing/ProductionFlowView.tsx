import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Node,
  Edge,
  MiniMap,
  OnNodesChange,
  OnEdgesChange,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { StepCardNode } from './StepCardNode';
import { initialNodes } from './initial-nodes';
import { initialEdges } from './initial-edges';
import { StepCardData } from './ManufacturingStepCard';
import { ManufacturingStep, ManufacturingOrderStep, ManufacturingStepField } from '@/hooks/useManufacturingSteps';

interface ManufacturingOrder {
  id: string;
  order_number: string;
  product_name: string;
  status: string;
  quantity_required: number;
  priority: string;
  due_date: string;
}

interface ProductionFlowViewProps {
  manufacturingOrders: ManufacturingOrder[];
  manufacturingSteps: ManufacturingStep[];
  orderSteps: ManufacturingOrderStep[];
  stepFields: ManufacturingStepField[];
  onAddStep?: (stepData: StepCardData) => void;
}

const ProductionFlowView: React.FC<ProductionFlowViewProps> = ({ 
  manufacturingOrders, 
  manufacturingSteps, 
  orderSteps,
  stepFields,
  onAddStep 
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const nodeTypes: NodeTypes = useMemo(() => ({
    stepCard: StepCardNode,
  }), []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const createFlowEdges = useCallback(() => {
    const edges: Edge[] = [];

    manufacturingOrders.forEach(order => {
      const activeSteps = manufacturingSteps
        .filter(step => step.is_active)
        .sort((a, b) => a.step_order - b.step_order);

      activeSteps.forEach((step, stepIndex) => {
        if (stepIndex === 0) {
          // Connect Manufacturing Order to the first step
          edges.push({
            id: `edge-order-${order.id}-to-${step.id}`,
            source: `order-${order.id}`,
            target: `step-${order.id}-${step.id}`,
            type: 'smoothstep',
            animated: true,
          });
        } else {
          // Connect previous step to current step
          const previousStep = activeSteps[stepIndex - 1];
          edges.push({
            id: `edge-${previousStep.id}-to-${step.id}`,
            source: `step-${order.id}-${previousStep.id}`,
            target: `step-${order.id}-${step.id}`,
            type: 'smoothstep',
            animated: true,
          });
        }
      });
    });

    return edges;
  }, [manufacturingOrders, manufacturingSteps]);

  const createFlowNodes = useCallback(() => {
    console.log('Creating flow nodes with data:', {
      manufacturingOrders: manufacturingOrders.length,
      manufacturingSteps: manufacturingSteps.length,
      orderSteps: orderSteps.length
    });

    const nodes: Node[] = [];
    const verticalSpacing = 200; // Increased spacing to prevent overlap
    const horizontalSpacing = 320; // Increased horizontal spacing for wider cards
    let currentY = 50;

    manufacturingOrders.forEach((order, orderIndex) => {
      console.log(`Processing order ${order.id}:`, order);
      
      // Create Manufacturing Order node
      const orderNodeData: StepCardData = {
        stepName: 'Manufacturing Order',
        stepOrder: 0,
        orderId: order.id,
        orderNumber: order.order_number,
        productName: order.product_name,
        status: order.status as 'pending' | 'in_progress' | 'completed' | 'blocked',
        progress: 0,
        quantityRequired: order.quantity_required,
        priority: order.priority,
        dueDate: order.due_date,
        manufacturingStepId: undefined
      };

      const orderNode: Node = {
        id: `order-${order.id}`,
        type: 'stepCard',
        position: { x: 50, y: currentY },
        data: orderNodeData,
      };

      nodes.push(orderNode);

      // Create step nodes for this order
      const activeSteps = manufacturingSteps
        .filter(step => step.is_active)
        .sort((a, b) => a.step_order - b.step_order);

      console.log(`Active steps for order ${order.id}:`, activeSteps);

      activeSteps.forEach((step, stepIndex) => {
        // Get step fields for this step
        const stepFieldsForStep = stepFields.filter(field => 
          field.manufacturing_step_id === step.id
        );

        console.log(`Step fields for step ${step.id}:`, stepFieldsForStep);

        // Check if this step exists in orderSteps for this order
        const orderStep = orderSteps.find(os => 
          os.manufacturing_order_id === order.id && 
          os.manufacturing_step_id === step.id
        );

        console.log(`Order step for ${order.id} - ${step.id}:`, orderStep);

        const stepNodeData: StepCardData = {
          stepName: step.step_name,
          stepOrder: step.step_order,
          orderId: order.id,
          orderNumber: order.order_number,
          productName: order.product_name,
          status: orderStep?.status as 'pending' | 'in_progress' | 'completed' | 'blocked' || 'pending',
          progress: orderStep?.progress_percentage || 0,
          estimatedDuration: step.estimated_duration_hours,
          qcRequired: step.qc_required,
          stepFields: stepFieldsForStep, // Pass step fields to the card
          manufacturingStepId: step.id
        };

        const stepNode: Node = {
          id: `step-${order.id}-${step.id}`,
          type: 'stepCard',
          position: { x: 50 + (stepIndex + 1) * horizontalSpacing, y: currentY },
          data: stepNodeData,
        };

        nodes.push(stepNode);
      });

      currentY += verticalSpacing;
    });

    return nodes;
  }, [manufacturingOrders, manufacturingSteps, orderSteps, stepFields]);

  const onNodesChangeMemo: OnNodesChange = useCallback(
    (changes) => {
      setNodes((prevNodes) =>
        changes.reduce((acc, change) => {
          switch (change.type) {
            case 'dimensions':
              return acc.map((node) => {
                if (node.id === change.id) {
                  return { ...node, ...change };
                }
                return node;
              });
            case 'position':
              return acc.map((node) => {
                if (node.id === change.id) {
                  return { ...node, position: change.position };
                }
                return node;
              });
            case 'select':
              return acc.map((node) => {
                if (node.id === change.id) {
                  return { ...node, selected: change.selected };
                }
                return node;
              });
            case 'remove':
              return acc.filter((node) => node.id !== change.id);
            case 'reset':
              return initialNodes;
            case 'add':
              return [...acc, change.node];
          }
          return acc;
        }, prevNodes)
      );
    },
    [setNodes]
  );

  const onEdgesChangeMemo: OnEdgesChange = useCallback(
    (changes) => {
      setEdges((prevEdges) =>
        changes.reduce((acc, change) => {
          switch (change.type) {
            case 'add':
              return [...acc, change.edge];
            case 'remove':
              return acc.filter((edge) => edge.id !== change.id);
            case 'reset':
              return initialEdges;
            case 'update':
              return acc.map((edge) => {
                if (edge.id === change.id) {
                  return { ...edge, ...change.data };
                }
                return edge;
              });
          }
          return acc;
        }, prevEdges)
      );
    },
    [setEdges]
  );

  const nodes = useMemo(() => createFlowNodes(), [createFlowNodes]);
  const edges = useMemo(() => createFlowEdges(), [createFlowEdges]);

  return (
    <div className="h-[calc(100vh-200px)] w-full bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeMemo}
        onEdgesChange={onEdgesChangeMemo}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ 
          padding: 0.1,
          minZoom: 0.5,
          maxZoom: 1.5
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.3}
        maxZoom={2}
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            if (node.data?.isJhalaiStep) return '#3b82f6';
            return '#64748b';
          }}
          nodeStrokeWidth={2}
          className="bg-white border border-gray-200"
        />
      </ReactFlow>
    </div>
  );
};

export default ProductionFlowView;
