
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
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, User, Clock, GitBranch, Eye, Calendar, CheckCircle2, Weight, Hash, Type, Play, Wrench } from 'lucide-react';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useWorkers } from '@/hooks/useWorkers';
import EnhancedStepNode from './EnhancedStepNode';
import CreateChildOrderDialog from './CreateChildOrderDialog';
import StartStepDialog from './StartStepDialog';
import { 
  optimizeBranchLayout, 
  calculateBranchPositions, 
  detectStepBranches,
  DEFAULT_MULTI_BRANCH_CONFIG,
  BranchInfo,
  LayoutPosition 
} from '@/utils/multiBranchLayoutUtils';

interface MultiBranchReactFlowViewProps {
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
  branches?: BranchInfo[];
  onViewDetails: (order: any) => void;
}

const OrderNode: React.FC<{ data: FlowNodeData }> = ({ data }) => {
  const { order, step, isParent, isChild, onViewDetails } = data;
  
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'not_started':
        return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'partially_completed':
        return 'bg-orange-50 text-orange-600 border-orange-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
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
      
      <Handle
        type="target"
        position={Position.Top}
        id="order-rework-input"
        style={{ background: '#f97316', border: 'none', width: 8, height: 8 }}
      />
      
      <Card className={`w-72 shadow-sm border transition-all duration-200 ${
        isChild 
          ? 'border-l-4 border-l-orange-300 bg-gradient-to-r from-orange-50/50 to-white hover:shadow-md' 
          : 'bg-white hover:shadow-md'
      }`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isChild && <GitBranch className="h-4 w-4 text-orange-500" />}
                <span className={`font-medium text-sm ${isChild ? 'text-orange-700' : 'text-slate-700'}`}>
                  {order.order_number}
                </span>
                {isChild && (
                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">
                    Rework
                  </Badge>
                )}
                {isParent && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                    Parent
                  </Badge>
                )}
              </div>
              <Badge className={`${getPriorityColor(order.priority)} text-xs border`}>
                {order.priority?.toUpperCase() || 'MEDIUM'}
              </Badge>
            </div>

            {step && (
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="text-sm font-medium text-slate-700 mb-1">
                  Step {step.step_order}: {step.step_name}
                </div>
                <Badge className={`${getStatusColor(step.status)} border text-xs`}>
                  {step.status === 'not_started' ? 'Not Started' : 
                   step.status === 'in_progress' ? 'In Progress' : 
                   step.status === 'partially_completed' ? 'Partially Completed' :
                   step.status?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            )}

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="flex items-center gap-2 text-sm mb-1">
                <Package className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-slate-700">{order.product_name}</span>
              </div>
              <div className="text-xs text-slate-500">
                Qty: {order.quantity_required}
              </div>
            </div>

            {step?.workers?.name && (
              <div className="flex items-center gap-2 text-sm bg-blue-50 rounded-lg p-2 border border-blue-100">
                <User className="h-4 w-4 text-blue-500" />
                <span className="text-slate-600">Worker:</span>
                <span className="font-medium text-blue-600">{step.workers.name}</span>
              </div>
            )}

            {step?.started_at && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded px-2 py-1">
                <Clock className="h-3 w-3" />
                Started: {new Date(step.started_at).toLocaleDateString()}
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
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
  enhancedStepNode: EnhancedStepNode,
};

const MultiBranchReactFlowView: React.FC<MultiBranchReactFlowViewProps> = ({ manufacturingOrders, onViewDetails }) => {
  const { manufacturingSteps, orderSteps, getStepFields } = useManufacturingSteps();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const { generatedNodes, generatedEdges } = useMemo(() => {
    console.log('🔄 Generating multi-branch nodes and edges...');
    console.log('Manufacturing Orders:', manufacturingOrders);
    console.log('Order Steps:', orderSteps);
    
    if (!manufacturingOrders?.length || !orderSteps?.length) {
      console.log('⚠️ Missing data, returning empty arrays');
      return { generatedNodes: [], generatedEdges: [] };
    }
    
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    const parentOrders = manufacturingOrders.filter(order => !order.parent_order_id);
    const childOrders = manufacturingOrders.filter(order => order.parent_order_id);
    
    // Create maps for efficient lookups
    const childOrdersMap = new Map<string, any[]>();
    const stepBranchesMap = new Map<string, BranchInfo[]>();
    
    parentOrders.forEach(parentOrder => {
      const relatedChildOrders = childOrders.filter(child => 
        String(child.parent_order_id) === String(parentOrder.id)
      );
      childOrdersMap.set(parentOrder.id, relatedChildOrders);
    });

    // Detect branches for all steps
    orderSteps.forEach(orderStep => {
      const branches = detectStepBranches(orderStep, orderSteps, manufacturingOrders, manufacturingSteps);
      if (branches.length > 0) {
        stepBranchesMap.set(orderStep.id, branches);
      }
    });
    
    // Optimize layout positions for multi-branch support
    const optimizedPositions = optimizeBranchLayout(
      parentOrders, 
      childOrdersMap, 
      stepBranchesMap, 
      DEFAULT_MULTI_BRANCH_CONFIG
    );
    
    console.log('📍 Multi-branch optimized positions:', optimizedPositions);
    console.log('🌳 Step branches map:', stepBranchesMap);

    parentOrders.forEach((parentOrder, parentIndex) => {
      console.log(`Processing parent order: ${parentOrder.order_number}`);
      
      const parentOrderSteps = orderSteps.filter(step => 
        String(step.manufacturing_order_id) === String(parentOrder.id)
      );
      
      const currentParentStep = parentOrderSteps.length > 0 
        ? parentOrderSteps
            .sort((a, b) => b.step_order - a.step_order)
            .find(step => step.status === 'in_progress') || 
          parentOrderSteps.sort((a, b) => b.step_order - a.step_order)[0]
        : null;

      const parentNodeId = `parent-${parentOrder.id}`;
      const parentPosition = optimizedPositions.get(parentNodeId) || { x: 50, y: 50 + (parentIndex * 600) };
      
      nodes.push({
        id: parentNodeId,
        type: 'orderNode',
        position: parentPosition,
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

      const stepsToShow = parentOrderSteps.filter(step => 
        step.status === 'in_progress' || step.status === 'completed' || step.status === 'partially_completed'
      ).sort((a, b) => a.step_order - b.step_order);

      let previousNodeId = parentNodeId;

      stepsToShow.forEach((step, stepIndex) => {
        console.log(`🎯 Creating enhanced step node for parent order ${parentOrder.order_number}, step ${step.step_order}`);
        
        const stepFields = getStepFields(step.manufacturing_step_id);
        const stepCardNodeId = `step-details-${step.id}`;
        const stepBranches = stepBranchesMap.get(step.id) || [];
        
        // Base position for the step
        const baseStepPosition = {
          x: parentPosition.x + 450 + (stepIndex * 500),
          y: parentPosition.y
        };

        // If there are branches, adjust positions accordingly
        let stepPosition = baseStepPosition;
        if (stepBranches.length > 1) {
          // For multi-branch steps, calculate branch positions
          const branchPositions = calculateBranchPositions(baseStepPosition, stepBranches, stepIndex);
          console.log(`Multi-branch positions for step ${step.id}:`, branchPositions);
        }
        
        const stepDetailsNode = {
          id: stepCardNodeId,
          type: 'enhancedStepNode',
          position: stepPosition,
          data: {
            orderStep: step,
            stepFields: stepFields,
            order: parentOrder,
            branches: stepBranches,
            manufacturingOrders: manufacturingOrders,
            onViewDetails: () => onViewDetails(parentOrder)
          },
        };
        
        console.log(`Adding enhanced step node:`, stepDetailsNode);
        nodes.push(stepDetailsNode);

        // Create edge from previous node to this step
        const edgeColor = step.status === 'partially_completed' ? '#f97316' : 
                         step.status === 'completed' ? '#10b981' : '#3b82f6';
        const edgeLabel = step.status === 'partially_completed' ? 'Partially Completed' :
                         step.status === 'completed' ? 'Completed' : 'In Progress';
        
        const stepEdge = {
          id: `edge-${previousNodeId}-${stepCardNodeId}`,
          source: previousNodeId,
          target: stepCardNodeId,
          sourceHandle: stepIndex === 0 ? 'order-output' : 'step-output-main',
          targetHandle: 'step-details-input',
          type: 'smoothstep',
          animated: step.status === 'in_progress' || step.status === 'partially_completed',
          style: { 
            stroke: edgeColor, 
            strokeWidth: 2, 
            strokeDasharray: step.status === 'in_progress' ? '5,5' : 
                           step.status === 'partially_completed' ? '8,4,2,4' : 'none'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgeColor,
          },
          label: edgeLabel,
          labelStyle: { 
            fill: edgeColor, 
            fontWeight: 500,
            fontSize: '11px'
          },
        };
        
        edges.push(stepEdge);

        // Create branch edges
        stepBranches.forEach((branch, branchIndex) => {
          const branchEdgeColor = branch.type === 'rework' ? '#f97316' : 
                                 branch.type === 'qc' ? '#eab308' : '#10b981';
          const branchEdgeStyle = branch.type === 'rework' ? '10,5' : 
                                 branch.type === 'qc' ? '2,2' : 'none';
          
          const branchEdge = {
            id: `branch-edge-${stepCardNodeId}-${branch.targetNodeId}`,
            source: stepCardNodeId,
            target: branch.targetNodeId,
            sourceHandle: `step-output-${branch.id}`,
            targetHandle: branch.type === 'rework' ? 'order-rework-input' : 'step-details-input',
            type: 'smoothstep',
            animated: true,
            style: { 
              stroke: branchEdgeColor, 
              strokeWidth: 3, 
              strokeDasharray: branchEdgeStyle
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: branchEdgeColor,
            },
            label: branch.label + (branch.quantity ? ` (${branch.quantity})` : ''),
            labelStyle: { 
              fill: branchEdgeColor, 
              fontWeight: 600,
              fontSize: '12px',
              backgroundColor: 'white',
              padding: '4px 8px',
              borderRadius: '4px'
            },
            labelBgStyle: {
              fill: 'white',
              fillOpacity: 0.95,
              rx: 4,
              ry: 4
            }
          };
          
          console.log(`✅ Adding branch edge from ${stepCardNodeId} to ${branch.targetNodeId}`);
          edges.push(branchEdge);
        });

        previousNodeId = stepCardNodeId;
      });

      // Handle child orders (rework orders)
      const relatedChildOrders = childOrdersMap.get(parentOrder.id) || [];

      relatedChildOrders.forEach((childOrder, childIndex) => {
        console.log(`🔄 Processing child order: ${childOrder.order_number}`);
        
        const childOrderSteps = orderSteps.filter(step => 
          String(step.manufacturing_order_id) === String(childOrder.id)
        );
        const currentChildStep = childOrderSteps.length > 0 
          ? childOrderSteps
              .sort((a, b) => b.step_order - a.step_order)
              .find(step => step.status === 'in_progress') || 
            childOrderSteps.sort((a, b) => b.step_order - a.step_order)[0]
          : null;

        const childNodeId = `child-${childOrder.id}`;
        const childPosition = optimizedPositions.get(childNodeId) || {
          x: parentPosition.x + 100,
          y: parentPosition.y + ((childIndex + 1) * 400)
        };

        nodes.push({
          id: childNodeId,
          type: 'orderNode',
          position: childPosition,
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

        // Process child order steps
        const childStepsToShow = childOrderSteps.filter(step => 
          step.status === 'in_progress' || step.status === 'completed' || step.status === 'partially_completed'
        ).sort((a, b) => a.step_order - b.step_order);

        let previousChildNodeId = childNodeId;

        childStepsToShow.forEach((childStep, childStepIndex) => {
          const stepFields = getStepFields(childStep.manufacturing_step_id);
          const childStepCardNodeId = `step-details-${childStep.id}`;
          const childStepBranches = stepBranchesMap.get(childStep.id) || [];
          
          const childStepPosition = {
            x: childPosition.x + 450 + (childStepIndex * 500),
            y: childPosition.y
          };
          
          const childStepDetailsNode = {
            id: childStepCardNodeId,
            type: 'enhancedStepNode',
            position: childStepPosition,
            data: {
              orderStep: childStep,
              stepFields: stepFields,
              order: childOrder,
              branches: childStepBranches,
              manufacturingOrders: manufacturingOrders,
              onViewDetails: () => onViewDetails(childOrder)
            },
          };
          
          nodes.push(childStepDetailsNode);

          const edgeColor = childStep.status === 'partially_completed' ? '#f97316' : 
                           childStep.status === 'completed' ? '#10b981' : '#3b82f6';
          const edgeLabel = childStep.status === 'partially_completed' ? 'Partially Completed' :
                           childStep.status === 'completed' ? 'Completed' : 'In Progress';
          
          const childStepEdge = {
            id: `edge-${previousChildNodeId}-${childStepCardNodeId}`,
            source: previousChildNodeId,
            target: childStepCardNodeId,
            sourceHandle: childStepIndex === 0 ? 'order-output' : 'step-output-main',
            targetHandle: 'step-details-input',
            type: 'smoothstep',
            animated: childStep.status === 'in_progress' || childStep.status === 'partially_completed',
            style: { 
              stroke: edgeColor, 
              strokeWidth: 2, 
              strokeDasharray: childStep.status === 'in_progress' ? '5,5' : 
                             childStep.status === 'partially_completed' ? '8,4,2,4' : 'none'
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: edgeColor,
            },
            label: edgeLabel,
            labelStyle: { 
              fill: edgeColor, 
              fontWeight: 500,
              fontSize: '11px'
            },
          };
          
          edges.push(childStepEdge);

          // Create branch edges for child steps
          childStepBranches.forEach((branch) => {
            const branchEdgeColor = branch.type === 'rework' ? '#f97316' : 
                                   branch.type === 'qc' ? '#eab308' : '#10b981';
            const branchEdgeStyle = branch.type === 'rework' ? '10,5' : 
                                   branch.type === 'qc' ? '2,2' : 'none';
            
            const branchEdge = {
              id: `branch-edge-${childStepCardNodeId}-${branch.targetNodeId}`,
              source: childStepCardNodeId,
              target: branch.targetNodeId,
              sourceHandle: `step-output-${branch.id}`,
              targetHandle: branch.type === 'rework' ? 'order-rework-input' : 'step-details-input',
              type: 'smoothstep',
              animated: true,
              style: { 
                stroke: branchEdgeColor, 
                strokeWidth: 3, 
                strokeDasharray: branchEdgeStyle
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: branchEdgeColor,
              },
              label: branch.label + (branch.quantity ? ` (${branch.quantity})` : ''),
              labelStyle: { 
                fill: branchEdgeColor, 
                fontWeight: 600,
                fontSize: '12px'
              },
            };
            
            edges.push(branchEdge);
          });

          previousChildNodeId = childStepCardNodeId;
        });
      });
    });

    console.log('🔥 Final multi-branch nodes:', nodes);
    console.log('🔥 Final multi-branch edges:', edges);
    
    return { generatedNodes: nodes, generatedEdges: edges };
  }, [
    JSON.stringify(manufacturingOrders?.map(o => ({ id: o.id, order_number: o.order_number, status: o.status, parent_order_id: o.parent_order_id, rework_from_step: o.rework_from_step }))),
    JSON.stringify(orderSteps?.map(s => ({ id: s.id, manufacturing_order_id: s.manufacturing_order_id, status: s.status, step_order: s.step_order }))),
    manufacturingSteps.length,
    onViewDetails
  ]);

  React.useEffect(() => {
    console.log('📊 Setting multi-branch nodes and edges');
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

export default MultiBranchReactFlowView;
