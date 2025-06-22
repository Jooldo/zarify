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

// Enhanced Step Details Card with proper handles for branching
const EnhancedStepDetailsCard: React.FC<{
  data: {
    orderStep: any;
    stepFields: any[];
    order: any;
    manufacturingOrders: any[];
    onViewDetails: (order: any) => void;
    canBranch?: boolean;
    hasNextStep?: boolean;
    hasReworkOrder?: boolean;
  }
}> = ({ data }) => {
  const { orderStep, stepFields, order, manufacturingOrders, onViewDetails, canBranch, hasNextStep, hasReworkOrder } = data;
  const { getStepValue } = useManufacturingStepValues();
  const { workers } = useWorkers();
  const { manufacturingSteps } = useManufacturingSteps();
  const [showReworkDialog, setShowReworkDialog] = useState(false);
  const [showStartNextDialog, setShowStartNextDialog] = useState(false);

  const isPartiallyCompleted = orderStep.status === 'partially_completed';

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

  const nextStep = getNextStepInfo();

  return (
    <>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="step-input"
        style={{ background: '#6b7280', border: 'none', width: 8, height: 8 }}
      />
      
      {/* Output handles for branching - only show if this step can branch */}
      {canBranch && isPartiallyCompleted && (
        <>
          {/* Next step output handle (top right) */}
          {hasNextStep && (
            <Handle
              type="source"
              position={Position.Right}
              id="next-step-output"
              style={{ 
                background: '#10b981', 
                border: 'none', 
                width: 10, 
                height: 10, 
                top: '30%' 
              }}
            />
          )}
          
          {/* Rework output handle (bottom right) */}
          <Handle
            type="source"
            position={Position.Right}
            id="rework-output"
            style={{ 
              background: '#f97316', 
              border: 'none', 
              width: 10, 
              height: 10, 
              top: '70%' 
            }}
          />
        </>
      )}
      
      {/* Standard output handle for non-branching steps */}
      {!canBranch && (
        <Handle
          type="source"
          position={Position.Right}
          id="step-output"
          style={{ background: '#6b7280', border: 'none', width: 8, height: 8 }}
        />
      )}
      
      <Card 
        className={`w-80 shadow-sm border transition-all duration-200 ${
          isPartiallyCompleted 
            ? 'border-l-4 border-l-orange-400 bg-gradient-to-r from-orange-50/30 to-white' 
            : 'bg-white'
        } hover:shadow-md cursor-pointer`}
        onClick={() => onViewDetails(order)}
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
            <Badge className={`text-xs ${
              isPartiallyCompleted 
                ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                : orderStep.status === 'completed'
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : 'bg-blue-100 text-blue-700 border border-blue-200'
            }`}>
              {orderStep.status === 'partially_completed' ? 'PARTIALLY COMPLETED' :
               orderStep.status === 'completed' ? 'COMPLETED' :
               orderStep.status === 'in_progress' ? 'IN PROGRESS' : 
               orderStep.status?.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Show branching indicator for partially completed steps */}
          {isPartiallyCompleted && canBranch && (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="text-xs font-medium text-slate-600 mb-2">Parallel Outcomes:</div>
              <div className="space-y-2">
                {hasNextStep && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-0.5 bg-green-500 rounded"></div>
                    <span className="text-green-600 font-medium">Continue to Next Step</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-0.5 bg-orange-500 rounded border-dashed border border-orange-400"></div>
                  <span className="text-orange-600 font-medium">Setup Rework</span>
                </div>
              </div>
            </div>
          )}

          {/* Progress bar for partially completed */}
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

          {/* Worker Assignment */}
          {orderStep.workers?.name && (
            <div className="flex items-center gap-2 text-xs p-2 rounded-md bg-blue-50 border border-blue-100">
              <User className="h-3 w-3 text-blue-500" />
              <span className="text-slate-600">Assigned to:</span>
              <span className="font-medium text-blue-700">{orderStep.workers.name}</span>
            </div>
          )}

          {/* Timestamps */}
          <div className="space-y-1 text-xs text-slate-500 border-t pt-2">
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

      {/* Dialogs */}
      {showReworkDialog && orderStep.manufacturing_steps && (
        <CreateChildOrderDialog
          isOpen={showReworkDialog}
          onClose={() => setShowReworkDialog(false)}
          parentOrder={order}
          currentStep={orderStep.manufacturing_steps}
          parentOrderStep={orderStep}
          onSuccess={() => setShowReworkDialog(false)}
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
    <EnhancedStepDetailsCard
      data={{
        orderStep: data.orderStep,
        stepFields: data.stepFields,
        order: data.order,
        manufacturingOrders: data.manufacturingOrders,
        onViewDetails: data.onViewDetails,
        canBranch: data.canBranch,
        hasNextStep: data.hasNextStep,
        hasReworkOrder: data.hasReworkOrder
      }}
    />
  ),
  partiallyCompletedStepNode: ({ data }: { data: any }) => (
    <EnhancedStepDetailsCard
      data={{
        orderStep: data.orderStep,
        stepFields: data.stepFields,
        order: data.order,
        manufacturingOrders: data.manufacturingOrders,
        onViewDetails: data.onViewDetails,
        canBranch: true,
        hasNextStep: data.hasNextStep,
        hasReworkOrder: data.hasReworkOrder
      }}
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
    const HORIZONTAL_SPACING = 500;
    const VERTICAL_SPACING = 800;
    const REWORK_VERTICAL_OFFSET = 300;
    
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

      // Position parent order node
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

      // Create step detail cards with enhanced branching support
      const stepsToShow = parentOrderSteps.filter(step => 
        step.status === 'in_progress' || step.status === 'completed' || step.status === 'partially_completed'
      ).sort((a, b) => a.step_order - b.step_order);
      
      console.log(`📋 Steps to show for ${parentOrder.order_number}:`, stepsToShow.length);

      let previousNodeId = parentNodeId;

      stepsToShow.forEach((step, stepIndex) => {
        const stepFields = getStepFields(step.manufacturing_step_id);
        const stepCardNodeId = `step-details-${step.id}`;
        
        const stepCardPosition = {
          x: parentPosition.x + 400 + (stepIndex * HORIZONTAL_SPACING),
          y: parentPosition.y
        };
        
        // Check if this step has branching capability
        const isPartiallyCompleted = step.status === 'partially_completed';
        const currentStepOrder = step.manufacturing_steps?.step_order;
        
        // Check for next step
        const nextStep = manufacturingSteps.find(s => 
          s.step_order === currentStepOrder + 1 && 
          s.is_active && 
          s.merchant_id === step.merchant_id
        );
        
        const nextOrderStep = nextStep ? parentOrderSteps.find(os => 
          String(os.manufacturing_step_id) === String(nextStep.id)
        ) : null;
        
        const hasNextStep = nextOrderStep && (nextOrderStep.status === 'in_progress' || nextOrderStep.status === 'completed');
        
        // Check for rework order
        const relatedReworkOrder = childOrders.find(child => 
          String(child.parent_order_id) === String(parentOrder.id) &&
          child.rework_from_step === currentStepOrder
        );
        
        const hasReworkOrder = !!relatedReworkOrder;
        
        console.log(`📋 Step ${step.manufacturing_steps?.step_name}: partially completed = ${isPartiallyCompleted}, has next = ${hasNextStep}, has rework = ${hasReworkOrder}`);
        
        const stepDetailsNode = {
          id: stepCardNodeId,
          type: isPartiallyCompleted ? 'partiallyCompletedStepNode' : 'stepDetailsNode',
          position: stepCardPosition,
          data: {
            orderStep: step,
            stepFields: stepFields,
            order: parentOrder,
            manufacturingOrders: manufacturingOrders,
            onViewDetails: () => onViewDetails(parentOrder),
            canBranch: isPartiallyCompleted,
            hasNextStep: hasNextStep,
            hasReworkOrder: hasReworkOrder
          },
        };
        
        nodes.push(stepDetailsNode);

        // Create standard connection from previous node
        const edgeColor = step.status === 'partially_completed' ? '#f97316' : 
                         step.status === 'completed' ? '#10b981' : '#3b82f6';
        const edgeLabel = step.status === 'partially_completed' ? 'Partially Completed' :
                         step.status === 'completed' ? 'Completed' : 'In Progress';
        
        edges.push({
          id: `edge-${previousNodeId}-${stepCardNodeId}`,
          source: previousNodeId,
          target: stepCardNodeId,
          sourceHandle: stepIndex === 0 ? 'order-output' : 'step-output',
          targetHandle: 'step-input',
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

        // PARALLEL BRANCHING LOGIC for partially completed steps
        if (isPartiallyCompleted) {
          console.log(`🔀 Creating parallel branches for step ${step.manufacturing_steps?.step_name}`);
          
          // 1. Create next step branch (green edge)
          if (hasNextStep && nextOrderStep) {
            const nextStepNodeId = `step-details-${nextOrderStep.id}`;
            
            console.log(`✅ Creating next step branch to ${nextStepNodeId}`);
            
            edges.push({
              id: `next-step-${stepCardNodeId}-${nextStepNodeId}`,
              source: stepCardNodeId,
              target: nextStepNodeId,
              sourceHandle: 'next-step-output',
              targetHandle: 'step-input',
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

          // 2. Create rework branch (orange edge)
          if (hasReworkOrder && relatedReworkOrder) {
            console.log(`🔧 Creating rework branch for order ${relatedReworkOrder.order_number}`);
            
            // Position rework order below the current step
            const reworkPosition = {
              x: stepCardPosition.x + 50,
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

            // Add rework order node
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

            // Create rework connection edge
            edges.push({
              id: `rework-branch-${stepCardNodeId}-${reworkNodeId}`,
              source: stepCardNodeId,
              target: reworkNodeId,
              sourceHandle: 'rework-output',
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

            // Add rework step cards
            const reworkStepsToShow = reworkOrderSteps.filter(s => 
              s.status === 'in_progress' || s.status === 'completed' || s.status === 'partially_completed'
            ).sort((a, b) => a.step_order - b.step_order);

            let previousReworkNodeId = reworkNodeId;

            reworkStepsToShow.forEach((reworkStep, reworkStepIndex) => {
              const reworkStepFields = getStepFields(reworkStep.manufacturing_step_id);
              const reworkStepCardNodeId = `step-details-${reworkStep.id}`;
              
              const reworkStepPosition = {
                x: reworkPosition.x + 400 + (reworkStepIndex * HORIZONTAL_SPACING),
                y: reworkPosition.y
              };
              
              const reworkStepDetailsNode = {
                id: reworkStepCardNodeId,
                type: reworkStep.status === 'partially_completed' ? 'partiallyCompletedStepNode' : 'stepDetailsNode',
                position: reworkStepPosition,
                data: {
                  orderStep: reworkStep,
                  stepFields: reworkStepFields,
                  order: relatedReworkOrder,
                  manufacturingOrders: manufacturingOrders,
                  onViewDetails: () => onViewDetails(relatedReworkOrder),
                  canBranch: reworkStep.status === 'partially_completed',
                  hasNextStep: false, // For simplicity, not implementing nested rework branching
                  hasReworkOrder: false
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
                sourceHandle: reworkStepIndex === 0 ? 'order-output' : 'step-output',
                targetHandle: 'step-input',
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
