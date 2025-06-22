import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
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
import StepDetailsCard from './StepDetailsCard';
import CreateChildOrderDialog from './CreateChildOrderDialog';
import StartStepDialog from './StartStepDialog';

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
        return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
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
        position={Position.Left}
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

const InProgressStepCard: React.FC<{ 
  data: {
    orderStep: any;
    stepFields: any[];
    order: any;
    manufacturingOrders: any[];
    onViewDetails: (order: any) => void;
  }
}> = ({ data }) => {
  const { orderStep, stepFields, order, manufacturingOrders, onViewDetails } = data;
  const { getStepValue } = useManufacturingStepValues();
  const { workers } = useWorkers();
  const { manufacturingSteps } = useManufacturingSteps();
  const [showReworkDialog, setShowReworkDialog] = useState(false);
  const [showStartNextDialog, setShowStartNextDialog] = useState(false);

  const hasReworkOrder = manufacturingOrders?.some(mo => mo.parent_order_id === order.id);

  const getNextStepInfo = () => {
    if (!orderStep.manufacturing_steps || !manufacturingSteps.length) return null;
    
    const currentStepOrder = orderStep.manufacturing_steps.step_order;
    const nextStep = manufacturingSteps.find(step => 
      step.step_order === currentStepOrder + 1 && 
      step.is_active && 
      step.merchant_id === orderStep.merchant_id
    );
    
    return nextStep;
  };

  const getConfiguredFieldValues = () => {
    if (!stepFields || stepFields.length === 0) {
      return [];
    }
    
    const fieldValues = stepFields
      .filter(field => field.field_type !== 'worker' && field.is_required)
      .map(field => {
        let value = 'Not set';
        let displayValue = 'Not set';
        
        const savedValue = getStepValue(orderStep.id, field.field_id);
        
        if (savedValue !== null && savedValue !== undefined && savedValue !== '') {
          value = savedValue;
          displayValue = savedValue;
          
          if (field.field_options?.unit) {
            displayValue = `${value} ${field.field_options.unit}`;
          }
        }
        
        return {
          label: field.field_label,
          value: displayValue,
          type: field.field_type,
          isEmpty: value === 'Not set',
          fieldName: field.field_name
        };
      });
    
    return fieldValues;
  };

  const getFieldIcon = (fieldName: string, fieldType: string) => {
    if (fieldName.toLowerCase().includes('weight')) {
      return <Weight className="h-3 w-3 text-slate-400" />;
    }
    if (fieldName.toLowerCase().includes('quantity')) {
      return <Hash className="h-3 w-3 text-slate-400" />;
    }
    if (fieldType === 'date') {
      return <Calendar className="h-3 w-3 text-slate-400" />;
    }
    if (fieldType === 'number') {
      return <Hash className="h-3 w-3 text-slate-400" />;
    }
    return <Type className="h-3 w-3 text-slate-400" />;
  };

  const getAssignedWorkerName = () => {
    if (stepFields) {
      const workerField = stepFields.find(field => field.field_type === 'worker');
      if (workerField) {
        const workerId = getStepValue(orderStep.id, workerField.field_id);
        if (workerId) {
          const worker = workers.find(w => w.id === workerId);
          if (worker) {
            return worker.name;
          }
        }
      }
    }
    
    if (orderStep.assigned_worker_id) {
      const worker = workers.find(w => w.id === orderStep.assigned_worker_id);
      if (worker) {
        return worker.name;
      }
    }
    
    if (orderStep.workers?.name) {
      return orderStep.workers.name;
    }
    
    return null;
  };

  const handleSetupRework = () => {
    setShowReworkDialog(true);
  };

  const handleStartNextStep = () => {
    setShowStartNextDialog(true);
  };

  const handleReworkSuccess = () => {
    setShowReworkDialog(false);
  };

  const handleCardClick = () => {
    onViewDetails(order);
  };

  const nextStep = getNextStepInfo();
  const configuredFieldValues = getConfiguredFieldValues();
  const assignedWorkerName = getAssignedWorkerName();

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        id="step-details-input"
        style={{ background: '#3b82f6', border: 'none', width: 8, height: 8 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="step-details-output"
        style={{ background: '#3b82f6', border: 'none', width: 8, height: 8 }}
      />
      
      <Card 
        className="w-80 border-l-2 border-l-blue-400 bg-gradient-to-r from-blue-50/30 to-white hover:shadow-md transition-shadow cursor-pointer shadow-sm border-blue-100"
        onClick={handleCardClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
                {orderStep.manufacturing_steps?.step_name}
                {orderStep.manufacturing_steps?.qc_required && (
                  <Badge variant="secondary" className="bg-yellow-50 text-yellow-600 border-yellow-200 text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    QC
                  </Badge>
                )}
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Step {orderStep.manufacturing_steps?.step_order}
              </p>
            </div>
            <Badge className="text-xs bg-blue-100 text-blue-700 border border-blue-200">
              IN PROGRESS
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          
          {orderStep.progress_percentage > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="font-medium text-slate-600">Progress</span>
                <span className="font-semibold text-blue-600">{orderStep.progress_percentage}%</span>
              </div>
              <div className="w-full rounded-full h-2 bg-blue-100">
                <div 
                  className="h-2 rounded-full transition-all duration-300 bg-blue-400"
                  style={{ width: `${orderStep.progress_percentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {assignedWorkerName && (
            <div className="flex items-center gap-2 text-xs p-2 rounded-md bg-blue-50 border border-blue-100">
              <User className="h-3 w-3 text-blue-500" />
              <span className="text-slate-600">Assigned to:</span>
              <span className="font-medium text-blue-700">{assignedWorkerName}</span>
            </div>
          )}

          {configuredFieldValues.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-600">Field Values:</div>
              {configuredFieldValues.map((field, index) => (
                <div key={index} className="flex items-center gap-2 text-xs bg-white p-2 rounded-md border border-blue-100">
                  {getFieldIcon(field.fieldName, field.type)}
                  <span className="font-medium text-slate-600">{field.label}:</span>
                  <span className={`font-medium flex-1 ${
                    field.isEmpty ? 'text-slate-400 italic' : 'text-slate-700'
                  }`}>
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 pt-2 border-t border-blue-100">
            {!hasReworkOrder && (
              <Button
                size="sm"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSetupRework();
                }}
              >
                <Wrench className="h-3 w-3 mr-1" />
                Setup Rework
              </Button>
            )}
            
            {nextStep && (
              <Button
                size="sm"
                variant="outline"
                className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartNextStep();
                }}
              >
                <Play className="h-3 w-3 mr-1" />
                Start {nextStep.step_name}
              </Button>
            )}
            
            {hasReworkOrder && (
              <div className="text-xs text-slate-500 text-center p-2 bg-blue-50/50 rounded-md">
                Rework order already created
              </div>
            )}
          </div>

          <div className="space-y-1 text-xs border-t pt-2 text-slate-500 border-blue-100">
            {orderStep.started_at && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Started: {format(new Date(orderStep.started_at), 'MMM dd, HH:mm')}</span>
              </div>
            )}
            {orderStep.completed_at && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>Completed: {format(new Date(orderStep.completed_at), 'MMM dd, HH:mm')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showReworkDialog && orderStep.manufacturing_steps && (
        <CreateChildOrderDialog
          isOpen={showReworkDialog}
          onClose={() => setShowReworkDialog(false)}
          parentOrder={order}
          currentStep={orderStep.manufacturing_steps}
          parentOrderStep={orderStep}
          onSuccess={handleReworkSuccess}
        />
      )}

      {showStartNextDialog && nextStep && (
        <StartStepDialog
          isOpen={showStartNextDialog}
          onClose={() => setShowStartNextDialog(false)}
          order={order}
          step={nextStep}
        />
      )}
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
  inProgressStepNode: ({ data }: { data: any }) => {
    const { orderStep, stepFields, order, manufacturingOrders, onViewDetails } = data;
    return (
      <>
        <Handle
          type="target"
          position={Position.Left}
          id="step-details-input"
          style={{ background: '#3b82f6', border: 'none', width: 8, height: 8 }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="step-details-output"
          style={{ background: '#3b82f6', border: 'none', width: 8, height: 8 }}
        />
        
        <Card 
          className="w-80 border-l-2 border-l-blue-400 bg-gradient-to-r from-blue-50/30 to-white hover:shadow-md transition-shadow cursor-pointer shadow-sm border-blue-100"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              {orderStep.manufacturing_steps?.step_name} (In Progress)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => onViewDetails(order)}
            >
              View Details
            </Button>
          </CardContent>
        </Card>
      </>
    );
  },
};

const ReactFlowView: React.FC<ReactFlowViewProps> = ({ manufacturingOrders, onViewDetails }) => {
  console.log('🔄 ReactFlowView render - Orders received:', manufacturingOrders?.length);
  
  const { manufacturingSteps, orderSteps, getStepFields } = useManufacturingSteps();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const renderCountRef = useRef(0);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Stable callback reference
  const stableOnViewDetails = useCallback((order: any) => {
    console.log('📱 View details called for order:', order.order_number);
    onViewDetails(order);
  }, [onViewDetails]);

  // Generate stable data keys to prevent unnecessary re-renders
  const dataKeys = useMemo(() => {
    const ordersKey = manufacturingOrders?.map(o => `${o.id}-${o.updated_at}`).join('|') || '';
    const stepsKey = orderSteps?.map(s => `${s.id}-${s.status}-${s.updated_at || s.id}`).join('|') || '';
    return `${ordersKey}__${stepsKey}`;
  }, [manufacturingOrders, orderSteps]);

  // Generate nodes and edges with stable references
  const flowData = useMemo(() => {
    renderCountRef.current += 1;
    console.log(`🔄 Generating flow data (render #${renderCountRef.current})`);
    console.log('📊 Input data:', {
      manufacturingOrdersCount: manufacturingOrders?.length || 0,
      orderStepsCount: orderSteps?.length || 0,
      manufacturingStepsCount: manufacturingSteps?.length || 0
    });
    
    if (!manufacturingOrders || manufacturingOrders.length === 0) {
      console.log('⚠️ No manufacturing orders, returning empty flow');
      return { nodes: [], edges: [] };
    }
    
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    manufacturingOrders.forEach((order, orderIndex) => {
      console.log(`🏭 Processing order ${orderIndex + 1}: ${order.order_number} (ID: ${order.id})`);
      
      // Find steps for this order
      const orderSpecificSteps = orderSteps?.filter(step => {
        const matches = String(step.manufacturing_order_id) === String(order.id);
        if (matches) {
          console.log(`  📋 Found step: ${step.manufacturing_steps?.step_name} (${step.status})`);
        }
        return matches;
      }) || [];
      
      console.log(`  📊 Total steps found: ${orderSpecificSteps.length}`);
      
      // Get current step (first pending/in_progress step or first step)
      const currentStep = orderSpecificSteps.length > 0 
        ? orderSpecificSteps
          .sort((a, b) => (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0))
          .find(step => step.status === 'pending' || step.status === 'in_progress') ||
          orderSpecificSteps[0]
        : null;
      
      if (currentStep) {
        console.log(`  🎯 Current step: ${currentStep.manufacturing_steps?.step_name} (${currentStep.status})`);
      }
      
      // Create order node
      const orderNodeId = `order-${order.id}`;
      const yPosition = 50 + (orderIndex * 350);
      
      const orderNode: Node = {
        id: orderNodeId,
        type: 'orderNode',
        position: { x: 50, y: yPosition },
        data: {
          order: order,
          step: currentStep ? {
            ...currentStep.manufacturing_steps,
            status: currentStep.status,
            workers: currentStep.workers,
            started_at: currentStep.started_at
          } : null,
          isParent: !order.parent_order_id,
          isChild: !!order.parent_order_id,
          childLevel: order.parent_order_id ? 1 : 0,
          onViewDetails: stableOnViewDetails
        },
      };
      
      nodes.push(orderNode);
      console.log(`  ✅ Created order node: ${orderNodeId}`);
      
      // Create step nodes for all steps
      const sortedSteps = orderSpecificSteps.sort((a, b) => 
        (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0)
      );
      
      sortedSteps.forEach((step, stepIndex) => {
        const stepNodeId = `step-${step.id}`;
        const stepFields = getStepFields(step.manufacturing_step_id);
        const xPosition = 400 + (stepIndex * 400);
        
        // Choose node type based on status
        const nodeType = step.status === 'in_progress' ? 'inProgressStepNode' : 'stepDetailsNode';
        
        const stepNode: Node = {
          id: stepNodeId,
          type: nodeType,
          position: { x: xPosition, y: yPosition },
          data: step.status === 'in_progress' ? {
            orderStep: step,
            stepFields: stepFields,
            order: order,
            manufacturingOrders: manufacturingOrders,
            onViewDetails: stableOnViewDetails
          } : {
            orderStep: step,
            stepFields: stepFields,
            onViewDetails: stableOnViewDetails
          },
        };
        
        nodes.push(stepNode);
        console.log(`  ✅ Created step node: ${stepNodeId} (${step.status})`);
        
        // Create edge from order to first step or from previous step
        const sourceId = stepIndex === 0 ? orderNodeId : `step-${sortedSteps[stepIndex - 1].id}`;
        const sourceHandle = stepIndex === 0 ? 'order-output' : 'step-details-output';
        const edgeColor = step.status === 'in_progress' ? '#3b82f6' : 
                         step.status === 'completed' ? '#10b981' : '#6b7280';
        
        const stepEdge: Edge = {
          id: `edge-${sourceId}-${stepNodeId}`,
          source: sourceId,
          target: stepNodeId,
          sourceHandle: sourceHandle,
          targetHandle: 'step-details-input',
          type: 'smoothstep',
          animated: step.status === 'in_progress',
          style: { 
            stroke: edgeColor, 
            strokeWidth: 2 
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgeColor,
          },
        };
        
        edges.push(stepEdge);
        console.log(`  ✅ Created edge: ${stepEdge.id}`);
      });
    });
    
    console.log(`✅ Flow generation complete: ${nodes.length} nodes, ${edges.length} edges`);
    return { nodes, edges };
  }, [dataKeys, manufacturingOrders, orderSteps, manufacturingSteps, getStepFields, stableOnViewDetails]);

  // Update ReactFlow state when data changes
  useEffect(() => {
    console.log('📊 Updating ReactFlow state with:', { 
      nodeCount: flowData.nodes.length, 
      edgeCount: flowData.edges.length 
    });
    
    // Set nodes and edges with a small delay to ensure stability
    const updateTimeout = setTimeout(() => {
      setNodes(flowData.nodes);
      setEdges(flowData.edges);
      console.log('🎯 ReactFlow state updated successfully');
    }, 10);

    return () => clearTimeout(updateTimeout);
  }, [flowData, setNodes, setEdges]);

  console.log('🎨 Final render state:', { 
    nodeCount: nodes.length, 
    edgeCount: edges.length,
    renderCount: renderCountRef.current
  });

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
