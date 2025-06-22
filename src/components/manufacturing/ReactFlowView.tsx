
import React, { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Position,
  MarkerType,
  Handle,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, User, Clock, GitBranch, Eye } from 'lucide-react';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import StepDetailsCard from './StepDetailsCard';

interface ReactFlowViewProps {
  manufacturingOrders: any[];
  onViewDetails: (order: any) => void;
}

interface FlowNodeData extends Record<string, unknown> {
  order: any;
  step: any;
  isParent: boolean;
  isChild: boolean;
  parentOrderId?: string;
  childLevel: number;
  onViewDetails: (order: any) => void;
}

const OrderNode: React.FC<{ data: FlowNodeData }> = ({ data }) => {
  const { order, step, isParent, isChild, onViewDetails } = data;
  
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'not_started':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'partially_completed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <>
      {/* Add output handle for connecting to step details */}
      <Handle
        type="source"
        position={Position.Right}
        id="order-output"
        style={{ background: '#3b82f6' }}
      />
      
      <Card className={`w-80 ${isChild ? 'border-l-4 border-l-orange-400 bg-orange-50/30' : 'bg-white'} shadow-sm hover:shadow-md transition-all duration-200`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isChild && <GitBranch className="h-4 w-4 text-orange-600" />}
                <span className={`font-bold text-sm ${isChild ? 'text-orange-700' : 'text-blue-700'}`}>
                  {order.order_number}
                </span>
                {isChild && (
                  <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300">
                    Rework
                  </Badge>
                )}
                {isParent && (
                  <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-300">
                    Parent
                  </Badge>
                )}
              </div>
              <Badge className={`${getPriorityColor(order.priority)} shadow-sm text-xs`}>
                {order.priority?.toUpperCase() || 'MEDIUM'}
              </Badge>
            </div>

            {/* Step Info */}
            {step && (
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-sm font-medium text-gray-800">
                  Step {step.step_order}: {step.step_name}
                </div>
                <Badge className={`${getStatusColor(step.status)} border text-xs mt-1`}>
                  {step.status === 'not_started' ? 'Not Started' : 
                   step.status === 'in_progress' ? 'In Progress' : 
                   step.status === 'partially_completed' ? 'Partial (QC Failed)' :
                   step.status?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            )}

            {/* Product Info */}
            <div className="bg-gray-50 rounded-lg p-2 space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold text-gray-800">{order.product_name}</span>
              </div>
              <div className="text-xs text-gray-600">
                Quantity: {order.quantity_required}
              </div>
            </div>

            {/* Worker Assignment */}
            {step?.workers?.name && (
              <div className="flex items-center gap-2 text-sm bg-blue-50 rounded-lg p-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">Worker:</span>
                <span className="font-semibold text-blue-700">{step.workers.name}</span>
              </div>
            )}

            {/* Timeline */}
            {step?.started_at && (
              <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 rounded px-2 py-1">
                <Clock className="h-3 w-3" />
                Started: {new Date(step.started_at).toLocaleDateString()}
              </div>
            )}

            {/* Action Button */}
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => onViewDetails(order)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

const nodeTypes = {
  orderNode: OrderNode,
  stepDetailsNode: ({ data }: { data: any }) => (
    <StepDetailsCard
      orderStep={data.orderStep}
      stepFields={data.stepFields}
      onViewDetails={data.onViewDetails}
    />
  ),
};

const ReactFlowView: React.FC<ReactFlowViewProps> = ({ manufacturingOrders, onViewDetails }) => {
  const { manufacturingSteps, orderSteps, getStepFields } = useManufacturingSteps();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Generate nodes and edges from manufacturing orders - with stable dependencies
  const { generatedNodes, generatedEdges } = useMemo(() => {
    console.log('🔄 Generating nodes and edges...');
    console.log('Manufacturing Orders:', manufacturingOrders);
    console.log('Order Steps:', orderSteps);
    
    if (!manufacturingOrders?.length || !orderSteps?.length) {
      console.log('⚠️ Missing data, returning empty arrays');
      return { generatedNodes: [], generatedEdges: [] };
    }
    
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Group orders by parent/child relationship
    const parentOrders = manufacturingOrders.filter(order => !order.parent_order_id);
    const childOrders = manufacturingOrders.filter(order => order.parent_order_id);
    
    console.log('Parent Orders:', parentOrders);
    console.log('Child Orders:', childOrders);
    
    let yOffset = 0;
    const nodeSpacing = 400;
    const childOffset = 300;
    const stepCardOffset = 450; // Offset for step details cards

    parentOrders.forEach((parentOrder, parentIndex) => {
      console.log(`Processing parent order: ${parentOrder.order_number}`);
      
      // Get current step for parent order
      const parentOrderSteps = orderSteps.filter(step => 
        String(step.manufacturing_order_id) === String(parentOrder.id)
      );
      console.log(`Parent order steps for ${parentOrder.order_number}:`, parentOrderSteps);
      
      const currentParentStep = parentOrderSteps.length > 0 
        ? parentOrderSteps.sort((a, b) => b.step_order - a.step_order)[0]
        : null;
      
      console.log(`Current parent step for ${parentOrder.order_number}:`, currentParentStep);

      // Create parent node
      const parentNodeId = `parent-${parentOrder.id}`;
      nodes.push({
        id: parentNodeId,
        type: 'orderNode',
        position: { x: 0, y: yOffset },
        data: {
          order: parentOrder,
          step: currentParentStep?.manufacturing_steps ? {
            ...currentParentStep.manufacturing_steps,
            status: currentParentStep.status,
            workers: currentParentStep.workers,
            started_at: currentParentStep.started_at
          } : null,
          isParent: true,
          isChild: false,
          childLevel: 0,
          onViewDetails
        } as FlowNodeData,
      });

      // Add step details card if parent step is in progress OR completed
      if (currentParentStep && (currentParentStep.status === 'in_progress' || currentParentStep.status === 'completed')) {
        console.log(`🎯 Creating step details card for parent order ${parentOrder.order_number}`);
        
        const stepFields = getStepFields(currentParentStep.manufacturing_step_id);
        const stepCardNodeId = `step-details-${currentParentStep.id}`;
        
        console.log(`Step fields for ${parentOrder.order_number}:`, stepFields);
        
        const stepDetailsNode = {
          id: stepCardNodeId,
          type: 'stepDetailsNode',
          position: { x: stepCardOffset, y: yOffset },
          data: {
            orderStep: currentParentStep,
            stepFields: stepFields,
            onViewDetails: () => onViewDetails(parentOrder)
          },
        };
        
        console.log(`Adding step details node:`, stepDetailsNode);
        nodes.push(stepDetailsNode);

        // Create edge from parent to step details with proper handle IDs
        const stepEdge = {
          id: `edge-${parentNodeId}-${stepCardNodeId}`,
          source: parentNodeId,
          target: stepCardNodeId,
          sourceHandle: 'order-output',
          targetHandle: 'step-details-input',
          type: 'smoothstep',
          animated: currentParentStep.status === 'in_progress',
          style: { 
            stroke: currentParentStep.status === 'completed' ? '#10b981' : '#3b82f6', 
            strokeWidth: 2, 
            strokeDasharray: currentParentStep.status === 'in_progress' ? '5,5' : 'none'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: currentParentStep.status === 'completed' ? '#10b981' : '#3b82f6',
          },
          label: currentParentStep.status === 'completed' ? 'Completed' : 'In Progress',
          labelStyle: { 
            fill: currentParentStep.status === 'completed' ? '#10b981' : '#3b82f6', 
            fontWeight: 600,
            fontSize: '12px'
          },
        };
        
        console.log(`Adding step edge:`, stepEdge);
        edges.push(stepEdge);
      }

      // Create child nodes for this parent
      const relatedChildOrders = childOrders.filter(child => 
        String(child.parent_order_id) === String(parentOrder.id)
      );

      relatedChildOrders.forEach((childOrder, childIndex) => {
        console.log(`Processing child order: ${childOrder.order_number}`);
        
        const childOrderSteps = orderSteps.filter(step => 
          String(step.manufacturing_order_id) === String(childOrder.id)
        );
        const currentChildStep = childOrderSteps.length > 0 
          ? childOrderSteps.sort((a, b) => b.step_order - a.step_order)[0]
          : null;

        console.log(`Current child step for ${childOrder.order_number}:`, currentChildStep);

        const childNodeId = `child-${childOrder.id}`;
        const childYOffset = yOffset + ((childIndex + 1) * childOffset);

        nodes.push({
          id: childNodeId,
          type: 'orderNode',
          position: { x: 500, y: childYOffset },
          data: {
            order: childOrder,
            step: currentChildStep?.manufacturing_steps ? {
              ...currentChildStep.manufacturing_steps,
              status: currentChildStep.status,
              workers: currentChildStep.workers,
              started_at: currentChildStep.started_at
            } : null,
            isParent: false,
            isChild: true,
            parentOrderId: parentOrder.id,
            childLevel: 1,
            onViewDetails
          } as FlowNodeData,
        });

        // Add step details card if child step is in progress OR completed
        if (currentChildStep && (currentChildStep.status === 'in_progress' || currentChildStep.status === 'completed')) {
          console.log(`🎯 Creating step details card for child order ${childOrder.order_number}`);
          
          const stepFields = getStepFields(currentChildStep.manufacturing_step_id);
          const childStepCardNodeId = `step-details-${currentChildStep.id}`;
          
          console.log(`Step fields for child ${childOrder.order_number}:`, stepFields);
          
          const childStepDetailsNode = {
            id: childStepCardNodeId,
            type: 'stepDetailsNode',
            position: { x: 500 + stepCardOffset, y: childYOffset },
            data: {
              orderStep: currentChildStep,
              stepFields: stepFields,
              onViewDetails: () => onViewDetails(childOrder)
            },
          };
          
          console.log(`Adding child step details node:`, childStepDetailsNode);
          nodes.push(childStepDetailsNode);

          // Create edge from child to step details with proper handle IDs
          const childStepEdge = {
            id: `edge-${childNodeId}-${childStepCardNodeId}`,
            source: childNodeId,
            target: childStepCardNodeId,
            sourceHandle: 'order-output',
            targetHandle: 'step-details-input',
            type: 'smoothstep',
            animated: currentChildStep.status === 'in_progress',
            style: { 
              stroke: currentChildStep.status === 'completed' ? '#10b981' : '#3b82f6', 
              strokeWidth: 2, 
              strokeDasharray: currentChildStep.status === 'in_progress' ? '5,5' : 'none'
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: currentChildStep.status === 'completed' ? '#10b981' : '#3b82f6',
            },
            label: currentChildStep.status === 'completed' ? 'Completed' : 'In Progress',
            labelStyle: { 
              fill: currentChildStep.status === 'completed' ? '#10b981' : '#3b82f6', 
              fontWeight: 600,
              fontSize: '12px'
            },
          };
          
          console.log(`Adding child step edge:`, childStepEdge);
          edges.push(childStepEdge);
        }

        // Create edge from parent to child (no handles needed for this connection)
        edges.push({
          id: `edge-${parentNodeId}-${childNodeId}`,
          source: parentNodeId,
          target: childNodeId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#f97316', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#f97316',
          },
          label: 'Rework',
          labelStyle: { 
            fill: '#f97316', 
            fontWeight: 600,
            fontSize: '12px'
          },
        });
      });

      // Update yOffset for next parent order group
      yOffset += Math.max(nodeSpacing, (relatedChildOrders.length + 1) * childOffset);
    });

    console.log('🔥 Final generated nodes:', nodes);
    console.log('🔥 Final generated edges:', edges);
    
    return { generatedNodes: nodes, generatedEdges: edges };
  }, [
    JSON.stringify(manufacturingOrders?.map(o => ({ id: o.id, order_number: o.order_number, status: o.status }))),
    JSON.stringify(orderSteps?.map(s => ({ id: s.id, manufacturing_order_id: s.manufacturing_order_id, status: s.status }))),
    manufacturingSteps.length,
    onViewDetails
  ]);

  // Set nodes and edges when they change
  React.useEffect(() => {
    console.log('📊 Setting nodes and edges');
    console.log('Setting nodes:', generatedNodes.length);
    console.log('Setting edges:', generatedEdges.length);
    
    setNodes(generatedNodes);
    setEdges(generatedEdges);
  }, [generatedNodes, generatedEdges, setNodes, setEdges]);

  return (
    <div className="h-[800px] w-full border rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="top-right"
        style={{ backgroundColor: "#F7F9FB" }}
      >
        <Controls />
        <MiniMap 
          zoomable 
          pannable 
          style={{ 
            backgroundColor: "#F7F9FB",
            border: "1px solid #e2e8f0"
          }}
        />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default ReactFlowView;
