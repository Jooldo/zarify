
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package2, Calendar, Play, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';

interface ProductionFlowViewProps {
  manufacturingOrders: ManufacturingOrder[];
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  onViewDetails: (order: ManufacturingOrder) => void;
}

// Custom node component for manufacturing orders
const ManufacturingOrderNode: React.FC<NodeProps<ManufacturingOrder>> = ({ data }) => {
  const { manufacturingSteps, orderSteps } = useManufacturingSteps();
  
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
      case 'qc_failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStep = () => {
    const currentOrderSteps = orderSteps.filter(step => step.manufacturing_order_id === data.id);
    
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
  const hasStarted = orderSteps.some(step => step.manufacturing_order_id === data.id && step.status !== 'pending');

  return (
    <Card className="w-80 hover:shadow-lg transition-shadow">
      <Handle type="target" position={Position.Left} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">{data.product_name}</CardTitle>
            <p className="text-xs text-gray-600 font-mono">{data.order_number}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Badge className={`text-xs ${getPriorityColor(data.priority)}`}>
              {data.priority}
            </Badge>
            <Badge className={`text-xs ${getStatusColor(data.status)}`}>
              {data.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Package2 className="h-3 w-3 text-gray-500" />
            <span className="text-xs">Qty: <span className="font-semibold">{data.quantity_required}</span></span>
          </div>
          
          {data.due_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-gray-500" />
              <span className="text-xs">Due: {format(new Date(data.due_date), 'MMM dd')}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs h-7"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          
          {nextStep && !hasStarted && (
            <Button 
              size="sm" 
              className="flex-1 text-xs h-7 bg-primary hover:bg-primary/90"
            >
              <Play className="h-3 w-3 mr-1" />
              Start
            </Button>
          )}
        </div>
      </CardContent>
      <Handle type="source" position={Position.Right} />
    </Card>
  );
};

const nodeTypes = {
  manufacturingOrder: ManufacturingOrderNode,
};

const ProductionFlowView: React.FC<ProductionFlowViewProps> = ({
  manufacturingOrders,
  getPriorityColor,
  getStatusColor,
  onViewDetails
}) => {
  // Convert manufacturing orders to React Flow nodes
  const initialNodes: Node<ManufacturingOrder>[] = useMemo(() => {
    const pendingOrders = manufacturingOrders.filter(order => order.status === 'pending');
    const inProgressOrders = manufacturingOrders.filter(order => order.status === 'in_progress');
    const completedOrders = manufacturingOrders.filter(order => order.status === 'completed');

    const nodes: Node<ManufacturingOrder>[] = [];
    
    // Layout pending orders in first column
    pendingOrders.forEach((order, index) => {
      nodes.push({
        id: `pending-${order.id}`,
        type: 'manufacturingOrder',
        position: { x: 50, y: 50 + index * 250 },
        data: order,
      });
    });

    // Layout in-progress orders in second column
    inProgressOrders.forEach((order, index) => {
      nodes.push({
        id: `progress-${order.id}`,
        type: 'manufacturingOrder',
        position: { x: 400, y: 50 + index * 250 },
        data: order,
      });
    });

    // Layout completed orders in third column
    completedOrders.forEach((order, index) => {
      nodes.push({
        id: `completed-${order.id}`,
        type: 'manufacturingOrder',
        position: { x: 750, y: 50 + index * 250 },
        data: order,
      });
    });

    return nodes;
  }, [manufacturingOrders]);

  const initialEdges: Edge[] = useMemo(() => {
    // Create simple flow edges between status columns
    return [];
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => [...eds]),
    [setEdges]
  );

  return (
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
        <Background variant="dots" gap={20} size={1} color="#e2e8f0" />
      </ReactFlow>
    </div>
  );
};

export default ProductionFlowView;
