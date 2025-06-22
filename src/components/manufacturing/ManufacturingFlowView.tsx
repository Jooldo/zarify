
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, User, Clock, GitBranch, Eye, Play, Wrench, ArrowRight } from 'lucide-react';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import StartStepDialog from './StartStepDialog';
import CreateChildOrderDialog from './CreateChildOrderDialog';

interface ManufacturingFlowViewProps {
  manufacturingOrders: any[];
  onViewDetails: (order: any) => void;
}

interface FlowNodeData extends Record<string, unknown> {
  order?: any;
  step?: any;
  orderStep?: any;
  worker?: string;
  quantity?: number;
  isOrder?: boolean;
  isStep?: boolean;
  stepName?: string;
  status?: string;
  onViewDetails?: (order: any) => void;
  onStartStep?: (order: any, step: any) => void;
  onCreateRework?: (order: any, step: any) => void;
}

// Manufacturing Order Node Component
const ManufacturingOrderNode: React.FC<{ data: FlowNodeData }> = ({ data }) => {
  const { order, onViewDetails, onStartStep } = data;
  const [showStartDialog, setShowStartDialog] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'in_progress': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'bg-red-50 text-red-600 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'medium': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'low': return 'bg-green-50 text-green-600 border-green-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <>
      <Handle
        type="source"
        position={Position.Right}
        id="order-output"
        style={{ background: '#6b7280', border: 'none', width: 8, height: 8 }}
      />
      
      <Card className="w-80 shadow-sm border bg-white hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-800">
              {order.order_number}
            </CardTitle>
            <Badge className={`${getPriorityColor(order.priority)} text-xs border`}>
              {order.priority?.toUpperCase() || 'MEDIUM'}
            </Badge>
          </div>
          <Badge className={`${getStatusColor(order.status)} border text-xs w-fit`}>
            {order.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <div className="flex items-center gap-2 text-sm mb-1">
              <Package className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-700">{order.product_name}</span>
            </div>
            <div className="text-xs text-slate-500">
              Qty Required: {order.quantity_required}
            </div>
          </div>

          {order.due_date && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-blue-50 rounded px-2 py-1">
              <Clock className="h-3 w-3" />
              Due: {new Date(order.due_date).toLocaleDateString()}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={() => onViewDetails?.(order)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Details
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setShowStartDialog(true)}
            >
              <Play className="h-4 w-4 mr-1" />
              Start Jalai
            </Button>
          </div>
        </CardContent>
      </Card>

      {showStartDialog && (
        <StartStepDialog
          isOpen={showStartDialog}
          onClose={() => setShowStartDialog(false)}
          manufacturingOrder={order}
          stepName="Jalai"
        />
      )}
    </>
  );
};

// Step Instance Node Component
const StepInstanceNode: React.FC<{ data: FlowNodeData }> = ({ data }) => {
  const { orderStep, worker, quantity, stepName, status, onViewDetails, onCreateRework } = data;
  const [showReworkDialog, setShowReworkDialog] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'partially_completed': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const canCreateRework = status === 'partially_completed' || status === 'completed';
  const canProgress = status === 'completed' || status === 'partially_completed';

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        id="step-input"
        style={{ background: '#3b82f6', border: 'none', width: 8, height: 8 }}
      />
      
      <Handle
        type="source"
        position={Position.Right}
        id="step-output-main"
        style={{ 
          background: status === 'completed' ? '#10b981' : '#3b82f6', 
          border: 'none', 
          width: 8, 
          height: 8,
          top: '40%'
        }}
      />
      
      {canCreateRework && (
        <Handle
          type="source"
          position={Position.Right}
          id="step-output-rework"
          style={{ 
            background: '#f97316', 
            border: 'none', 
            width: 8, 
            height: 8,
            top: '60%'
          }}
        />
      )}
      
      <Card className={`w-72 border-l-4 ${
        status === 'partially_completed' 
          ? 'border-l-orange-400 bg-gradient-to-r from-orange-50/30 to-white' 
          : status === 'completed'
          ? 'border-l-emerald-400 bg-gradient-to-r from-emerald-50/30 to-white'
          : 'border-l-blue-400 bg-gradient-to-r from-blue-50/30 to-white'
      } hover:shadow-md transition-shadow shadow-sm`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-sm font-medium text-slate-700">
                {stepName}
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Qty: {quantity}
              </p>
            </div>
            <Badge className={`text-xs border ${getStatusColor(status)}`}>
              {status === 'partially_completed' ? 'PARTIAL' : status?.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {worker && (
            <div className="flex items-center gap-2 text-xs p-2 rounded-md border bg-blue-50 border-blue-100">
              <User className="h-3 w-3 text-blue-500" />
              <span className="text-slate-600">Worker:</span>
              <span className="font-medium text-blue-700">{worker}</span>
            </div>
          )}

          {orderStep?.started_at && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded px-2 py-1">
              <Clock className="h-3 w-3" />
              Started: {new Date(orderStep.started_at).toLocaleDateString()}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs px-2 py-1 h-7"
              onClick={() => onViewDetails?.(orderStep)}
            >
              <Eye className="h-3 w-3 mr-1" />
              Details
            </Button>
            
            {canProgress && (
              <Button
                size="sm"
                className="text-xs px-2 py-1 h-7 bg-green-600 hover:bg-green-700 text-white"
              >
                <ArrowRight className="h-3 w-3 mr-1" />
                Next
              </Button>
            )}
            
            {canCreateRework && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs px-2 py-1 h-7 border-orange-200 text-orange-600 hover:bg-orange-50"
                onClick={() => setShowReworkDialog(true)}
              >
                <Wrench className="h-3 w-3 mr-1" />
                Rework
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showReworkDialog && (
        <CreateChildOrderDialog
          isOpen={showReworkDialog}
          onClose={() => setShowReworkDialog(false)}
          parentOrder={data.order}
          reworkFromStep={orderStep?.manufacturing_steps?.step_order}
        />
      )}
    </>
  );
};

const nodeTypes = {
  manufacturingOrder: ManufacturingOrderNode,
  stepInstance: StepInstanceNode,
};

const ManufacturingFlowView: React.FC<ManufacturingFlowViewProps> = ({ 
  manufacturingOrders, 
  onViewDetails 
}) => {
  const { manufacturingSteps, orderSteps } = useManufacturingSteps();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Generate nodes and edges based on manufacturing orders and steps
  const { generatedNodes, generatedEdges } = useMemo(() => {
    console.log('🏭 Generating manufacturing flow...');
    
    if (!manufacturingOrders?.length) {
      return { generatedNodes: [], generatedEdges: [] };
    }
    
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Separate parent and child orders
    const parentOrders = manufacturingOrders.filter(order => !order.parent_order_id);
    const childOrders = manufacturingOrders.filter(order => order.parent_order_id);
    
    let currentY = 50;
    const verticalSpacing = 400;
    const horizontalSpacing = 450;
    
    parentOrders.forEach((parentOrder, parentIndex) => {
      console.log(`📋 Processing order: ${parentOrder.order_number}`);
      
      // Create manufacturing order node
      const orderNodeId = `order-${parentOrder.id}`;
      const orderPosition = { x: 50, y: currentY };
      
      nodes.push({
        id: orderNodeId,
        type: 'manufacturingOrder',
        position: orderPosition,
        data: {
          order: parentOrder,
          isOrder: true,
          onViewDetails,
        } as FlowNodeData,
      });

      // Get all steps for this order
      const parentOrderSteps = orderSteps.filter(step => 
        String(step.manufacturing_order_id) === String(parentOrder.id)
      ).sort((a, b) => (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0));

      // Create step instance nodes
      let stepX = orderPosition.x + horizontalSpacing;
      let maxStepY = currentY;
      
      parentOrderSteps.forEach((orderStep, stepIndex) => {
        const stepNodeId = `step-${orderStep.id}`;
        const stepPosition = { x: stepX, y: currentY };
        
        // Create step instance node
        nodes.push({
          id: stepNodeId,
          type: 'stepInstance',
          position: stepPosition,
          data: {
            orderStep,
            order: parentOrder,
            worker: orderStep.workers?.name || 'Unassigned',
            quantity: parentOrder.quantity_required, // This should be from step assignment
            stepName: orderStep.manufacturing_steps?.step_name || 'Unknown Step',
            status: orderStep.status,
            isStep: true,
            onViewDetails,
          } as FlowNodeData,
        });

        // Create edge from previous node to this step
        const sourceNodeId = stepIndex === 0 ? orderNodeId : `step-${parentOrderSteps[stepIndex - 1].id}`;
        const sourceHandle = stepIndex === 0 ? 'order-output' : 'step-output-main';
        
        edges.push({
          id: `edge-${sourceNodeId}-${stepNodeId}`,
          source: sourceNodeId,
          target: stepNodeId,
          sourceHandle,
          targetHandle: 'step-input',
          type: 'smoothstep',
          animated: orderStep.status === 'in_progress',
          style: { 
            stroke: orderStep.status === 'completed' ? '#10b981' : '#3b82f6', 
            strokeWidth: 2 
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: orderStep.status === 'completed' ? '#10b981' : '#3b82f6',
          },
        });

        stepX += horizontalSpacing;
        maxStepY = Math.max(maxStepY, stepPosition.y);
      });

      // Handle child orders (rework)
      const relatedChildOrders = childOrders.filter(child => 
        String(child.parent_order_id) === String(parentOrder.id)
      );

      relatedChildOrders.forEach((childOrder, childIndex) => {
        const childY = currentY + 200 + (childIndex * 150);
        maxStepY = Math.max(maxStepY, childY);
        
        // Create child order node
        const childNodeId = `child-order-${childOrder.id}`;
        nodes.push({
          id: childNodeId,
          type: 'manufacturingOrder',
          position: { x: 50, y: childY },
          data: {
            order: childOrder,
            isOrder: true,
            onViewDetails,
          } as FlowNodeData,
        });

        // Create rework edge from parent step to child order
        if (childOrder.rework_from_step) {
          const sourceStep = parentOrderSteps.find(step => 
            step.manufacturing_steps?.step_order === childOrder.rework_from_step
          );
          
          if (sourceStep) {
            edges.push({
              id: `rework-edge-${sourceStep.id}-${childOrder.id}`,
              source: `step-${sourceStep.id}`,
              target: childNodeId,
              sourceHandle: 'step-output-rework',
              targetHandle: 'order-input',
              type: 'smoothstep',
              animated: true,
              style: { 
                stroke: '#f97316', 
                strokeWidth: 3,
                strokeDasharray: '8,4'
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#f97316',
              },
              label: `Rework (${childOrder.quantity_required})`,
              labelStyle: { 
                fill: '#f97316', 
                fontWeight: 600,
                fontSize: '11px'
              },
            });
          }
        }

        // Handle child order steps
        const childOrderSteps = orderSteps.filter(step => 
          String(step.manufacturing_order_id) === String(childOrder.id)
        ).sort((a, b) => (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0));

        let childStepX = 50 + horizontalSpacing;
        
        childOrderSteps.forEach((childStep, childStepIndex) => {
          const childStepNodeId = `child-step-${childStep.id}`;
          
          nodes.push({
            id: childStepNodeId,
            type: 'stepInstance',
            position: { x: childStepX, y: childY },
            data: {
              orderStep: childStep,
              order: childOrder,
              worker: childStep.workers?.name || 'Unassigned',
              quantity: childOrder.quantity_required,
              stepName: childStep.manufacturing_steps?.step_name || 'Unknown Step',
              status: childStep.status,
              isStep: true,
              onViewDetails,
            } as FlowNodeData,
          });

          // Create edge for child steps
          const childSourceId = childStepIndex === 0 ? childNodeId : `child-step-${childOrderSteps[childStepIndex - 1].id}`;
          const childSourceHandle = childStepIndex === 0 ? 'order-output' : 'step-output-main';
          
          edges.push({
            id: `child-edge-${childSourceId}-${childStepNodeId}`,
            source: childSourceId,
            target: childStepNodeId,
            sourceHandle: childSourceHandle,
            targetHandle: 'step-input',
            type: 'smoothstep',
            animated: childStep.status === 'in_progress',
            style: { 
              stroke: childStep.status === 'completed' ? '#10b981' : '#f97316', 
              strokeWidth: 2 
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: childStep.status === 'completed' ? '#10b981' : '#f97316',
            },
          });

          childStepX += horizontalSpacing;
        });
      });

      currentY = maxStepY + verticalSpacing;
    });

    console.log(`✅ Generated ${nodes.length} nodes and ${edges.length} edges`);
    return { generatedNodes: nodes, generatedEdges: edges };
  }, [
    manufacturingOrders,
    orderSteps,
    manufacturingSteps,
    onViewDetails
  ]);

  React.useEffect(() => {
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
        style={{ backgroundColor: "#FAFBFC" }}
      >
        <Controls />
        <MiniMap 
          zoomable 
          pannable 
          style={{ 
            backgroundColor: "#FAFBFC",
            border: "1px solid #e2e8f0"
          }}
        />
        <Background color="#E2E8F0" gap={20} size={1} />
      </ReactFlow>
    </div>
  );
};

export default ManufacturingFlowView;
