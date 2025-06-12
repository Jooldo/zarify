
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
  Edge,
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

// Define proper node data interface that extends Record<string, unknown>
interface NodeData extends Record<string, unknown> {
  label: string;
  stepData: StepCardData;
}

// Helper function to safely check if data is NodeData
const isNodeData = (data: any): data is NodeData => {
  return data && 
         typeof data === 'object' && 
         typeof data.label === 'string' && 
         data.stepData &&
         typeof data.stepData === 'object';
};

// Helper function to check if data is StepCardData
const isStepCardData = (data: any): data is StepCardData => {
  return data &&
         typeof data === 'object' &&
         typeof data.stepName === 'string' &&
         typeof data.stepOrder === 'number' &&
         typeof data.orderId === 'string' &&
         typeof data.orderNumber === 'string' &&
         typeof data.productName === 'string' &&
         typeof data.status === 'string' &&
         typeof data.progress === 'number';
};

const ProductionQueueView = () => {
  console.log('🚀 ProductionQueueView component is rendering!');
  
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

  console.log('🔍 PRODUCTION QUEUE DATA CHECK:');
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

  // Create nodes data with proper spacing and positioning
  const nodesData = useMemo((): Node[] => {
    console.log('🎯 GENERATING NODES DATA...');
    
    if (!manufacturingOrders || manufacturingOrders.length === 0) {
      console.log('❌ No manufacturing orders - returning empty array');
      return [];
    }

    const nodes: Node[] = [];
    const VERTICAL_SPACING = 300; // Space between rows
    const HORIZONTAL_SPACING = 400; // Space between columns

    manufacturingOrders.forEach((order, orderIndex) => {
      console.log(`📦 Processing order ${orderIndex + 1}: ${order.order_number}`);
      
      const yPosition = orderIndex * VERTICAL_SPACING + 100;
      
      // Manufacturing Order Node
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
        stepFields: [],
        dueDate: order.due_date,
      };

      const orderNodeId = `order-${order.id}`;
      console.log(`✅ Creating Manufacturing Order node: ${orderNodeId}`);

      const nodeData: NodeData = { 
        label: `${order.order_number} - ${order.product_name}`,
        stepData: manufacturingOrderData
      };

      nodes.push({
        id: orderNodeId,
        type: 'default',
        position: { 
          x: 50, 
          y: yPosition
        },
        data: nodeData,
        style: {
          background: '#ffffff',
          border: '2px solid #3b82f6',
          borderRadius: '8px',
          padding: '15px',
          width: 300,
          fontSize: '14px',
        },
      });

      // First Manufacturing Step Node (if available)
      if (manufacturingSteps && manufacturingSteps.length > 0) {
        const firstStep = manufacturingSteps
          .filter(step => step.is_active)
          .sort((a, b) => a.step_order - b.step_order)[0];

        if (firstStep) {
          const actualStep = orderSteps.find(step => 
            step.manufacturing_order_id === order.id && 
            step.manufacturing_step_id === firstStep.id
          );

          let stepStatus: StepCardData['status'] = 'pending';
          let progress = 0;
          let assignedWorker = undefined;

          if (actualStep) {
            console.log(`📌 Found actual step data for ${firstStep.step_name}`);
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
          }

          const stepData: StepCardData = {
            stepName: firstStep.step_name,
            stepOrder: firstStep.step_order,
            orderId: order.id,
            orderNumber: order.order_number,
            productName: order.product_name,
            status: stepStatus,
            progress: progress,
            assignedWorker: assignedWorker,
            estimatedDuration: firstStep.estimated_duration_hours,
            isJhalaiStep: firstStep.step_name.toLowerCase() === 'jhalai' || firstStep.step_name.toLowerCase().includes('jhalai'),
            quantityRequired: order.quantity_required,
            priority: order.priority,
            stepFields: getStepFields(firstStep.id),
            qcRequired: firstStep.qc_required,
            dueDate: order.due_date,
          };

          const stepNodeId = `step-${order.id}-${firstStep.step_order}`;
          console.log(`✅ Creating step node: ${stepNodeId} - ${firstStep.step_name}`);
          
          const stepNodeData: NodeData = { 
            label: `${firstStep.step_name}\nStatus: ${stepStatus}`,
            stepData: stepData
          };
          
          nodes.push({
            id: stepNodeId,
            type: 'default',
            position: { 
              x: 50 + HORIZONTAL_SPACING,
              y: yPosition
            },
            data: stepNodeData,
            style: {
              background: stepStatus === 'completed' ? '#dcfce7' : 
                         stepStatus === 'in_progress' ? '#fef3c7' : 
                         stepStatus === 'blocked' ? '#fee2e2' : '#f8fafc',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              padding: '15px',
              width: 250,
              fontSize: '12px',
            },
          });
        }
      }
    });

    console.log(`🎯 Generated ${nodes.length} total nodes`);
    console.log('📊 Nodes data:', nodes);
    return nodes;
  }, [manufacturingOrders, orderSteps, manufacturingSteps, stepFields]);

  // Create initial nodes and edges with proper typing
  const [nodes, setNodes, onNodesChange] = useNodesState(nodesData);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Update nodes when data changes
  React.useEffect(() => {
    console.log('🔄 Setting nodes with new data. Nodes count:', nodesData.length);
    console.log('🔄 Nodes to set:', nodesData);
    setNodes(nodesData);
  }, [nodesData, setNodes]);

  // Create edges between connected nodes
  React.useEffect(() => {
    if (nodesData.length > 0) {
      const newEdges: Edge[] = [];
      
      manufacturingOrders?.forEach((order) => {
        const orderNodeId = `order-${order.id}`;
        const stepNodeId = `step-${order.id}-1`;
        
        if (nodesData.find(n => n.id === orderNodeId) && nodesData.find(n => n.id === stepNodeId)) {
          newEdges.push({
            id: `edge-${order.id}`,
            source: orderNodeId,
            target: stepNodeId,
            type: 'smoothstep',
            style: { stroke: '#3b82f6', strokeWidth: 2 },
            animated: true,
          });
        }
      });

      console.log('🔗 Setting edges:', newEdges);
      setEdges(newEdges);
    }
  }, [nodesData, manufacturingOrders, setEdges]);

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

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('Node clicked:', node);
    
    // Safely handle node data with proper type checking
    if (node.data && isNodeData(node.data) && isStepCardData(node.data.stepData)) {
      handleStepClick(node.data.stepData);
    }
  }, [handleStepClick]);

  // Filter nodes based on search and status
  const filteredNodes = useMemo(() => {
    console.log('🔍 Filtering nodes...');
    console.log('- Total nodes before filtering:', nodes.length);
    console.log('- Search term:', searchTerm);
    console.log('- Selected status:', selectedStatus);
    
    if (searchTerm === '' && selectedStatus === 'all') {
      console.log('✅ No filters applied, returning all nodes');
      return nodes;
    }
    
    const filtered = nodes.filter(node => {
      if (!isNodeData(node.data) || !isStepCardData(node.data.stepData)) {
        console.log('❌ Node failed data check:', node.id);
        return false;
      }
      
      const stepData = node.data.stepData;
      const matchesSearch = searchTerm === '' || 
                           stepData.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           stepData.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           stepData.stepName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || stepData.status === selectedStatus;
      
      const passes = matchesSearch && matchesStatus;
      if (!passes) {
        console.log(`🚫 Node ${node.id} filtered out - search: ${matchesSearch}, status: ${matchesStatus}`);
      } else {
        console.log(`✅ Node ${node.id} passed filters`);
      }
      
      return passes;
    });
    
    console.log(`✅ Filtered to ${filtered.length} nodes`);
    return filtered;
  }, [nodes, searchTerm, selectedStatus]);

  // Filter edges to match filtered nodes
  const filteredEdges = useMemo(() => {
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    return edges.filter(edge => 
      filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target)
    );
  }, [edges, filteredNodes]);

  // Calculate statistics
  const stats = useMemo(() => {
    const validNodeData = filteredNodes
      .map(n => isNodeData(n.data) && isStepCardData(n.data.stepData) ? n.data.stepData : null)
      .filter((data): data is StepCardData => data !== null);
    
    return {
      total: validNodeData.length,
      inProgress: validNodeData.filter(n => n.status === 'in_progress').length,
      completed: validNodeData.filter(n => n.status === 'completed').length,
      blocked: validNodeData.filter(n => n.status === 'blocked').length,
    };
  }, [filteredNodes]);

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
  console.log('- Generated nodes count:', nodes.length);
  console.log('- Filtered nodes count:', filteredNodes.length);
  console.log('- Filtered edges count:', filteredEdges.length);
  console.log('- Stats:', stats);
  console.log('- Loading states:', { ordersLoading, stepsLoading, valuesLoading });
  console.log('- Component about to render with', filteredNodes.length, 'nodes');

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
                  {!manufacturingOrders || manufacturingOrders.length === 0 ? (
                    "Create some manufacturing orders to see them here."
                  ) : (
                    searchTerm || selectedStatus !== 'all' ? 
                    "No items match your current filters." :
                    "No production steps are currently visible."
                  )}
                </p>
                <div className="mt-4 text-sm text-muted-foreground space-y-1">
                  <p><strong>Debug info:</strong></p>
                  <p>Manufacturing Orders: {manufacturingOrders?.length || 0}</p>
                  <p>Generated Nodes: {nodes.length}</p>
                  <p>Filtered Nodes: {filteredNodes.length}</p>
                  <p>Manufacturing Steps: {manufacturingSteps?.length || 0}</p>
                  <p>Order Steps: {orderSteps?.length || 0}</p>
                  <p>Search Term: "{searchTerm}"</p>
                  <p>Selected Status: {selectedStatus}</p>
                </div>
              </div>
            </div>
          ) : (
            <ReactFlow
              nodes={filteredNodes}
              edges={filteredEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              fitView
              fitViewOptions={{
                padding: 0.1,
                includeHiddenNodes: false,
                minZoom: 0.5,
                maxZoom: 1.5,
              }}
              className="bg-background"
              defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
              minZoom={0.2}
              maxZoom={2}
            >
              <Controls />
              <MiniMap 
                nodeColor={(node) => {
                  if (isNodeData(node.data) && isStepCardData(node.data.stepData)) {
                    const stepData = node.data.stepData;
                    if (stepData.isJhalaiStep) return '#3b82f6';
                    switch (stepData.status) {
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
