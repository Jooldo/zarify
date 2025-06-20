import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, User, Package, Hash, Play, Clock, Target } from 'lucide-react';
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
    product: 'all',
    karigar: 'all',
    status: 'all',
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

      // Remove the completed status exclusion - show all orders
      return true;
    });
  }, [manufacturingOrders, filters]);

  // Group orders by their highest created step
  const ordersByStep = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    
    // Initialize all steps with empty arrays
    activeSteps.forEach(step => {
      grouped[step.id] = [];
    });

    // Add orders to their highest created step
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
        // Find the step with the highest step_order (latest created step)
        const sortedSteps = orderOrderSteps.sort((a, b) => b.step_order - a.step_order);
        const latestOrderStep = sortedSteps[0];

        if (latestOrderStep && latestOrderStep.manufacturing_step_id) {
          const stepId = latestOrderStep.manufacturing_step_id;
          
          if (!grouped[stepId]) {
            grouped[stepId] = [];
          }
          
          grouped[stepId].push({
            ...order,
            currentStep: latestOrderStep,
            stepStatus: latestOrderStep.status,
            assignedWorker: latestOrderStep.workers?.name
          });
        }
      }
    });

    // Apply karigar filter after grouping
    if (filters.karigar !== 'all') {
      Object.keys(grouped).forEach(stepId => {
        grouped[stepId] = grouped[stepId].filter(order => {
          return order.assignedWorker?.toLowerCase().includes(filters.karigar.toLowerCase());
        });
      });
    }

    // Apply status filter after grouping
    if (filters.status !== 'all') {
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
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
        return 'bg-emerald-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStepGradient = (stepOrder: number) => {
    const gradients = [
      'bg-gradient-to-br from-blue-50 to-indigo-100',
      'bg-gradient-to-br from-purple-50 to-pink-100',
      'bg-gradient-to-br from-emerald-50 to-teal-100',
      'bg-gradient-to-br from-orange-50 to-red-100',
      'bg-gradient-to-br from-cyan-50 to-blue-100',
      'bg-gradient-to-br from-violet-50 to-purple-100',
    ];
    return gradients[(stepOrder - 1) % gradients.length];
  };

  const getStepBorderColor = (stepOrder: number) => {
    const colors = [
      'border-blue-200',
      'border-purple-200',
      'border-emerald-200',
      'border-orange-200',
      'border-cyan-200',
      'border-violet-200',
    ];
    return colors[(stepOrder - 1) % colors.length];
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
    <div className="space-y-6 p-4">
      {/* Enhanced Filters Section */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search MO ID or Product Name..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 h-9 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-300"
            />
          </div>
          
          <Select value={filters.product} onValueChange={(value) => setFilters(prev => ({ ...prev, product: value }))}>
            <SelectTrigger className="w-[150px] h-9 bg-white/80 backdrop-blur-sm border-gray-200">
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
            <SelectTrigger className="w-[150px] h-9 bg-white/80 backdrop-blur-sm border-gray-200">
              <SelectValue placeholder="Karigar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Karigars</SelectItem>
              {workers.map(worker => (
                <SelectItem key={worker.id} value={worker.name}>{worker.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
            <SelectTrigger className="w-[150px] h-9 bg-white/80 backdrop-blur-sm border-gray-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
            <SelectTrigger className="w-[150px] h-9 bg-white/80 backdrop-blur-sm border-gray-200">
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
      </div>

      {/* Enhanced Kanban Board with increased section width from w-96 to w-[500px] */}
      <div className="flex gap-6 overflow-x-auto pb-6">
        {activeSteps.map((step) => (
          <div key={step.id} className="flex-shrink-0 w-[500px]">
            <Card className={`h-full ${getStepGradient(step.step_order)} ${getStepBorderColor(step.step_order)} border-2 shadow-lg hover:shadow-xl transition-all duration-300`}>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-sm font-black ${
                    step.step_order === 1 ? 'text-blue-600' :
                    step.step_order === 2 ? 'text-purple-600' :
                    step.step_order === 3 ? 'text-emerald-600' :
                    step.step_order === 4 ? 'text-orange-600' :
                    step.step_order === 5 ? 'text-cyan-600' :
                    'text-violet-600'
                  }`}>
                    {step.step_order}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">{step.step_name}</div>
                    <div className="text-xs text-gray-600 font-normal">Production Step</div>
                  </div>
                  <Badge variant="secondary" className="bg-white/80 text-gray-700 font-semibold shadow-sm">
                    {ordersByStep[step.id]?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {ordersByStep[step.id]?.map((order) => (
                      <Card key={order.id} className="bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 border border-white/50 hover:border-gray-200">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Enhanced Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-blue-600" />
                                <span className="font-bold text-sm text-blue-700">
                                  {order.order_number}
                                </span>
                              </div>
                              <Badge className={`${getPriorityColor(order.priority)} shadow-sm`}>
                                {order.priority.toUpperCase()}
                              </Badge>
                            </div>

                            {/* Enhanced Product Info */}
                            <div className="bg-gray-50/80 rounded-lg p-3 space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Package className="h-4 w-4 text-emerald-600" />
                                <span className="font-semibold text-gray-800">{order.product_name}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Hash className="h-4 w-4" />
                                <span>Quantity: </span>
                                <span className="font-semibold text-gray-800">{order.quantity_required}</span>
                              </div>
                            </div>

                            {/* Enhanced Worker Assignment */}
                            {order.assignedWorker && (
                              <div className="flex items-center gap-2 text-sm bg-blue-50/80 rounded-lg p-2">
                                <User className="h-4 w-4 text-blue-600" />
                                <span className="text-gray-600">Assigned to:</span>
                                <span className="font-semibold text-blue-700">{order.assignedWorker}</span>
                              </div>
                            )}

                            {/* Enhanced Status & Timeline */}
                            <div className="flex items-center justify-between">
                              <Badge className={`${getStatusColor(order.stepStatus)} border shadow-sm`}>
                                {order.stepStatus === 'not_started' ? 'Not Started' : 
                                 order.stepStatus === 'in_progress' ? 'In Progress' : 
                                 order.stepStatus.replace('_', ' ').toUpperCase()}
                              </Badge>
                              
                              {order.currentStep?.started_at && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100/80 rounded px-2 py-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(order.currentStep.started_at).toLocaleDateString()}
                                </div>
                              )}
                            </div>

                            {/* Enhanced CTA Button */}
                            {canStartStep(order, step) && (
                              <Button
                                size="sm"
                                className="w-full mt-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                                onClick={() => handleStartStep(order, step)}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Start {step.step_name}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {ordersByStep[step.id]?.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <div className="w-16 h-16 mx-auto mb-4 bg-white/60 rounded-full flex items-center justify-center">
                          <Package className="h-8 w-8 opacity-40" />
                        </div>
                        <p className="text-sm font-medium">No orders in this step</p>
                        <p className="text-xs text-gray-400 mt-1">Orders will appear here when assigned</p>
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
