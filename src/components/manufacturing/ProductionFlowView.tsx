
import React, { useState } from 'react';
import { ReactFlow, Controls, Background, BackgroundVariant, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface ProductionFlowViewProps {
  manufacturingOrders: any[];
  onViewDetails: (order: any) => void;
}

const ProductionFlowView = ({ manufacturingOrders, onViewDetails }: ProductionFlowViewProps) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  React.useEffect(() => {
    // Group orders by status
    const pendingOrders = manufacturingOrders.filter(order => order.status === 'pending');
    const inProgressOrders = manufacturingOrders.filter(order => order.status === 'in_progress');
    const completedOrders = manufacturingOrders.filter(order => order.status === 'completed');

    const nodeWidth = 280;
    const nodeHeight = 120;
    const columnSpacing = 350;
    const rowSpacing = 140;

    const createNodes = () => {
      const newNodes: Node[] = [];
      let nodeId = 1;

      // Pending column
      pendingOrders.forEach((order, index) => {
        newNodes.push({
          id: `pending-${nodeId}`,
          type: 'default',
          position: { x: 50, y: 100 + index * rowSpacing },
          data: {
            label: (
              <OrderCard 
                order={order} 
                onViewDetails={onViewDetails}
                status="pending"
              />
            )
          },
          style: { width: nodeWidth, height: nodeHeight, border: 'none', background: 'transparent' }
        });
        nodeId++;
      });

      // In Progress column
      inProgressOrders.forEach((order, index) => {
        newNodes.push({
          id: `progress-${nodeId}`,
          type: 'default',
          position: { x: 50 + columnSpacing, y: 100 + index * rowSpacing },
          data: {
            label: (
              <OrderCard 
                order={order} 
                onViewDetails={onViewDetails}
                status="in_progress"
              />
            )
          },
          style: { width: nodeWidth, height: nodeHeight, border: 'none', background: 'transparent' }
        });
        nodeId++;
      });

      // Completed column
      completedOrders.forEach((order, index) => {
        newNodes.push({
          id: `completed-${nodeId}`,
          type: 'default',
          position: { x: 50 + columnSpacing * 2, y: 100 + index * rowSpacing },
          data: {
            label: (
              <OrderCard 
                order={order} 
                onViewDetails={onViewDetails}
                status="completed"
              />
            )
          },
          style: { width: nodeWidth, height: nodeHeight, border: 'none', background: 'transparent' }
        });
        nodeId++;
      });

      // Add column headers
      newNodes.unshift(
        {
          id: 'header-pending',
          type: 'default',
          position: { x: 50, y: 20 },
          data: {
            label: (
              <div className="text-center p-4 bg-orange-100 border-2 border-orange-300 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold text-orange-800">Pending ({pendingOrders.length})</h3>
                </div>
              </div>
            )
          },
          style: { width: nodeWidth, height: 60, border: 'none', background: 'transparent' }
        },
        {
          id: 'header-progress',
          type: 'default',
          position: { x: 50 + columnSpacing, y: 20 },
          data: {
            label: (
              <div className="text-center p-4 bg-blue-100 border-2 border-blue-300 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">In Progress ({inProgressOrders.length})</h3>
                </div>
              </div>
            )
          },
          style: { width: nodeWidth, height: 60, border: 'none', background: 'transparent' }
        },
        {
          id: 'header-completed',
          type: 'default',
          position: { x: 50 + columnSpacing * 2, y: 20 },
          data: {
            label: (
              <div className="text-center p-4 bg-green-100 border-2 border-green-300 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Completed ({completedOrders.length})</h3>
                </div>
              </div>
            )
          },
          style: { width: nodeWidth, height: 60, border: 'none', background: 'transparent' }
        }
      );

      return newNodes;
    };

    setNodes(createNodes());
    setEdges([]); // No edges needed for this kanban-style view
  }, [manufacturingOrders, onViewDetails]);

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
      case 'pending': return 'border-orange-200 bg-orange-50';
      case 'in_progress': return 'border-blue-200 bg-blue-50';
      case 'completed': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="h-[600px] w-full border rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        panOnScroll={true}
        panOnScrollSpeed={0.5}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnDrag={true}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={16} 
          size={1} 
          color="#cbd5e1"
        />
        <Controls 
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
};

const OrderCard = ({ order, onViewDetails, status }: { 
  order: any; 
  onViewDetails: (order: any) => void;
  status: string;
}) => {
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
      case 'pending': return 'border-orange-200 bg-orange-50';
      case 'in_progress': return 'border-blue-200 bg-blue-50';
      case 'completed': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`p-3 border-2 rounded-lg shadow-sm hover:shadow-md transition-shadow ${getStatusColor(status)}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm truncate">{order.order_number}</h4>
          <Badge className={`text-xs px-2 py-0.5 ${getPriorityColor(order.priority)}`}>
            {order.priority}
          </Badge>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-gray-600 font-medium">{order.product_name}</p>
          <p className="text-xs text-gray-500">Qty: {order.quantity_required}</p>
          {order.due_date && (
            <p className="text-xs text-gray-500">
              Due: {new Date(order.due_date).toLocaleDateString()}
            </p>
          )}
        </div>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => onViewDetails(order)}
          className="w-full text-xs h-7 flex items-center gap-1"
        >
          <Eye className="h-3 w-3" />
          View Details
        </Button>
      </div>
    </div>
  );
};

export default ProductionFlowView;
