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
import StepDetailsCard from './StepDetailsCard';
import CreateChildOrderDialog from './CreateChildOrderDialog';
import StartStepDialog from './StartStepDialog';
import { 
  optimizeLayoutPositions, 
  calculateStepCardPosition, 
  calculateChildOrderPosition,
  DEFAULT_LAYOUT_CONFIG,
  LayoutPosition 
} from '@/utils/reactFlowLayoutUtils';

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

const PartiallyCompletedStepCard: React.FC<{ 
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

  // Check if rework order already exists for this order
  const hasReworkOrder = manufacturingOrders?.some(mo => mo.parent_order_id === order.id);

  // Get next step information
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

  // Get configured field values for display - only required fields
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

  // Get icon for field type
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

  // Get assigned worker name
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
        style={{ background: '#f97316', border: 'none', width: 8, height: 8 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="step-details-next-output"
        style={{ background: '#10b981', border: 'none', width: 8, height: 8, top: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="step-details-rework-output"
        style={{ background: '#f97316', border: 'none', width: 8, height: 8, top: '70%' }}
      />
      
      <Card 
        className="w-80 border-l-2 border-l-orange-400 bg-gradient-to-r from-orange-50/30 to-white hover:shadow-md transition-shadow cursor-pointer shadow-sm border-orange-100"
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
            <Badge className="text-xs bg-orange-100 text-orange-700 border border-orange-200">
              PARTIALLY COMPLETED
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          
          {/* Progress */}
          {orderStep.progress_percentage > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="font-medium text-slate-600">Progress</span>
                <span className="font-semibold text-orange-600">{orderStep.progress_percentage}%</span>
              </div>
              <div className="w-full rounded-full h-2 bg-orange-100">
                <div 
                  className="h-2 rounded-full transition-all duration-300 bg-orange-400"
                  style={{ width: `${orderStep.progress_percentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Visual Branch Indicators */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <div className="text-xs font-medium text-slate-600 mb-2">Parallel Outcomes:</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-0.5 bg-green-500 rounded"></div>
                <span className="text-green-600 font-medium">Continue to Next Step</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-0.5 bg-orange-500 rounded border-dashed border border-orange-400"></div>
                <span className="text-orange-600 font-medium">Setup Rework</span>
              </div>
            </div>
          </div>

          {/* Worker Assignment */}
          {assignedWorkerName && (
            <div className="flex items-center gap-2 text-xs p-2 rounded-md bg-orange-50 border border-orange-100">
              <User className="h-3 w-3 text-orange-500" />
              <span className="text-slate-600">Assigned to:</span>
              <span className="font-medium text-orange-700">{assignedWorkerName}</span>
            </div>
          )}

          {/* Configured Field Values */}
          {configuredFieldValues.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-600">Field Values:</div>
              {configuredFieldValues.map((field, index) => (
                <div key={index} className="flex items-center gap-2 text-xs bg-white p-2 rounded-md border border-orange-100">
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

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-orange-100">
            {!hasReworkOrder && (
              <Button
                size="sm"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
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
                className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
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
              <div className="text-xs text-slate-500 text-center p-2 bg-orange-50/50 rounded-md">
                Rework order already created
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="space-y-1 text-xs border-t pt-2 text-slate-500 border-orange-100">
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

      {/* Rework Dialog */}
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

      {/* Start Next Step Dialog */}
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
  partiallyCompletedStepNode: PartiallyCompletedStepCard,
};

const ReactFlowView: React.FC<ReactFlowViewProps> = ({ manufacturingOrders, onViewDetails }) => {
  const { manufacturingSteps, orderSteps, getStepFields } = useManufacturingSteps();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const { generatedNodes, generatedEdges } = useMemo(() => {
    console.log('🔄 Generating enhanced parallel branching flow...');
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
    
    // Enhanced layout with wider horizontal spacing for parallel branches
    const HORIZONTAL_SPACING = 600; // Increased for parallel paths
    const VERTICAL_SPACING = 900; // Increased for better separation
    const REWORK_VERTICAL_OFFSET = 400; // Distance for rework branches
    const NEXT_STEP_VERTICAL_OFFSET = -150; // Slight upward offset for next step branches
    
    console.log('👨‍👩‍👧‍👦 Parent Orders:', parentOrders.length);
    console.log('👶 Child Orders:', childOrders.length);

    parentOrders.forEach((parentOrder, parentIndex) => {
      console.log(`\n🏭 Processing parent order: ${parentOrder.order_number}`);
      
      const parentOrderSteps = orderSteps.filter(step => 
        String(step.manufacturing_order_id) === String(parentOrder.id)
      );
      
      const currentParentStep = parentOrderSteps.length > 0 
        ? parentOrderSteps
            .sort((a, b) => b.step_order - a.step_order)
            .find(step => step.status === 'in_progress') || 
          parentOrderSteps.sort((a, b) => b.step_order - a.step_order)[0]
        : null;

      // Position parent order node with enhanced spacing
      const parentNodeId = `parent-${parentOrder.id}`;
      const parentPosition = { x: 50, y: 50 + (parentIndex * VERTICAL_SPACING) };
      
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

      // Enhanced step detail cards with parallel branching support
      const stepsToShow = parentOrderSteps.filter(step => 
        step.status === 'in_progress' || step.status === 'completed' || step.status === 'partially_completed'
      ).sort((a, b) => a.step_order - b.step_order);
      
      console.log(`📋 Steps to show for ${parentOrder.order_number}:`, stepsToShow.length);

      let previousNodeId = parentNodeId;
      const stepCardMap = new Map<string, { nodeId: string, position: LayoutPosition, step: any }>();

      stepsToShow.forEach((step, stepIndex) => {
        const stepFields = getStepFields(step.manufacturing_step_id);
        const stepCardNodeId = `step-details-${step.id}`;
        
        const stepCardPosition = {
          x: parentPosition.x + 500 + (stepIndex * HORIZONTAL_SPACING),
          y: parentPosition.y
        };
        
        // Store step card info for enhanced branching logic
        stepCardMap.set(`${parentOrder.id}-${step.manufacturing_steps?.step_order}`, {
          nodeId: stepCardNodeId,
          position: stepCardPosition,
          step: step
        });
        
        const nodeType = step.status === 'partially_completed' ? 'partiallyCompletedStepNode' : 'stepDetailsNode';
        
        const stepDetailsNode = {
          id: stepCardNodeId,
          type: nodeType,
          position: stepCardPosition,
          data: step.status === 'partially_completed' ? {
            orderStep: step,
            stepFields: stepFields,
            order: parentOrder,
            manufacturingOrders: manufacturingOrders,
            onViewDetails: () => onViewDetails(parentOrder)
          } : {
            orderStep: step,
            stepFields: stepFields,
            onViewDetails: () => onViewDetails(parentOrder)
          },
        };
        
        nodes.push(stepDetailsNode);

        // Standard edge from previous node to current step
        const edgeColor = step.status === 'partially_completed' ? '#f97316' : 
                         step.status === 'completed' ? '#10b981' : '#3b82f6';
        const edgeLabel = step.status === 'partially_completed' ? 'Partially Completed' :
                         step.status === 'completed' ? 'Completed' : 'In Progress';
        
        edges.push({
          id: `edge-${previousNodeId}-${stepCardNodeId}`,
          source: previousNodeId,
          target: stepCardNodeId,
          sourceHandle: stepIndex === 0 ? 'order-output' : 'step-details-output',
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
        });

        // ENHANCED PARALLEL BRANCHING LOGIC
        if (step.status === 'partially_completed') {
          // 1. Create next step branch (if next step exists)
          const currentStepOrder = step.manufacturing_steps?.step_order;
          const nextStep = manufacturingSteps.find(s => 
            s.step_order === currentStepOrder + 1 && 
            s.is_active && 
            s.merchant_id === step.merchant_id
          );

          if (nextStep) {
            // Check if next step has an active order step
            const nextOrderStep = parentOrderSteps.find(os => 
              String(os.manufacturing_step_id) === String(nextStep.id)
            );

            if (nextOrderStep && (nextOrderStep.status === 'in_progress' || nextOrderStep.status === 'completed')) {
              const nextStepCardInfo = Array.from(stepCardMap.values()).find(card => 
                card.step.manufacturing_step_id === nextStep.id
              );

              if (nextStepCardInfo) {
                console.log(`🔀 Creating next step branch from ${stepCardNodeId} to ${nextStepCardInfo.nodeId}`);
                
                edges.push({
                  id: `next-step-${stepCardNodeId}-${nextStepCardInfo.nodeId}`,
                  source: stepCardNodeId,
                  target: nextStepCardInfo.nodeId,
                  sourceHandle: 'step-details-next-output',
                  targetHandle: 'step-details-input',
                  type: 'smoothstep',
                  animated: false,
                  style: { 
                    stroke: '#10b981', 
                    strokeWidth: 3,
                    strokeDasharray: 'none'
                  },
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: '#10b981',
                  },
                  label: 'Next Step',
                  labelStyle: { 
                    fill: '#10b981', 
                    fontWeight: 600,
                    fontSize: '12px'
                  },
                  labelBgStyle: {
                    fill: 'white',
                    fillOpacity: 0.9
                  }
                });
              }
            }
          }

          // 2. Create rework branch (if rework order exists)
          const relatedReworkOrder = childOrders.find(child => 
            String(child.parent_order_id) === String(parentOrder.id) &&
            child.rework_from_step === currentStepOrder
          );

          if (relatedReworkOrder) {
            console.log(`🔧 Found rework order for step ${currentStepOrder}: ${relatedReworkOrder.order_number}`);
            
            // Position rework order with enhanced branching layout
            const reworkPosition = {
              x: stepCardPosition.x + 150, // Offset to the right for parallel branch
              y: stepCardPosition.y + REWORK_VERTICAL_OFFSET
            };

            const reworkNodeId = `child-${relatedReworkOrder.id}`;
            const reworkOrderSteps = orderSteps.filter(s => 
              String(s.manufacturing_order_id) === String(relatedReworkOrder.id)
            );
            
            const currentReworkStep = reworkOrderSteps.length > 0 
              ? reworkOrderSteps
                  .sort((a, b) => b.step_order - a.step_order)
                  .find(s => s.status === 'in_progress') || 
                reworkOrderSteps.sort((a, b) => b.step_order - a.step_order)[0]
              : null;

            nodes.push({
              id: reworkNodeId,
              type: 'orderNode',
              position: reworkPosition,
              data: {
                order: relatedReworkOrder,
                step: currentReworkStep?.manufacturing_steps ? {
                  ...currentReworkStep.manufacturing_steps,
                  status: currentReworkStep.status,
                  workers: currentReworkStep.workers,
                  started_at: currentReworkStep.started_at
                } : null,
                isParent: false,
                isChild: true,
                parentOrderId: parentOrder.id,
                childLevel: 1,
                onViewDetails
              } as FlowNodeData,
            });

            // Enhanced rework connection edge
            edges.push({
              id: `rework-branch-${stepCardNodeId}-${reworkNodeId}`,
              source: stepCardNodeId,
              target: reworkNodeId,
              sourceHandle: 'step-details-rework-output',
              targetHandle: 'order-rework-input',
              type: 'smoothstep',
              animated: true,
              style: { 
                stroke: '#f59e0b', 
                strokeWidth: 3, 
                strokeDasharray: '12,6'
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#f59e0b',
              },
              label: 'Rework Branch',
              labelStyle: { 
                fill: '#f59e0b', 
                fontWeight: 600,
                fontSize: '12px'
              },
              labelBgStyle: {
                fill: 'white',
                fillOpacity: 0.9
              }
            });

            // Add rework step cards with enhanced spacing
            const reworkStepsToShow = reworkOrderSteps.filter(s => 
              s.status === 'in_progress' || s.status === 'completed' || s.status === 'partially_completed'
            ).sort((a, b) => a.step_order - b.step_order);

            let previousReworkNodeId = reworkNodeId;

            reworkStepsToShow.forEach((reworkStep, reworkStepIndex) => {
              const reworkStepFields = getStepFields(reworkStep.manufacturing_step_id);
              const reworkStepCardNodeId = `step-details-${reworkStep.id}`;
              
              const reworkStepNodeType = reworkStep.status === 'partially_completed' ? 'partiallyCompletedStepNode' : 'stepDetailsNode';
              const reworkStepPosition = {
                x: reworkPosition.x + 500 + (reworkStepIndex * HORIZONTAL_SPACING),
                y: reworkPosition.y
              };
              
              const reworkStepDetailsNode = {
                id: reworkStepCardNodeId,
                type: reworkStepNodeType,
                position: reworkStepPosition,
                data: reworkStep.status === 'partially_completed' ? {
                  orderStep: reworkStep,
                  stepFields: reworkStepFields,
                  order: relatedReworkOrder,
                  manufacturingOrders: manufacturingOrders,
                  onViewDetails: () => onViewDetails(relatedReworkOrder)
                } : {
                  orderStep: reworkStep,
                  stepFields: reworkStepFields,
                  onViewDetails: () => onViewDetails(relatedReworkOrder)
                },
              };
              
              nodes.push(reworkStepDetailsNode);

              const reworkEdgeColor = reworkStep.status === 'partially_completed' ? '#f97316' : 
                                     reworkStep.status === 'completed' ? '#10b981' : '#3b82f6';
              const reworkEdgeLabel = reworkStep.status === 'partially_completed' ? 'Partially Completed' :
                                     reworkStep.status === 'completed' ? 'Completed' : 'In Progress';
              
              edges.push({
                id: `rework-edge-${previousReworkNodeId}-${reworkStepCardNodeId}`,
                source: previousReworkNodeId,
                target: reworkStepCardNodeId,
                sourceHandle: reworkStepIndex === 0 ? 'order-output' : 'step-details-output',
                targetHandle: 'step-details-input',
                type: 'smoothstep',
                animated: reworkStep.status === 'in_progress' || reworkStep.status === 'partially_completed',
                style: { 
                  stroke: reworkEdgeColor, 
                  strokeWidth: 2, 
                  strokeDasharray: reworkStep.status === 'in_progress' ? '5,5' : 
                                 reworkStep.status === 'partially_completed' ? '8,4,2,4' : 'none'
                },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: reworkEdgeColor,
                },
                label: reworkEdgeLabel,
                labelStyle: { 
                  fill: reworkEdgeColor, 
                  fontWeight: 500,
                  fontSize: '11px'
                },
              });

              previousReworkNodeId = reworkStepCardNodeId;
            });
          }
        }

        previousNodeId = stepCardNodeId;
      });
    });

    console.log('🎯 Enhanced parallel flow - Nodes:', nodes.length, 'Edges:', edges.length);
    console.log('🔀 Parallel branches created:', edges.filter(e => e.id.includes('next-step') || e.id.includes('rework-branch')).length);
    
    return { generatedNodes: nodes, generatedEdges: edges };
  }, [
    JSON.stringify(manufacturingOrders?.map(o => ({ id: o.id, order_number: o.order_number, status: o.status, parent_order_id: o.parent_order_id, rework_from_step: o.rework_from_step }))),
    JSON.stringify(orderSteps?.map(s => ({ id: s.id, manufacturing_order_id: s.manufacturing_order_id, status: s.status, step_order: s.step_order }))),
    manufacturingSteps.length,
    onViewDetails
  ]);

  React.useEffect(() => {
    console.log('📊 Setting enhanced parallel flow nodes and edges');
    console.log('Nodes to set:', generatedNodes.length);
    console.log('Edges to set:', generatedEdges.length);
    
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
