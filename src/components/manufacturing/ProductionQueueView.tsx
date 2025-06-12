
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
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ProductNode } from '@/components/dashboard/ProductNode';
import { useToast } from '@/hooks/use-toast';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useWorkers } from '@/hooks/useWorkers';
import CardSkeleton from '@/components/ui/skeletons/CardSkeleton';

const nodeTypes = {
  productNode: ProductNode,
};

interface ProductNodeData extends Record<string, unknown> {
  productName: string;
  orderId: string;
  orderNumber: string;
  currentStep: string;
  assignedWorker?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'qc_failed' | 'blocked';
  progress: number;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  quantity: number;
}

type ProductFlowNode = Node<ProductNodeData>;

const ProductionQueueView = () => {
  const { toast } = useToast();
  const { manufacturingOrders, loading: ordersLoading } = useManufacturingOrders();
  const { orderSteps, isLoading: stepsLoading } = useManufacturingSteps();
  const { workers } = useWorkers();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Generate nodes from manufacturing orders
  const generateProductNodes = useMemo((): ProductFlowNode[] => {
    if (!manufacturingOrders.length || !orderSteps.length) return [];

    return manufacturingOrders.map((order, index) => {
      // Find current step for this order
      const currentOrderStep = orderSteps.find(step => 
        step.manufacturing_order_id === order.id && 
        step.status === 'in_progress'
      ) || orderSteps.find(step => 
        step.manufacturing_order_id === order.id && 
        step.status === 'pending'
      );

      const assignedWorker = currentOrderStep?.workers?.name;
      const currentStepName = currentOrderStep?.manufacturing_steps?.step_name || 'Not Started';
      const progress = currentOrderStep?.progress_percentage || 0;

      // Map order status to node status
      let nodeStatus: ProductNodeData['status'] = 'pending';
      if (order.status === 'in_progress') nodeStatus = 'in_progress';
      else if (order.status === 'completed') nodeStatus = 'completed';
      else if (order.status === 'qc_failed') nodeStatus = 'qc_failed';

      const nodeData: ProductNodeData = {
        productName: order.product_name,
        orderId: order.id,
        orderNumber: order.order_number,
        currentStep: currentStepName,
        assignedWorker,
        status: nodeStatus,
        progress,
        dueDate: order.due_date,
        priority: order.priority,
        quantity: order.quantity_required,
      };

      return {
        id: order.id,
        type: 'productNode',
        position: { 
          x: (index % 4) * 320 + 100, 
          y: Math.floor(index / 4) * 200 + 100 
        },
        data: nodeData,
      } as ProductFlowNode;
    });
  }, [manufacturingOrders, orderSteps, workers]);

  const [nodes, setNodes, onNodesChange] = useNodesState(generateProductNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Update nodes when data changes
  React.useEffect(() => {
    setNodes(generateProductNodes);
  }, [generateProductNodes, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const nodeData = node.data as ProductNodeData;
    toast({
      title: "Order Selected",
      description: `Viewing details for ${nodeData.productName} (${nodeData.orderNumber})`,
    });
  }, [toast]);

  // Filter nodes based on search and status
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const nodeData = node.data as ProductNodeData;
      const matchesSearch = nodeData.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           nodeData.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || nodeData.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [nodes, searchTerm, selectedStatus]);

  // Calculate statistics
  const stats = useMemo(() => {
    const nodeData = nodes.map(n => n.data as ProductNodeData);
    return {
      total: nodeData.length,
      inProgress: nodeData.filter(n => n.status === 'in_progress').length,
      completed: nodeData.filter(n => n.status === 'completed').length,
      delayed: nodeData.filter(n => n.dueDate && new Date(n.dueDate) < new Date() && n.status !== 'completed').length,
    };
  }, [nodes]);

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
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Production Queue</h1>
            <p className="text-muted-foreground">Visual workflow of manufacturing orders through production steps</p>
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
                  <div className="text-xs text-muted-foreground">Total Orders</div>
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
                  <div className="text-lg font-bold">{stats.delayed}</div>
                  <div className="text-xs text-muted-foreground">Delayed</div>
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
              placeholder="Search products or order numbers..."
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
            <option value="qc_failed">QC Failed</option>
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
              const nodeData = node.data as ProductNodeData;
              switch (nodeData?.status) {
                case 'completed': return '#22c55e';
                case 'in_progress': return '#eab308';
                case 'qc_failed': return '#ef4444';
                case 'blocked': return '#f97316';
                default: return '#6b7280';
              }
            }}
            className="bg-background border border-border"
          />
          <Background gap={20} size={1} />
        </ReactFlow>

        {/* Legend */}
        <Card className="absolute bottom-4 left-4 w-48">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Status Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>QC Failed</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Blocked</span>
            </div>
          </CardContent>
        </Card>

        {/* Priority Legend */}
        <Card className="absolute bottom-4 right-4 w-48">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Priority Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Urgent</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>High</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Low</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductionQueueView;
