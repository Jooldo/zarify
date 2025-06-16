
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, User, Package, Hash, Play, Clock } from 'lucide-react';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useWorkers } from '@/hooks/useWorkers';
import { useCreateManufacturingStep } from '@/hooks/useCreateManufacturingStep';
import StartStepDialog from './StartStepDialog';

interface KanbanFilters {
  search: string;
  product: string;
  karigar: string;
  status: string;
  priority: string;
}

const ProductionKanbanView = () => {
  const { manufacturingOrders, isLoading } = useManufacturingOrders();
  const { manufacturingSteps, orderSteps } = useManufacturingSteps();
  const { workers } = useWorkers();
  const { createStep } = useCreateManufacturingStep();
  
  const [filters, setFilters] = useState<KanbanFilters>({
    search: '',
    product: '',
    karigar: '',
    status: '',
    priority: '',
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
      if (filters.product && !order.product_name.toLowerCase().includes(filters.product.toLowerCase())) {
        return false;
      }

      // Priority filter
      if (filters.priority && order.priority !== filters.priority) {
        return false;
      }

      // Exclude completed orders from the kanban view
      if (order.status === 'completed') {
        return false;
      }

      return true;
    });
  }, [manufacturingOrders, filters]);

  // Group orders by their current step
  const ordersByStep = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    
    // Initialize all steps with empty arrays
    activeSteps.forEach(step => {
      grouped[step.id] = [];
    });

    // Add orders to appropriate steps
    filteredOrders.forEach(order => {
      // Get all steps for this order
      const orderOrderSteps = orderSteps.filter(step => 
        String(step.manufacturing_order_id) === String(order.id)
      );

      if (orderOrderSteps.length === 0) {
        // No steps created yet - this order should appear in first step as "not started"
        if (activeSteps[0]) {
          grouped[activeSteps[0].id].push({
            ...order,
            currentStep: null,
            stepStatus: 'not_started'
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
          
          // Only add to kanban if the step is not completed (or if it's the only step)
          if (currentOrderStep.status !== 'completed' || sortedSteps.length === 1) {
            if (!grouped[stepId]) {
              grouped[stepId] = [];
            }
            
            grouped[stepId].push({
              ...order,
              currentStep: currentOrderStep,
              stepStatus: currentOrderStep.status,
              assignedWorker: currentOrderStep.workers?.name
            });
          }
        }
      }
    });

    // Apply karigar filter after grouping
    if (filters.karigar) {
      Object.keys(grouped).forEach(stepId => {
        grouped[stepId] = grouped[stepId].filter(order => {
          return order.assignedWorker?.toLowerCase().includes(filters.karigar.toLowerCase());
        });
      });
    }

    // Apply status filter after grouping
    if (filters.status) {
      Object.keys(grouped).forEach(stepId => {
        grouped[stepId] = grouped[stepId].filter(order => {
          return order.stepStatus === filters.status;
        });
      });
    }

    return grouped;
  }, [filteredOrders, orderSteps, activeSteps, filters.karigar, filters.status]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="space-y-4">
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
            <SelectItem value="">All Products</SelectItem>
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
            <SelectItem value="">All Karigars</SelectItem>
            {workers.map(worker => (
              <SelectItem key={worker.id} value={worker.name}>{worker.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
          <SelectTrigger className="w-[150px] h-8">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
          <SelectTrigger className="w-[150px] h-8">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {activeSteps.map((step) => (
          <div key={step.id} className="flex-shrink-0 w-80">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                    {step.step_order}
                  </div>
                  {step.step_name}
                  <Badge variant="secondary" className="ml-auto">
                    {ordersByStep[step.id]?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-3">
                    {ordersByStep[step.id]?.map((order) => (
                      <Card key={order.id} className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
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

                            {/* Status */}
                            <div className="flex items-center justify-between">
                              <Badge className={getStatusColor(order.stepStatus)}>
                                {order.stepStatus === 'not_started' ? 'Not Started' : 
                                 order.stepStatus === 'in_progress' ? 'In Progress' : 
                                 order.stepStatus.replace('_', ' ').toUpperCase()}
                              </Badge>
                              
                              {order.currentStep?.started_at && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {new Date(order.currentStep.started_at).toLocaleDateString()}
                                </div>
                              )}
                            </div>

                            {/* CTA Button */}
                            {canStartStep(order, step) && (
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
                    
                    {ordersByStep[step.id]?.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No orders in this step</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        ))}
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
