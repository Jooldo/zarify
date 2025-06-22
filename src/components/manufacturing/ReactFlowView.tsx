
import React, { useCallback, useMemo, useState, useEffect } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, User, Clock, GitBranch, Eye } from 'lucide-react';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';

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
  );
};

const nodeTypes = {
  orderNode: OrderNode,
};

const ReactFlowView: React.FC<ReactFlowViewProps> = ({ manufacturingOrders, onViewDetails }) => {
  const { manufacturingSteps, orderSteps } = useManufacturingSteps();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Generate nodes and edges from manufacturing orders
  const { generatedNodes, generatedEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Group orders by parent/child relationship
    const parentOrders = manufacturingOrders.filter(order => !order.parent_order_id);
    const childOrders = manufacturingOrders.filter(order => order.parent_order_id);
    
    let yOffset = 0;
    const nodeSpacing = 400;
    const childOffset = 300;

    parentOrders.forEach((parentOrder, parentIndex) => {
      // Get current step for parent order
      const parentOrderSteps = orderSteps.filter(step => 
        String(step.manufacturing_order_id) === String(parentOrder.id)
      );
      const currentParentStep = parentOrderSteps.length > 0 
        ? parentOrderSteps.sort((a, b) => b.step_order - a.step_order)[0]
        : null;

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

      // Create child nodes for this parent
      const relatedChildOrders = childOrders.filter(child => 
        String(child.parent_order_id) === String(parentOrder.id)
      );

      relatedChildOrders.forEach((childOrder, childIndex) => {
        const childOrderSteps = orderSteps.filter(step => 
          String(step.manufacturing_order_id) === String(childOrder.id)
        );
        const currentChildStep = childOrderSteps.length > 0 
          ? childOrderSteps.sort((a, b) => b.step_order - a.step_order)[0]
          : null;

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

        // Create edge from parent to child
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

    return { generatedNodes: nodes, generatedEdges: edges };
  }, [manufacturingOrders, orderSteps, onViewDetails]);

  // Update nodes and edges when data changes
  useEffect(() => {
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
