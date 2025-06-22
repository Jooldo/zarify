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
import StepDetailsDialog from './StepDetailsDialog';
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
      
      {/* Updated target handle for rework connections - now on the left */}
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

// Updated StepCard for in-progress steps with rework functionality
const InProgressStepCard: React.FC<{ 
  data: {
    orderStep: any;
    stepFields: any[];
    order: any;
    manufacturingOrders: any[];
    onViewDetails: (order: any) => void;
    onViewStepDetails: (step: any) => void;
  }
}> = ({ data }) => {
  const { orderStep, stepFields, order, manufacturingOrders, onViewDetails, onViewStepDetails } = data;
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
    onViewStepDetails(orderStep);
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
          
          {/* Progress */}
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

          {/* Worker Assignment */}
          {assignedWorkerName && (
            <div className="flex items-center gap-2 text-xs p-2 rounded-md bg-blue-50 border border-blue-100">
              <User className="h-3 w-3 text-blue-500" />
              <span className="text-slate-600">Assigned to:</span>
              <span className="font-medium text-blue-700">{assignedWorkerName}</span>
            </div>
          )}

          {/* Configured Field Values */}
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

          {/* Action Buttons */}
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

          {/* Timestamps */}
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
      onViewDetails={() => data.onViewStepDetails(data.orderStep)}
    />
  ),
  inProgressStepNode: InProgressStepCard,
};

const ReactFlowView: React.FC<ReactFlowViewProps> = ({ manufacturingOrders, onViewDetails }) => {
  const { manufacturingSteps, orderSteps, getStepFields } = useManufacturingSteps();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [stepDetailsDialogOpen, setStepDetailsDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<any>(null);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleViewStepDetails = (step: any) => {
    setSelectedStep(step);
    setStepDetailsDialogOpen(true);
  };

  const { generatedNodes, generatedEdges } = useMemo(() => {
    console.log('🔄 Generating optimized nodes and edges...');
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
    const stepCountsMap = new Map<string, number>();
    
    parentOrders.forEach(parentOrder => {
      const relatedChildOrders = childOrders.filter(child => 
        String(child.parent_order_id) === String(parentOrder.id)
      );
      childOrdersMap.set(parentOrder.id, relatedChildOrders);
      
      const parentOrderSteps = orderSteps.filter(step => 
        String(step.manufacturing_order_id) === String(parentOrder.id) &&
        (step.status === 'in_progress' || step.status === 'completed')
      );
      stepCountsMap.set(parentOrder.id, parentOrderSteps.length);
    });
    
    // Optimize layout positions with better spacing
    const optimizedPositions = optimizeLayoutPositions(
      parentOrders, 
      childOrdersMap, 
      stepCountsMap, 
      {
        ...DEFAULT_LAYOUT_CONFIG,
        nodeSpacing: 600, // Increased from 500
        stepCardSpacing: 450, // Increased from 420
        childOrderOffset: 400, // Increased from 350
      }
    );
    
    console.log('📍 Optimized positions:', optimizedPositions);

    // Store step card IDs and positions for rework connections
    const stepCardMap = new Map<string, string>();
    const stepCardPositions = new Map<string, { x: number; y: number }>();

    parentOrders.forEach((parentOrder, parentIndex) => {
      console.log(`Processing parent order: ${parentOrder.order_number}`);
      
      const parentOrderSteps = orderSteps.filter(step => 
        String(step.manufacturing_order_id) === String(parentOrder.id)
      );
      console.log(`All parent order steps for ${parentOrder.order_number}:`, parentOrderSteps);
      
      const currentParentStep = parentOrderSteps.length > 0 
        ? parentOrderSteps
            .sort((a, b) => b.step_order - a.step_order)
            .find(step => step.status === 'in_progress') || 
          parentOrderSteps.sort((a, b) => b.step_order - a.step_order)[0]
        : null;
      
      console.log(`Current parent step for ${parentOrder.order_number}:`, currentParentStep);

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
        step.status === 'in_progress' || step.status === 'completed'
      ).sort((a, b) => a.step_order - b.step_order);
      
      console.log(`Steps to show for ${parentOrder.order_number}:`, stepsToShow);

      let previousNodeId = parentNodeId;

      stepsToShow.forEach((step, stepIndex) => {
        console.log(`🎯 Creating step details card for parent order ${parentOrder.order_number}, step ${step.step_order}`);
        
        const stepFields = getStepFields(step.manufacturing_step_id);
        const stepCardNodeId = `step-details-${step.id}`;
        
        // Store the actual manufacturing_order_step ID for proper rework connection
        stepCardMap.set(step.id, stepCardNodeId);
        console.log(`🗺️ Storing step mapping: ${step.id} -> ${stepCardNodeId}`);
        
        const nodeType = step.status === 'in_progress' ? 'inProgressStepNode' : 'stepDetailsNode';
        const stepPosition = {
          x: parentPosition.x + 450 + (stepIndex * 450), // Increased spacing
          y: parentPosition.y
        };
        
        // Store step card position for rework positioning
        stepCardPositions.set(stepCardNodeId, stepPosition);
        
        const stepDetailsNode = {
          id: stepCardNodeId,
          type: nodeType,
          position: stepPosition,
          data: step.status === 'in_progress' ? {
            orderStep: step,
            stepFields: stepFields,
            order: parentOrder,
            manufacturingOrders: manufacturingOrders,
            onViewDetails: () => onViewDetails(parentOrder),
            onViewStepDetails: handleViewStepDetails
          } : {
            orderStep: step,
            stepFields: stepFields,
            onViewDetails: () => handleViewStepDetails(step),
            onViewStepDetails: handleViewStepDetails
          },
        };
        
        console.log(`Adding step details node:`, stepDetailsNode);
        nodes.push(stepDetailsNode);

        const edgeColor = step.status === 'completed' ? '#10b981' : '#3b82f6';
        const edgeLabel = step.status === 'completed' ? 'Completed' : 'In Progress';
        
        const stepEdge = {
          id: `edge-${previousNodeId}-${stepCardNodeId}`,
          source: previousNodeId,
          target: stepCardNodeId,
          sourceHandle: stepIndex === 0 ? 'order-output' : 'step-details-output',
          targetHandle: 'step-details-input',
          type: 'smoothstep',
          animated: step.status === 'in_progress',
          style: { 
            stroke: edgeColor, 
            strokeWidth: 2, 
            strokeDasharray: step.status === 'in_progress' ? '5,5' : 'none'
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
        
        console.log(`Adding step edge from ${previousNodeId} to ${stepCardNodeId}:`, stepEdge);
        edges.push(stepEdge);

        previousNodeId = stepCardNodeId;
      });

      const relatedChildOrders = childOrdersMap.get(parentOrder.id) || [];

      relatedChildOrders.forEach((childOrder, childIndex) => {
        console.log(`🔄 Processing child order: ${childOrder.order_number}`);
        console.log(`Child order details:`, {
          rework_source_step_id: childOrder.rework_source_step_id,
          assigned_to_step: childOrder.assigned_to_step,
          rework_reason: childOrder.rework_reason
        });
        
        const childOrderSteps = orderSteps.filter(step => 
          String(step.manufacturing_order_id) === String(childOrder.id)
        );
        const currentChildStep = childOrderSteps.length > 0 
          ? childOrderSteps
              .sort((a, b) => b.step_order - a.step_order)
              .find(step => step.status === 'in_progress') || 
            childOrderSteps.sort((a, b) => b.step_order - a.step_order)[0]
          : null;

        console.log(`Current child step for ${childOrder.order_number}:`, currentChildStep);

        const childNodeId = `child-${childOrder.id}`;
        
        // Position rework card to the side of originating step card
        let childPosition = {
          x: parentPosition.x + 100,
          y: parentPosition.y + ((childIndex + 1) * 400)
        };
        
        // If we can find the originating step card, position the rework card to its side
        if (childOrder.rework_source_step_id) {
          const originatingStepCardId = stepCardMap.get(childOrder.rework_source_step_id);
          if (originatingStepCardId) {
            const originatingStepPosition = stepCardPositions.get(originatingStepCardId);
            if (originatingStepPosition) {
              childPosition = {
                x: originatingStepPosition.x + 100, // Position to the right side
                y: originatingStepPosition.y + 150 + (childIndex * 200) // Offset vertically
              };
            }
          }
        }

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

        // Enhanced rework connection logic using the correct step ID
        let originatingStepCardId = null;
        
        console.log(`🔗 Looking for originating step card using rework_source_step_id: ${childOrder.rework_source_step_id}`);
        console.log('Available step card mappings:', Array.from(stepCardMap.entries()));
        
        // Use the manufacturing_order_step ID directly to find the step card
        if (childOrder.rework_source_step_id) {
          originatingStepCardId = stepCardMap.get(childOrder.rework_source_step_id);
          console.log(`Direct lookup result: ${childOrder.rework_source_step_id} -> ${originatingStepCardId}`);
        }
        
        if (originatingStepCardId) {
          const reworkConnectionEdge = {
            id: `rework-edge-${originatingStepCardId}-${childNodeId}`,
            source: originatingStepCardId,
            target: childNodeId,
            sourceHandle: 'step-details-output',
            targetHandle: 'order-rework-input', // Updated to use left handle
            type: 'smoothstep',
            animated: true,
            style: { 
              stroke: '#f97316', 
              strokeWidth: 3, 
              strokeDasharray: '10,5'
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#f97316',
            },
            label: 'Rework Origin',
            labelStyle: { 
              fill: '#f97316', 
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
          
          console.log(`✅ Adding rework connection from ${originatingStepCardId} to ${childNodeId}`);
          edges.push(reworkConnectionEdge);
        } else {
          console.log(`❌ Could not find originating step card for rework order ${childOrder.order_number}`);
          console.log(`Attempted to find step card for rework_source_step_id: ${childOrder.rework_source_step_id}`);
        }

        const childStepsToShow = childOrderSteps.filter(step => 
          step.status === 'in_progress' || step.status === 'completed'
        ).sort((a, b) => a.step_order - b.step_order);

        let previousChildNodeId = childNodeId;

        childStepsToShow.forEach((childStep, childStepIndex) => {
          console.log(`🎯 Creating step details card for child order ${childOrder.order_number}, step ${childStep.step_order}`);
          
          const stepFields = getStepFields(childStep.manufacturing_step_id);
          const childStepCardNodeId = `step-details-${childStep.id}`;
          
          const nodeType = childStep.status === 'in_progress' ? 'inProgressStepNode' : 'stepDetailsNode';
          const childStepPosition = {
            x: childPosition.x + 450 + (childStepIndex * 450), // Increased spacing
            y: childPosition.y
          };
          
          const childStepDetailsNode = {
            id: childStepCardNodeId,
            type: nodeType,
            position: childStepPosition,
            data: childStep.status === 'in_progress' ? {
              orderStep: childStep,
              stepFields: stepFields,
              order: childOrder,
              manufacturingOrders: manufacturingOrders,
              onViewDetails: () => onViewDetails(childOrder),
              onViewStepDetails: handleViewStepDetails
            } : {
              orderStep: childStep,
              stepFields: stepFields,
              onViewDetails: () => handleViewStepDetails(childStep),
              onViewStepDetails: handleViewStepDetails
            },
          };
          
          console.log(`Adding child step details node:`, childStepDetailsNode);
          nodes.push(childStepDetailsNode);

          const edgeColor = childStep.status === 'completed' ? '#10b981' : '#3b82f6';
          const edgeLabel = childStep.status === 'completed' ? 'Completed' : 'In Progress';
          
          const childStepEdge = {
            id: `edge-${previousChildNodeId}-${childStepCardNodeId}`,
            source: previousChildNodeId,
            target: childStepCardNodeId,
            sourceHandle: childStepIndex === 0 ? 'order-output' : 'step-details-output',
            targetHandle: 'step-details-input',
            type: 'smoothstep',
            animated: childStep.status === 'in_progress',
            style: { 
              stroke: edgeColor, 
              strokeWidth: 2, 
              strokeDasharray: childStep.status === 'in_progress' ? '5,5' : 'none'
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
          
          console.log(`Adding child step edge from ${previousChildNodeId} to ${childStepCardNodeId}:`, childStepEdge);
          edges.push(childStepEdge);

          previousChildNodeId = childStepCardNodeId;
        });
      });
    });

    console.log('🔥 Final optimized nodes:', nodes);
    console.log('🔥 Final optimized edges:', edges);
    
    return { generatedNodes: nodes, generatedEdges: edges };
  }, [
    JSON.stringify(manufacturingOrders?.map(o => ({ id: o.id, order_number: o.order_number, status: o.status, parent_order_id: o.parent_order_id, rework_source_step_id: o.rework_source_step_id, assigned_to_step: o.assigned_to_step }))),
    JSON.stringify(orderSteps?.map(s => ({ id: s.id, manufacturing_order_id: s.manufacturing_order_id, status: s.status, step_order: s.step_order }))),
    manufacturingSteps.length,
    onViewDetails,
    handleViewStepDetails
  ]);

  React.useEffect(() => {
    console.log('📊 Setting optimized nodes and edges');
    console.log('Setting nodes:', generatedNodes.length);
    console.log('Setting edges:', generatedEdges.length);
    
    setNodes(generatedNodes);
    setEdges(generatedEdges);
  }, [generatedNodes, generatedEdges, setNodes, setEdges]);

  return (
    <>
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

      {/* Step Details Dialog */}
      <StepDetailsDialog
        open={stepDetailsDialogOpen}
        onOpenChange={setStepDetailsDialogOpen}
        step={selectedStep}
      />
    </>
  );
};

export default ReactFlowView;
