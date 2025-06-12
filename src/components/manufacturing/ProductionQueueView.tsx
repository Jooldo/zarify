
import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  LayoutGrid,
  Calendar,
  TrendingUp,
  Users,
  Package,
  RefreshCw
} from 'lucide-react';
import ManufacturingStepCard, { StepCardData } from './ManufacturingStepCard';
import StepDetailsDialog from './StepDetailsDialog';
import CreateStepDialog from './CreateStepDialog';
import UpdateStepDialog from './UpdateStepDialog';
import { useToast } from '@/hooks/use-toast';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import { useManufacturingSteps, ManufacturingStep, ManufacturingOrderStep } from '@/hooks/useManufacturingSteps';
import { useWorkers } from '@/hooks/useWorkers';
import { useCreateManufacturingStep } from '@/hooks/useCreateManufacturingStep';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import CardSkeleton from '@/components/ui/skeletons/CardSkeleton';

// Helper function to check if data is StepCardData
const isStepCardData = (data: Record<string, unknown>): data is StepCardData => {
  return (
    typeof data.stepName === 'string' &&
    typeof data.stepOrder === 'number' &&
    typeof data.orderId === 'string' &&
    typeof data.orderNumber === 'string' &&
    typeof data.productName === 'string' &&
    typeof data.status === 'string' &&
    typeof data.progress === 'number'
  );
};

const ProductionQueueView = () => {
  const { toast } = useToast();
  const { manufacturingOrders, loading: ordersLoading } = useManufacturingOrders();
  const { manufacturingSteps, orderSteps, stepFields, isLoading: stepsLoading } = useManufacturingSteps();
  const { workers } = useWorkers();
  const { createStep, isCreating } = useCreateManufacturingStep();
  const { isLoading: valuesLoading, getStepValue } = useManufacturingStepValues();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Dialog states
  const [selectedStepData, setSelectedStepData] = useState<StepCardData | null>(null);
  const [isStepDetailsOpen, setIsStepDetailsOpen] = useState(false);
  const [isCreateStepDialogOpen, setIsCreateStepDialogOpen] = useState(false);
  const [isUpdateStepDialogOpen, setIsUpdateStepDialogOpen] = useState(false);
  const [targetStep, setTargetStep] = useState<ManufacturingStep | null>(null);

  console.log('=== PRODUCTION QUEUE DEBUG ===');
  console.log('Manufacturing Orders:', manufacturingOrders);
  console.log('Manufacturing Orders Count:', manufacturingOrders?.length || 0);
  console.log('Order Steps:', orderSteps);
  console.log('Manufacturing Steps from DB:', manufacturingSteps);
  console.log('Step Fields:', stepFields);
  console.log('Loading states:', { ordersLoading, stepsLoading, valuesLoading });

  // Helper function to get fields for a specific step
  const getStepFields = (stepId: string) => {
    return stepFields.filter(field => field.manufacturing_step_id === stepId);
  };

  // Helper function to determine the furthest progressed step for an order
  const getFurthestProgressedStep = (orderId: string) => {
    const orderStepsForOrder = orderSteps.filter(step => step.manufacturing_order_id === orderId);
    
    if (orderStepsForOrder.length === 0) {
      return 0; // Only show Manufacturing Order card
    }

    // Find the furthest step that has been started (in_progress or completed)
    let furthestStep = 0;
    for (const step of orderStepsForOrder) {
      const configStep = manufacturingSteps.find(s => s.id === step.manufacturing_step_id);
      if (configStep && (step.status === 'in_progress' || step.status === 'completed')) {
        furthestStep = Math.max(furthestStep, configStep.step_order);
      }
    }

    // If we have any completed steps, show up to the next pending step
    const hasCompletedSteps = orderStepsForOrder.some(step => step.status === 'completed');
    if (hasCompletedSteps) {
      return furthestStep + 1; // Show next step after completed ones
    }

    // If we have in-progress steps, show up to that step
    const hasInProgressSteps = orderStepsForOrder.some(step => step.status === 'in_progress');
    if (hasInProgressSteps) {
      return furthestStep;
    }

    // If no steps are started yet, only show Manufacturing Order
    return 0;
  };

  // Generate step nodes from manufacturing orders with progressive display
  const generateStepNodes = useMemo((): Node[] => {
    console.log('=== GENERATING STEP NODES ===');
    console.log('Input data check:');
    console.log('- manufacturingOrders:', manufacturingOrders?.length || 0);
    console.log('- manufacturingSteps:', manufacturingSteps?.length || 0);
    console.log('- orderSteps:', orderSteps?.length || 0);
    
    if (!manufacturingOrders || manufacturingOrders.length === 0) {
      console.log('❌ No manufacturing orders found');
      return [];
    }

    if (!manufacturingSteps || manufacturingSteps.length === 0) {
      console.log('❌ No manufacturing steps found');
      return [];
    }

    const stepNodes: Node[] = [];
    let nodeIndex = 0;

    manufacturingOrders.forEach((order, orderIndex) => {
      console.log(`🔄 Processing order ${orderIndex + 1}/${manufacturingOrders.length}:`, order.order_number);
      
      // Determine how many steps to show for this order
      const maxStepToShow = getFurthestProgressedStep(order.id);
      console.log(`📊 Order ${order.order_number} - showing steps up to: ${maxStepToShow}`);

      // Always add the manufacturing order card
      const manufacturingOrderData: StepCardData = {
        stepName: 'Manufacturing Order',
        stepOrder: 0,
        orderId: order.id,
        orderNumber: order.order_number,
        productName: order.product_name,
        status: order.status === 'pending' ? 'pending' : 'in_progress',
        progress: order.status === 'completed' ? 100 : 0,
        assignedWorker: undefined,
        estimatedDuration: 0,
        isJhalaiStep: false,
        quantityRequired: order.quantity_required,
        priority: order.priority,
        stepFields: [], // Manufacturing order doesn't have custom fields
        dueDate: order.due_date,
      };

      const orderNodeId = `${order.id}-manufacturing-order`;
      console.log(`✅ Adding Manufacturing Order node: ${orderNodeId}`);

      stepNodes.push({
        id: orderNodeId,
        type: 'stepCard',
        position: { 
          x: 50, 
          y: orderIndex * 160 + 50 // Reduced spacing
        },
        data: manufacturingOrderData,
      });

      // Add manufacturing steps from configuration only up to the determined max step
      const sortedSteps = manufacturingSteps
        .filter(step => step.is_active)
        .sort((a, b) => a.step_order - b.step_order);

      console.log(`📋 Available steps for order ${order.order_number}:`, sortedSteps.map(s => `${s.step_order}: ${s.step_name}`));

      sortedSteps.forEach((configStep, stepIndex) => {
        // Only show steps up to the max step to show
        if (configStep.step_order > maxStepToShow) {
          console.log(`⏭️ Skipping step ${configStep.step_name} (order ${configStep.step_order} > max ${maxStepToShow})`);
          return; // Skip this step - don't show it yet
        }

        const actualStep = orderSteps.find(step => 
          step.manufacturing_order_id === order.id && 
          step.manufacturing_step_id === configStep.id
        );

        // If we're showing this step but it doesn't exist in orderSteps yet, 
        // create a pending step placeholder (for the next step to be started)
        let stepStatus: StepCardData['status'] = 'pending';
        let progress = 0;
        let assignedWorker = undefined;

        if (actualStep) {
          console.log(`📌 Found actual step data for ${configStep.step_name}:`, actualStep);

          switch (actualStep.status) {
            case 'in_progress':
              stepStatus = 'in_progress';
              progress = actualStep.progress_percentage || 0;
              break;
            case 'completed':
              stepStatus = 'completed';
              progress = 100;
              break;
            case 'blocked':
              stepStatus = 'blocked';
              progress = actualStep.progress_percentage || 0;
              break;
            default:
              stepStatus = 'pending';
              progress = 0;
          }
          assignedWorker = actualStep.workers?.name;
        } else {
          console.log(`📝 Creating placeholder for step ${configStep.step_name}`);
        }

        // Get step-specific fields from configuration
        const stepFieldsConfig = getStepFields(configStep.id);

        // Get material and quantity values from step fields if the step exists
        let materialAssignedValue: number | undefined;
        let materialReceivedValue: number | undefined;
        let quantityAssignedValue: number | undefined;
        let quantityReceivedValue: number | undefined;

        if (actualStep && stepFieldsConfig.length > 0) {
          const materialAssignedField = stepFieldsConfig.find(field => 
            field.field_name.toLowerCase().includes('material') && 
            field.field_name.toLowerCase().includes('assigned')
          );
          const materialReceivedField = stepFieldsConfig.find(field => 
            field.field_name.toLowerCase().includes('material') && 
            field.field_name.toLowerCase().includes('received')
          );
          const quantityAssignedField = stepFieldsConfig.find(field => 
            field.field_name.toLowerCase().includes('quantity') && 
            field.field_name.toLowerCase().includes('assigned')
          );
          const quantityReceivedField = stepFieldsConfig.find(field => 
            field.field_name.toLowerCase().includes('quantity') && 
            field.field_name.toLowerCase().includes('received')
          );

          if (materialAssignedField) {
            const value = getStepValue(actualStep.id, materialAssignedField.field_id);
            materialAssignedValue = value ? Number(value) : undefined;
          }
          if (materialReceivedField) {
            const value = getStepValue(actualStep.id, materialReceivedField.field_id);
            materialReceivedValue = value ? Number(value) : undefined;
          }
          if (quantityAssignedField) {
            const value = getStepValue(actualStep.id, quantityAssignedField.field_id);
            quantityAssignedValue = value ? Number(value) : undefined;
          }
          if (quantityReceivedField) {
            const value = getStepValue(actualStep.id, quantityReceivedField.field_id);
            quantityReceivedValue = value ? Number(value) : undefined;
          }
        }

        const stepData: StepCardData = {
          stepName: configStep.step_name,
          stepOrder: configStep.step_order,
          orderId: order.id,
          orderNumber: order.order_number,
          productName: order.product_name,
          status: stepStatus,
          progress: progress,
          assignedWorker: assignedWorker,
          estimatedDuration: configStep.estimated_duration_hours,
          isJhalaiStep: configStep.step_name.toLowerCase() === 'jhalai',
          quantityRequired: order.quantity_required,
          priority: order.priority,
          stepFields: stepFieldsConfig,
          qcRequired: configStep.qc_required,
          dueDate: order.due_date,
          materialAssignedValue,
          materialReceivedValue,
          quantityAssignedValue,
          quantityReceivedValue,
        };

        const nodeId = `${order.id}-step-${configStep.step_order}`;
        console.log(`✅ Adding step node: ${nodeId} - ${configStep.step_name}`);
        
        stepNodes.push({
          id: nodeId,
          type: 'stepCard',
          position: { 
            x: (stepIndex + 1) * 260 + 50, // Reduced spacing
            y: orderIndex * 160 + 50 // Reduced spacing
          },
          data: stepData,
        });
      });

      nodeIndex++;
    });

    console.log(`🎯 Generated ${stepNodes.length} total nodes`);
    console.log('Generated nodes:', stepNodes.map(n => ({ id: n.id, type: n.type, stepName: isStepCardData(n.data) ? n.data.stepName : 'Unknown' })));
    return stepNodes;
  }, [manufacturingOrders, orderSteps, manufacturingSteps, stepFields, getStepValue]);

  const [nodes, setNodes, onNodesChange] = useNodesState(generateStepNodes);

  // Generate edges to connect sequential steps - now defined after nodes
  const generateStepEdges = useMemo(() => {
    const edges: any[] = [];
    
    manufacturingOrders.forEach((order) => {
      // Connect manufacturing order to first actual step
      const firstStepInOrder = nodes.find(node => 
        node.id.startsWith(`${order.id}-step-`) && 
        isStepCardData(node.data) && 
        node.data.stepOrder === 1
      );

      if (firstStepInOrder) {
        edges.push({
          id: `${order.id}-manufacturing-to-first`,
          source: `${order.id}-manufacturing-order`,
          target: firstStepInOrder.id,
          type: 'smoothstep',
          style: { stroke: '#3b82f6', strokeWidth: 2 },
          animated: true,
        });
      }

      // Connect sequential steps within the same order
      const orderStepNodes = nodes.filter(node => 
        node.id.startsWith(`${order.id}-step-`) && 
        isStepCardData(node.data)
      ).sort((a, b) => {
        const aData = a.data as StepCardData;
        const bData = b.data as StepCardData;
        return aData.stepOrder - bData.stepOrder;
      });

      for (let i = 0; i < orderStepNodes.length - 1; i++) {
        const sourceNode = orderStepNodes[i];
        const targetNode = orderStepNodes[i + 1];
        
        edges.push({
          id: `${sourceNode.id}-to-${targetNode.id}`,
          source: sourceNode.id,
          target: targetNode.id,
          type: 'smoothstep',
          style: { stroke: '#9ca3af', strokeWidth: 2 },
          animated: false,
        });
      }
    });

    return edges;
  }, [manufacturingOrders, nodes]);

  const [edges, setEdges, onEdgesChange] = useEdgesState(generateStepEdges);

  // Update nodes when data changes
  React.useEffect(() => {
    console.log('🔄 Updating nodes with generated step data. New nodes count:', generateStepNodes.length);
    setNodes(generateStepNodes);
  }, [generateStepNodes, setNodes]);

  React.useEffect(() => {
    console.log('🔄 Updating edges with generated step edges. New edges count:', generateStepEdges.length);
    setEdges(generateStepEdges);
  }, [generateStepEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleStepClick = useCallback((stepData: StepCardData) => {
    console.log('Step clicked:', stepData);
    
    // If it's a manufacturing order, open details
    if (stepData.stepName === 'Manufacturing Order' || stepData.stepOrder === 0) {
      setSelectedStepData(stepData);
      setIsStepDetailsOpen(true);
    } else {
      // For actual manufacturing steps, check if they exist in the database
      const currentOrderStep = orderSteps.find(step => 
        step.manufacturing_order_id === stepData.orderId && 
        step.manufacturing_steps?.step_order === stepData.stepOrder
      );
      
      if (currentOrderStep) {
        // Step exists, open update dialog
        setSelectedStepData(stepData);
        setIsUpdateStepDialogOpen(true);
      } else {
        // Step doesn't exist yet, open details dialog
        setSelectedStepData(stepData);
        setIsStepDetailsOpen(true);
      }
    }
  }, [orderSteps]);

  const handleCreateStep = useCallback((stepData: any) => {
    console.log('Creating step:', stepData);
    
    // Create the step using the new hook
    createStep({
      manufacturingOrderId: stepData.manufacturingOrderId,
      stepId: stepData.stepId,
      fieldValues: stepData.fieldValues,
    });
    
    setIsCreateStepDialogOpen(false);
  }, [createStep]);

  const handleAddStep = useCallback((stepData: StepCardData) => {
    console.log('Add step clicked for:', stepData);
    
    if (stepData.stepName === 'Manufacturing Order' && stepData.status === 'pending') {
      // Get the first step from manufacturing steps configuration
      const firstStep = manufacturingSteps
        .filter(step => step.is_active)
        .sort((a, b) => a.step_order - b.step_order)[0];
      
      if (firstStep) {
        setSelectedStepData(stepData);
        setTargetStep(firstStep);
        setIsCreateStepDialogOpen(true);
      } else {
        toast({
          title: 'No Steps Configured',
          description: 'No manufacturing steps are configured for this workflow',
          variant: 'destructive',
        });
      }
    } else {
      // For non-manufacturing order steps, get the next step
      const currentStepOrder = stepData.stepOrder;
      const nextStep = manufacturingSteps
        .filter(step => step.is_active)
        .find(step => step.step_order === currentStepOrder + 1);
      
      if (nextStep) {
        setSelectedStepData(stepData);
        setTargetStep(nextStep);
        setIsCreateStepDialogOpen(true);
      } else {
        toast({
          title: 'No Next Step',
          description: 'This is the final step in the workflow',
        });
      }
    }
  }, [manufacturingSteps, toast]);

  // FIXED: Memoize nodeTypes to prevent React Flow warning
  const nodeTypes = useMemo(() => ({
    stepCard: (props: any) => (
      <ManufacturingStepCard
        {...props}
        manufacturingSteps={manufacturingSteps}
        orderSteps={orderSteps}
        onAddStep={handleAddStep}
        onStepClick={handleStepClick}
      />
    ),
  }), [manufacturingSteps, orderSteps, handleAddStep, handleStepClick]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (isStepCardData(node.data)) {
      handleStepClick(node.data);
    }
  }, [handleStepClick]);

  // Filter nodes based on search and status
  const filteredNodes = useMemo(() => {
    console.log('🔍 Filtering nodes...');
    console.log('- Total nodes before filtering:', nodes.length);
    console.log('- Search term:', searchTerm);
    console.log('- Selected status:', selectedStatus);
    
    const filtered = nodes.filter(node => {
      if (!isStepCardData(node.data)) {
        console.log('❌ Node failed StepCardData check:', node.id);
        return false;
      }
      
      const nodeData = node.data;
      const matchesSearch = nodeData.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           nodeData.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           nodeData.stepName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || nodeData.status === selectedStatus;
      
      const passes = matchesSearch && matchesStatus;
      if (!passes) {
        console.log(`🚫 Node ${node.id} filtered out - search: ${matchesSearch}, status: ${matchesStatus}`);
      }
      
      return passes;
    });
    
    console.log(`✅ Filtered to ${filtered.length} nodes`);
    return filtered;
  }, [nodes, searchTerm, selectedStatus]);

  // Calculate statistics
  const stats = useMemo(() => {
    const validNodeData = nodes.map(n => n.data).filter(isStepCardData);
    return {
      total: validNodeData.length,
      inProgress: validNodeData.filter(n => n.status === 'in_progress').length,
      completed: validNodeData.filter(n => n.status === 'completed').length,
      blocked: validNodeData.filter(n => n.status === 'blocked').length,
    };
  }, [nodes]);

  // Get current order step and previous steps for update dialog
  const getCurrentOrderStep = () => {
    if (!selectedStepData) return null;
    return orderSteps.find(step => 
      step.manufacturing_order_id === selectedStepData.orderId && 
      step.manufacturing_steps?.step_order === selectedStepData.stepOrder
    ) || null;
  };

  const getPreviousSteps = () => {
    if (!selectedStepData) return [];
    return orderSteps
      .filter(step => 
        step.manufacturing_order_id === selectedStepData.orderId && 
        step.manufacturing_steps && 
        step.manufacturing_steps.step_order < selectedStepData.stepOrder
      )
      .sort((a, b) => (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0));
  };

  console.log('🎨 Final render state:');
  console.log('- Filtered nodes count:', filteredNodes.length);
  console.log('- Stats:', stats);
  console.log('- Loading states:', { ordersLoading, stepsLoading, valuesLoading });

  if (ordersLoading || stepsLoading || valuesLoading) {
    console.log('⏳ Showing loading state');
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} showHeader={true} headerHeight="h-6" contentHeight="h-20" />
          ))}
        </div>
        <CardSkeleton showHeader={true} headerHeight="h-8" contentHeight="h-96" />
      </div>
    );
  }

  return (
    <>
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="border-b bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Production Queue</h1>
              <p className="text-muted-foreground">Visual workflow showing each manufacturing step as cards</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <LayoutGrid className="w-4 h-4 mr-2" />
                Layout
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  <div>
                    <div className="text-lg font-bold">{stats.total}</div>
                    <div className="text-xs text-muted-foreground">Total Steps</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-yellow-500" />
                  <div>
                    <div className="text-lg font-bold">{stats.inProgress}</div>
                    <div className="text-xs text-muted-foreground">In Progress</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="text-lg font-bold">{stats.completed}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-500" />
                  <div>
                    <div className="text-lg font-bold">{stats.blocked}</div>
                    <div className="text-xs text-muted-foreground">Blocked</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search steps, products or order numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          {filteredNodes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Production Queue Items</h3>
                <p className="text-muted-foreground">
                  {manufacturingOrders.length === 0 ? (
                    "Create some manufacturing orders to see them here."
                  ) : (
                    searchTerm || selectedStatus !== 'all' ? 
                    "No items match your current filters." :
                    "No production steps are currently visible."
                  )}
                </p>
              </div>
            </div>
          ) : (
            <ReactFlow
              nodes={filteredNodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              className="bg-background"
            >
              <Controls />
              <MiniMap 
                nodeColor={(node) => {
                  if (isStepCardData(node.data)) {
                    if (node.data.isJhalaiStep) return '#3b82f6';
                    switch (node.data.status) {
                      case 'completed': return '#22c55e';
                      case 'in_progress': return '#eab308';
                      case 'blocked': return '#ef4444';
                      default: return '#6b7280';
                    }
                  }
                  return '#6b7280';
                }}
                className="bg-background border border-border"
              />
              <Background gap={20} size={1} />
            </ReactFlow>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <StepDetailsDialog
        open={isStepDetailsOpen}
        onOpenChange={setIsStepDetailsOpen}
        stepData={selectedStepData}
      />

      <CreateStepDialog
        open={isCreateStepDialogOpen}
        onOpenChange={setIsCreateStepDialogOpen}
        manufacturingOrderData={selectedStepData}
        targetStep={targetStep}
        stepFields={targetStep ? getStepFields(targetStep.id) : []}
        onCreateStep={handleCreateStep}
      />

      <UpdateStepDialog
        open={isUpdateStepDialogOpen}
        onOpenChange={setIsUpdateStepDialogOpen}
        stepData={selectedStepData}
        currentOrderStep={getCurrentOrderStep()}
        stepFields={selectedStepData ? getStepFields(manufacturingSteps.find(s => s.step_name === selectedStepData.stepName)?.id || '') : []}
        previousSteps={getPreviousSteps()}
      />
    </>
  );
};

export default ProductionQueueView;
