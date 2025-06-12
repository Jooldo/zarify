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
import CreateJhalaiStepDialog, { JhalaiStepData } from './CreateJhalaiStepDialog';
import { useToast } from '@/hooks/use-toast';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useWorkers } from '@/hooks/useWorkers';
import CardSkeleton from '@/components/ui/skeletons/CardSkeleton';

const nodeTypes = {
  stepCard: ManufacturingStepCard,
};

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
  const { orderSteps, isLoading: stepsLoading } = useManufacturingSteps();
  const { workers } = useWorkers();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Dialog states
  const [selectedStepData, setSelectedStepData] = useState<StepCardData | null>(null);
  const [isStepDetailsOpen, setIsStepDetailsOpen] = useState(false);
  const [isJhalaiDialogOpen, setIsJhalaiDialogOpen] = useState(false);

  console.log('Manufacturing Orders:', manufacturingOrders);
  console.log('Order Steps:', orderSteps);

  // Define the standard manufacturing steps workflow
  const standardSteps = [
    { name: 'Manufacturing Order', order: 0, duration: 0, isJhalai: false }, // Initial manufacturing order
    { name: 'Jhalai', order: 1, duration: 2, isJhalai: true },
    { name: 'Dhol', order: 2, duration: 3, isJhalai: false },
    { name: 'Stone Setting', order: 3, duration: 4, isJhalai: false },
    { name: 'Polish', order: 4, duration: 2, isJhalai: false },
    { name: 'QC Check', order: 5, duration: 1, isJhalai: false },
  ];

  // Generate step nodes from manufacturing orders
  const generateStepNodes = useMemo((): Node[] => {
    console.log('Generating step nodes...');
    
    if (!manufacturingOrders.length) {
      console.log('No manufacturing orders found');
      return [];
    }

    const stepNodes: Node[] = [];
    let nodeIndex = 0;

    manufacturingOrders.forEach((order, orderIndex) => {
      console.log(`Processing order ${order.id}:`, order);
      
      // Extract raw materials from product config
      const rawMaterials = order.product_configs?.product_config_materials?.map(material => ({
        name: material.raw_materials.name,
        quantity: material.quantity_required,
        unit: material.unit
      })) || [];
      
      // First, add the manufacturing order card with enhanced data
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
        productCode: order.product_configs?.product_code,
        category: order.product_configs?.category,
        quantityRequired: order.quantity_required,
        priority: order.priority,
        rawMaterials: rawMaterials,
      };

      stepNodes.push({
        id: `${order.id}-manufacturing-order`,
        type: 'stepCard',
        position: { 
          x: 50, 
          y: orderIndex * 280 + 50 
        },
        data: manufacturingOrderData,
      });

      // Then add actual manufacturing steps that have been started
      standardSteps.slice(1).forEach((standardStep, stepIndex) => {
        const actualStep = orderSteps.find(step => 
          step.manufacturing_order_id === order.id && 
          step.manufacturing_steps?.step_name === standardStep.name
        );

        if (actualStep) {
          console.log(`Step ${standardStep.name} for order ${order.id}:`, actualStep);

          let stepStatus: StepCardData['status'] = 'pending';
          let progress = 0;
          let assignedWorker = undefined;

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

          const stepData: StepCardData = {
            stepName: standardStep.name,
            stepOrder: standardStep.order,
            orderId: order.id,
            orderNumber: order.order_number,
            productName: order.product_name,
            status: stepStatus,
            progress: progress,
            assignedWorker: assignedWorker,
            estimatedDuration: standardStep.duration,
            isJhalaiStep: standardStep.isJhalai,
            productCode: order.product_configs?.product_code,
            category: order.product_configs?.category,
            quantityRequired: order.quantity_required,
            priority: order.priority,
            rawMaterials: standardStep.isJhalai ? rawMaterials : undefined,
          };

          const nodeId = `${order.id}-step-${standardStep.order}`;
          
          stepNodes.push({
            id: nodeId,
            type: 'stepCard',
            position: { 
              x: (stepIndex + 1) * 340 + 50, 
              y: orderIndex * 280 + 50 
            },
            data: stepData,
          });
        }
      });

      nodeIndex++;
    });

    return stepNodes;
  }, [manufacturingOrders, orderSteps]);

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
    console.log('Updating nodes with generated step data:', generateStepNodes);
    setNodes(generateStepNodes);
  }, [generateStepNodes, setNodes]);

  React.useEffect(() => {
    console.log('Updating edges with generated step edges:', generateStepEdges);
    setEdges(generateStepEdges);
  }, [generateStepEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleStepClick = useCallback((stepData: StepCardData) => {
    console.log('Step clicked:', stepData);
    setSelectedStepData(stepData);
    setIsStepDetailsOpen(true);
  }, []);

  const handleMoveToJhalai = useCallback((stepData: StepCardData) => {
    console.log('Moving to Jhalai:', stepData);
    setSelectedStepData(stepData);
    setIsJhalaiDialogOpen(true);
  }, []);

  const handleCreateJhalaiStep = useCallback((jhalaiStepData: JhalaiStepData) => {
    console.log('Creating Jhalai step:', jhalaiStepData);
    
    // Create new Jhalai step node
    const jhalaiNodeData: StepCardData = {
      stepName: 'Jhalai',
      stepOrder: 1,
      orderId: jhalaiStepData.manufacturingOrderId,
      orderNumber: selectedStepData?.orderNumber || '',
      productName: selectedStepData?.productName || '',
      status: 'in_progress',
      progress: 0,
      assignedWorker: jhalaiStepData.assignedWorkerName,
      estimatedDuration: 2,
      isJhalaiStep: true,
      productCode: selectedStepData?.productCode,
      category: selectedStepData?.category,
      quantityRequired: selectedStepData?.quantityRequired,
      priority: selectedStepData?.priority,
      rawMaterials: selectedStepData?.rawMaterials,
    };

    const newJhalaiNode: Node = {
      id: `${jhalaiStepData.manufacturingOrderId}-step-1`,
      type: 'stepCard',
      position: { 
        x: 390, 
        y: nodes.find(n => n.id === `${jhalaiStepData.manufacturingOrderId}-manufacturing-order`)?.position.y || 50
      },
      data: jhalaiNodeData,
    };

    // Add the new node
    setNodes(prevNodes => [...prevNodes, newJhalaiNode]);

    // Add edge from manufacturing order to Jhalai step
    const newEdge = {
      id: `${jhalaiStepData.manufacturingOrderId}-manufacturing-to-jhalai`,
      source: `${jhalaiStepData.manufacturingOrderId}-manufacturing-order`,
      target: newJhalaiNode.id,
      type: 'smoothstep',
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      animated: true,
    };

    setEdges(prevEdges => [...prevEdges, newEdge]);

    // TODO: Here you would typically make an API call to create the actual Jhalai step in the backend
    
    toast({
      title: 'Jhalai Step Created',
      description: `Jhalai step created and assigned to ${jhalaiStepData.assignedWorkerName}`,
    });
  }, [selectedStepData, setNodes, setEdges, toast]);

  const handleAddStep = useCallback((stepData: StepCardData) => {
    toast({
      title: "Add Step",
      description: `Adding new step after ${stepData.stepName} for ${stepData.orderNumber}`,
    });
    // TODO: Implement add step functionality
  }, [toast]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (isStepCardData(node.data)) {
      handleStepClick(node.data);
    }
  }, [handleStepClick]);

  // Filter nodes based on search and status
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      if (!isStepCardData(node.data)) return false;
      
      const nodeData = node.data;
      const matchesSearch = nodeData.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           nodeData.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           nodeData.stepName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || nodeData.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
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

  console.log('Final filtered step nodes:', filteredNodes);
  console.log('Step Stats:', stats);

  if (ordersLoading || stepsLoading) {
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
        </div>
      </div>

      {/* Dialogs */}
      <StepDetailsDialog
        open={isStepDetailsOpen}
        onOpenChange={setIsStepDetailsOpen}
        stepData={selectedStepData}
        onMoveToJhalai={handleMoveToJhalai}
      />

      <CreateJhalaiStepDialog
        open={isJhalaiDialogOpen}
        onOpenChange={setIsJhalaiDialogOpen}
        manufacturingStepData={selectedStepData}
        onCreateJhalaiStep={handleCreateJhalaiStep}
      />
    </>
  );
};

export default ProductionQueueView;
