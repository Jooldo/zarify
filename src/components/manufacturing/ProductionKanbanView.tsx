
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, User, Package, Hash, Play, Clock, CheckCircle, Pause } from 'lucide-react';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useWorkers } from '@/hooks/useWorkers';
import { useCreateManufacturingStep } from '@/hooks/useCreateManufacturingStep';
import StartStepDialog from './StartStepDialog';

interface KanbanFilters {
  search: string;
  product: string;
  karigar: string;
  priority: string;
}

const ProductionKanbanView = () => {
  const { manufacturingOrders, isLoading } = useManufacturingOrders();
  const { manufacturingSteps, orderSteps } = useManufacturingSteps();
  const { workers } = useWorkers();
  const { createStep } = useCreateManufacturingStep();
  
  const [filters, setFilters] = useState<KanbanFilters>({
    search: '',
    product: 'all',
    karigar: 'all',
    priority: 'all',
  });

  const [selectedOrderStep, setSelectedOrderStep] = useState<{
    order: any;
    step: any;
  } | null>(null);
  const [startStepDialogOpen, setStartStepDialogOpen] = useState(false);

  // Get active manufacturing steps sorted by order
  const activeSteps = useMemo(() => {
    return manufacturingSteps
      .filter(step => step.is_active)
      .sort((a, b) => a.step_order - b.step_order);
  }, [manufacturingSteps]);

  // Filter manufacturing orders
  const filteredOrders = useMemo(() => {
    return manufacturingOrders.filter(order => {
      // Search filter
      if (filters.search) {
        const searchMatch = order.order_number.toLowerCase().includes(filters.search.toLowerCase()) ||
               order.product_name.toLowerCase().includes(filters.search.toLowerCase());
        if (!searchMatch) return false;
      }

      // Product filter
      if (filters.product !== 'all' && !order.product_name.toLowerCase().includes(filters.product.toLowerCase())) {
        return false;
      }

      // Priority filter
      if (filters.priority !== 'all' && order.priority !== filters.priority) {
        return false;
      }

      // Exclude completed orders from the kanban view
      if (order.status === 'completed') {
        return false;
      }

      return true;
    });
  }, [manufacturingOrders, filters]);

  // Group orders by step and status
  const ordersByStepAndStatus = useMemo(() => {
    const grouped: Record<string, Record<string, any[]>> = {};
    
    // Initialize all steps with empty status arrays
    activeSteps.forEach(step => {
      grouped[step.id] = {
        pending: [],
        in_progress: [],
        completed: []
      };
    });

    // Add orders to appropriate step and status
    filteredOrders.forEach(order => {
      // Get all steps for this order
      const orderOrderSteps = orderSteps.filter(step => 
        String(step.manufacturing_order_id) === String(order.id)
      );

      if (orderOrderSteps.length === 0) {
        // No steps created yet - this order should appear in first step as "pending"
        if (activeSteps[0]) {
          grouped[activeSteps[0].id].pending.push({
            ...order,
            currentStep: null,
            stepStatus: 'pending'
          });
        }
      } else {
        // Find the current step (highest step_order that's not completed, or the latest if all are completed)
        const sortedSteps = orderOrderSteps.sort((a, b) => a.step_order - b.step_order);
        
        // Find the first non-completed step, or the last step if all are completed
        let currentOrderStep = sortedSteps.find(step => step.status !== 'completed');
        if (!currentOrderStep) {
          currentOrderStep = sortedSteps[sortedSteps.length - 1];
        }

        if (currentOrderStep && currentOrderStep.manufacturing_step_id) {
          const stepId = currentOrderStep.manufacturing_step_id;
          const status = currentOrderStep.status;
          
          if (grouped[stepId] && grouped[stepId][status]) {
            grouped[stepId][status].push({
              ...order,
              currentStep: currentOrderStep,
              stepStatus: status,
              assignedWorker: currentOrderStep.workers?.name
            });
          }
        }
      }
    });

    // Apply karigar filter after grouping
    if (filters.karigar !== 'all') {
      Object.keys(grouped).forEach(stepId => {
        Object.keys(grouped[stepId]).forEach(status => {
          grouped[stepId][status] = grouped[stepId][status].filter(order => {
            return order.assignedWorker?.toLowerCase().includes(filters.karigar.toLowerCase());
          });
        });
      });
    }

    return grouped;
  }, [filteredOrders, orderSteps, activeSteps, filters.karigar]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Pause className="h-3 w-3" />;
      case 'in_progress':
        return <Play className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Pause className="h-3 w-3" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleStartStep = (order: any, step: any) => {
    setSelectedOrderStep({ order, step });
    setStartStepDialogOpen(true);
  };

  const canStartStep = (order: any, step: any) => {
    // Can start if this is the first step and no steps exist yet
    if (!order.currentStep && step.step_order === 1) {
      return true;
    }
    
    // Can start if current step status is pending
    if (order.currentStep && order.stepStatus === 'pending') {
      return true;
    }
    
    return false;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading production kanban...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search MO ID or Product Name..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-10 h-8"
          />
        </div>
        
        <Select value={filters.product} onValueChange={(value) => setFilters(prev => ({ ...prev, product: value }))}>
          <SelectTrigger className="w-[150px] h-8">
            <SelectValue placeholder="Product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            {Array.from(new Set(manufacturingOrders.map(o => o.product_name))).map(product => (
              <SelectItem key={product} value={product}>{product}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.karigar} onValueChange={(value) => setFilters(prev => ({ ...prev, karigar: value }))}>
          <SelectTrigger className="w-[150px] h-8">
            <SelectValue placeholder="Karigar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Karigars</SelectItem>
            {workers.map(worker => (
              <SelectItem key={worker.id} value={worker.name}>{worker.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
          <SelectTrigger className="w-[150px] h-8">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Enhanced Kanban Board */}
      <div className="space-y-8">
        {activeSteps.map((step) => {
          const stepOrders = ordersByStepAndStatus[step.id] || { pending: [], in_progress: [], completed: [] };
          const totalOrders = stepOrders.pending.length + stepOrders.in_progress.length + stepOrders.completed.length;
          
          return (
            <div key={step.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              {/* Step Header */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                    {step.step_order}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{step.step_name}</h3>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {totalOrders} orders
                  </Badge>
                </div>
                {step.description && (
                  <p className="text-sm text-gray-600 ml-11">{step.description}</p>
                )}
              </div>

              {/* Status Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['pending', 'in_progress', 'completed'].map((status) => (
                  <div key={status} className="space-y-3">
                    {/* Status Column Header */}
                    <div className={`p-3 rounded-lg border-2 ${getStatusColor(status)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <span className="font-medium text-sm">{getStatusLabel(status)}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {stepOrders[status]?.length || 0}
                        </Badge>
                      </div>
                    </div>

                    {/* Orders in this status */}
                    <ScrollArea className="h-[400px] pr-2">
                      <div className="space-y-3">
                        {stepOrders[status]?.map((order) => (
                          <Card key={`${order.id}-${status}`} className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500 bg-white">
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-sm text-blue-600">
                                    {order.order_number}
                                  </span>
                                  <Badge className={getPriorityColor(order.priority)}>
                                    {order.priority.toUpperCase()}
                                  </Badge>
                                </div>

                                {/* Product & Quantity */}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Package className="h-3 w-3" />
                                  <span>{order.product_name}</span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Hash className="h-3 w-3" />
                                  <span>Qty: {order.quantity_required}</span>
                                </div>

                                {/* Assigned Worker */}
                                {order.assignedWorker && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <User className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">Karigar:</span>
                                    <span className="font-medium">{order.assignedWorker}</span>
                                  </div>
                                )}

                                {/* Timestamps */}
                                {order.currentStep?.started_at && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    Started: {new Date(order.currentStep.started_at).toLocaleDateString()}
                                  </div>
                                )}

                                {order.currentStep?.completed_at && (
                                  <div className="flex items-center gap-1 text-xs text-green-600">
                                    <CheckCircle className="h-3 w-3" />
                                    Completed: {new Date(order.currentStep.completed_at).toLocaleDateString()}
                                  </div>
                                )}

                                {/* CTA Button */}
                                {canStartStep(order, step) && status === 'pending' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full mt-2"
                                    onClick={() => handleStartStep(order, step)}
                                  >
                                    <Play className="h-3 w-3 mr-1" />
                                    Start {step.step_name}
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                        {stepOrders[status]?.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Package className="h-6 w-6 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">No {status.replace('_', ' ')} orders</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Start Step Dialog */}
      <StartStepDialog
        isOpen={startStepDialogOpen}
        onClose={() => {
          setStartStepDialogOpen(false);
          setSelectedOrderStep(null);
        }}
        order={selectedOrderStep?.order || null}
        step={selectedOrderStep?.step || null}
      />
    </div>
  );
};

export default ProductionKanbanView;
