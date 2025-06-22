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
import { Package, User, Clock, GitBranch, Eye, AlertTriangle, Wrench, Play, Weight, Hash, Type, Calendar } from 'lucide-react';
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
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'partially_completed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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
      <Handle
        type="source"
        position={Position.Right}
        id="order-output"
        style={{ background: '#3b82f6' }}
      />
      
      <Card className={`w-80 ${isChild ? 'border-l-4 border-l-orange-400 bg-orange-50/30' : 'bg-white'} shadow-sm hover:shadow-md transition-all duration-200`}>
        <CardContent className="p-4">
          <div className="space-y-3">
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

            {step && (
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-sm font-medium text-gray-800">
                  Step {step.step_order}: {step.step_name}
                </div>
                <Badge className={`${getStatusColor(step.status)} border text-xs mt-1`}>
                  {step.status === 'not_started' ? 'Not Started' : 
                   step.status === 'in_progress' ? 'In Progress' : 
                   step.status === 'partially_completed' ? 'Partially Completed' :
                   step.status?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-2 space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold text-gray-800">{order.product_name}</span>
              </div>
              <div className="text-xs text-gray-600">
                Quantity: {order.quantity_required}
              </div>
            </div>

            {step?.workers?.name && (
              <div className="flex items-center gap-2 text-sm bg-blue-50 rounded-lg p-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">Worker:</span>
                <span className="font-semibold text-blue-700">{step.workers.name}</span>
              </div>
            )}

            {step?.started_at && (
              <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 rounded px-2 py-1">
                <Clock className="h-3 w-3" />
                Started: {new Date(step.started_at).toLocaleDateString()}
              </div>
            )}

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

// Updated PartiallyCompletedStepCard with yellow theme and enhanced functionality
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

  // Get field icon based on type and name
  const getFieldIcon = (fieldName: string, fieldType: string) => {
    if (fieldName.toLowerCase().includes('weight')) {
      return <Weight className="h-3 w-3 text-yellow-600" />;
    }
    if (fieldName.toLowerCase().includes('quantity')) {
      return <Hash className="h-3 w-3 text-yellow-600" />;
    }
    if (fieldType === 'date') {
      return <Calendar className="h-3 w-3 text-yellow-600" />;
    }
    if (fieldType === 'number') {
      return <Hash className="h-3 w-3 text-yellow-600" />;
    }
    return <Type className="h-3 w-3 text-yellow-600" />;
  };

  // Get worker name from worker ID
  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : 'Unknown Worker';
  };

  // Get configured field values for display
  const getConfiguredFieldValues = () => {
    if (!stepFields || stepFields.length === 0) {
      return [];
    }
    
    const fieldValues = stepFields
      .filter(field => field.field_type !== 'worker') // Exclude worker fields, show separately
      .map(field => {
        let value = 'Not set';
        let displayValue = 'Not set';
        
        const savedValue = getStepValue(orderStep.id, field.field_id);
        
        if (savedValue !== null && savedValue !== undefined && savedValue !== '') {
          value = savedValue;
          displayValue = savedValue;
          
          // Format worker field value
          if (field.field_type === 'worker') {
            displayValue = getWorkerName(savedValue);
          }
          
          // Add unit information
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
        style={{ background: '#eab308' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="step-details-output"
        style={{ background: '#eab308' }}
      />
      
      <Card 
        className="w-80 bg-yellow-50 border-yellow-200 border-2 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <div className="font-semibold text-yellow-800 text-sm">
                  Step {orderStep.manufacturing_steps?.step_order}: {orderStep.manufacturing_steps?.step_name}
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs mt-1">
                  Partially Completed
                </Badge>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-yellow-100 rounded-lg p-2">
              <div className="text-sm font-medium text-yellow-800">
                Order: {order.order_number}
              </div>
              <div className="text-xs text-yellow-600">
                Product: {order.product_name} | Qty: {order.quantity_required}
              </div>
            </div>

            {/* Worker Info */}
            {assignedWorkerName && (
              <div className="flex items-center gap-2 text-sm bg-yellow-100 rounded-lg p-2">
                <User className="h-4 w-4 text-yellow-600" />
                <span className="text-yellow-600">Worker:</span>
                <span className="font-semibold text-yellow-800">{assignedWorkerName}</span>
              </div>
            )}

            {/* Merchant-Configured Fields */}
            {configuredFieldValues.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-yellow-800">Step Fields:</div>
                {configuredFieldValues.map((field, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm bg-yellow-100 rounded-lg p-2">
                    {getFieldIcon(field.fieldName, field.type)}
                    <span className="text-yellow-600 font-medium">{field.label}:</span>
                    <span className={`font-semibold flex-1 ${
                      field.isEmpty ? 'text-yellow-500 italic' : 'text-yellow-800'
                    }`}>
                      {field.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-yellow-200">
              {!hasReworkOrder && (
                <Button
                  size="sm"
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetupRework();
                  }}
                >
                  <Wrench className="h-4 w-4 mr-1" />
                  Rework
                </Button>
              )}
              
              {nextStep && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartNextStep();
                  }}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start Next Step ({nextStep.step_name})
                </Button>
              )}
              
              {hasReworkOrder && (
                <div className="text-xs text-yellow-600 text-center p-2 bg-yellow-100 rounded">
                  Rework order already created
                </div>
              )}
            </div>
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
    console.log('🔄 Generating nodes and edges...');
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
    
    console.log('Parent Orders:', parentOrders);
    console.log('Child Orders:', childOrders);
    
    let yOffset = 0;
    const nodeSpacing = 400;
    const childOffset = 300;
    const stepCardOffset = 450;

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

      const stepsToShow = parentOrderSteps.filter(step => 
        step.status === 'in_progress' || step.status === 'completed' || step.status === 'partially_completed'
      ).sort((a, b) => a.step_order - b.step_order);
      
      console.log(`Steps to show for ${parentOrder.order_number}:`, stepsToShow);

      let previousNodeId = parentNodeId;

      stepsToShow.forEach((step, stepIndex) => {
        console.log(`🎯 Creating step details card for parent order ${parentOrder.order_number}, step ${step.step_order}`);
        
        const stepFields = getStepFields(step.manufacturing_step_id);
        const stepCardNodeId = `step-details-${step.id}`;
        
        console.log(`Step fields for ${parentOrder.order_number} step ${step.step_order}:`, stepFields);
        
        const nodeType = step.status === 'partially_completed' ? 'partiallyCompletedStepNode' : 'stepDetailsNode';
        
        const stepDetailsNode = {
          id: stepCardNodeId,
          type: nodeType,
          position: { x: stepCardOffset + (stepIndex * 400), y: yOffset },
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
        
        console.log(`Adding step details node:`, stepDetailsNode);
        nodes.push(stepDetailsNode);

        const edgeColor = step.status === 'partially_completed' ? '#eab308' : 
                         step.status === 'completed' ? '#10b981' : '#3b82f6';
        const edgeLabel = step.status === 'partially_completed' ? 'Partially Completed' :
                         step.status === 'completed' ? 'Completed' : 'In Progress';
        
        const stepEdge = {
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
            fontWeight: 600,
            fontSize: '12px'
          },
        };
        
        console.log(`Adding step edge from ${previousNodeId} to ${stepCardNodeId}:`, stepEdge);
        edges.push(stepEdge);

        previousNodeId = stepCardNodeId;
      });

      const relatedChildOrders = childOrders.filter(child => 
        String(child.parent_order_id) === String(parentOrder.id)
      );

      relatedChildOrders.forEach((childOrder, childIndex) => {
        console.log(`Processing child order: ${childOrder.order_number}`);
        
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

        const childStepsToShow = childOrderSteps.filter(step => 
          step.status === 'in_progress' || step.status === 'completed' || step.status === 'partially_completed'
        ).sort((a, b) => a.step_order - b.step_order);

        let previousChildNodeId = childNodeId;

        childStepsToShow.forEach((childStep, childStepIndex) => {
          console.log(`🎯 Creating step details card for child order ${childOrder.order_number}, step ${childStep.step_order}`);
          
          const stepFields = getStepFields(childStep.manufacturing_step_id);
          const childStepCardNodeId = `step-details-${childStep.id}`;
          
          console.log(`Step fields for child ${childOrder.order_number} step ${childStep.step_order}:`, stepFields);
          
          const nodeType = childStep.status === 'partially_completed' ? 'partiallyCompletedStepNode' : 'stepDetailsNode';
          
          const childStepDetailsNode = {
            id: childStepCardNodeId,
            type: nodeType,
            position: { x: 500 + stepCardOffset + (childStepIndex * 400), y: childYOffset },
            data: childStep.status === 'partially_completed' ? {
              orderStep: childStep,
              stepFields: stepFields,
              order: childOrder,
              manufacturingOrders: manufacturingOrders,
              onViewDetails: () => onViewDetails(childOrder)
            } : {
              orderStep: childStep,
              stepFields: stepFields,
              onViewDetails: () => onViewDetails(childOrder)
            },
          };
          
          console.log(`Adding child step details node:`, childStepDetailsNode);
          nodes.push(childStepDetailsNode);

          const edgeColor = childStep.status === 'partially_completed' ? '#eab308' : 
                           childStep.status === 'completed' ? '#10b981' : '#3b82f6';
          const edgeLabel = childStep.status === 'partially_completed' ? 'Partially Completed' :
                           childStep.status === 'completed' ? 'Completed' : 'In Progress';
          
          const childStepEdge = {
            id: `edge-${previousChildNodeId}-${childStepCardNodeId}`,
            source: previousChildNodeId,
            target: childStepCardNodeId,
            sourceHandle: childStepIndex === 0 ? 'order-output' : 'step-details-output',
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
              fontWeight: 600,
              fontSize: '12px'
            },
          };
          
          console.log(`Adding child step edge from ${previousChildNodeId} to ${childStepCardNodeId}:`, childStepEdge);
          edges.push(childStepEdge);

          previousChildNodeId = childStepCardNodeId;
        });

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

      const totalStepCards = stepsToShow.length + relatedChildOrders.reduce((acc, child) => {
        const childSteps = orderSteps.filter(step => 
          String(step.manufacturing_order_id) === String(child.id) &&
          (step.status === 'in_progress' || step.status === 'completed' || step.status === 'partially_completed')
        );
        return acc + childSteps.length;
      }, 0);
      
      yOffset += Math.max(nodeSpacing, (relatedChildOrders.length + 1) * childOffset);
    });

    console.log('🔥 Final generated nodes:', nodes);
    console.log('🔥 Final generated edges:', edges);
    
    return { generatedNodes: nodes, generatedEdges: edges };
  }, [
    JSON.stringify(manufacturingOrders?.map(o => ({ id: o.id, order_number: o.order_number, status: o.status }))),
    JSON.stringify(orderSteps?.map(s => ({ id: s.id, manufacturing_order_id: s.manufacturing_order_id, status: s.status, step_order: s.step_order }))),
    manufacturingSteps.length,
    onViewDetails
  ]);

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
