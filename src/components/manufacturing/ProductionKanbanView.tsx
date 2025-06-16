
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, User, Package, Hash, Play, Clock, Calendar, AlertTriangle } from 'lucide-react';
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

  const getStepGradient = (stepIndex: number) => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-purple-500 to-pink-600',
      'from-teal-500 to-blue-600',
      'from-indigo-500 to-purple-600',
    ];
    return gradients[stepIndex % gradients.length];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'not_started':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200';
      case 'high':
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200';
      case 'medium':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-200';
      case 'low':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-200';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
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
          <div className="relative">
            <Package className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
          </div>
          <p className="text-lg font-medium text-gray-900">Loading Production Kanban</p>
          <p className="text-sm text-gray-500 mt-1">Fetching your manufacturing orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen p-6">
      {/* Enhanced Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Production Kanban Board
        </h1>
        <p className="text-gray-600">Track and manage your manufacturing workflow</p>
      </div>

      {/* Enhanced Filters */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search by Order ID or Product Name..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-12 h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
            
            <Select value={filters.product} onValueChange={(value) => setFilters(prev => ({ ...prev, product: value }))}>
              <SelectTrigger className="w-[180px] h-11 border-gray-200 focus:border-blue-500">
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {Array.from(new Set(manufacturingOrders.map(o => o.product_name))).map(product => (
                  <SelectItem key={product} value={product}>{product}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.karigar} onValueChange={(value) => setFilters(prev => ({ ...prev, karigar: value }))}>
              <SelectTrigger className="w-[180px] h-11 border-gray-200 focus:border-blue-500">
                <SelectValue placeholder="All Karigars" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Karigars</SelectItem>
                {workers.map(worker => (
                  <SelectItem key={worker.id} value={worker.name}>{worker.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="w-[180px] h-11 border-gray-200 focus:border-blue-500">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger className="w-[180px] h-11 border-gray-200 focus:border-blue-500">
                <SelectValue placeholder="All Priorities" />
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
        </CardContent>
      </Card>

      {/* Enhanced Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-6">
        {activeSteps.map((step, index) => (
          <div key={step.id} className="flex-shrink-0 w-96">
            <Card className="h-full shadow-xl border-0 overflow-hidden bg-white/90 backdrop-blur-sm">
              <CardHeader className={`bg-gradient-to-r ${getStepGradient(index)} text-white pb-4`}>
                <CardTitle className="text-lg font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-sm font-bold">
                    {step.step_order}
                  </div>
                  <span className="flex-1">{step.step_name}</span>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 font-semibold">
                    {ordersByStep[step.id]?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[650px]">
                  <div className="p-4 space-y-4">
                    {ordersByStep[step.id]?.map((order) => (
                      <Card key={order.id} className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-400 hover:border-l-blue-600 bg-gradient-to-r from-white to-blue-50/30">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Enhanced Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                <span className="font-bold text-blue-700 text-sm">
                                  {order.order_number}
                                </span>
                              </div>
                              <Badge className={`${getPriorityColor(order.priority)} text-xs font-bold px-3 py-1`}>
                                {order.priority.toUpperCase()}
                                {order.priority === 'urgent' && <AlertTriangle className="h-3 w-3 ml-1" />}
                              </Badge>
                            </div>

                            {/* Enhanced Product Info */}
                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Package className="h-4 w-4 text-blue-500" />
                                <span className="font-medium text-gray-900">{order.product_name}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Hash className="h-4 w-4" />
                                <span>Quantity: <span className="font-semibold text-gray-900">{order.quantity_required}</span></span>
                              </div>
                            </div>

                            {/* Enhanced Worker Assignment */}
                            {order.assignedWorker && (
                              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                                <User className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-blue-600 font-medium">
                                  Assigned to: {order.assignedWorker}
                                </span>
                              </div>
                            )}

                            {/* Enhanced Status and Timeline */}
                            <div className="flex items-center justify-between">
                              <Badge className={`${getStatusColor(order.stepStatus)} border font-medium`}>
                                {order.stepStatus === 'not_started' ? 'Not Started' : 
                                 order.stepStatus === 'in_progress' ? 'In Progress' : 
                                 order.stepStatus.replace('_', ' ').toUpperCase()}
                              </Badge>
                              
                              {order.currentStep?.started_at && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(order.currentStep.started_at).toLocaleDateString()}
                                </div>
                              )}
                            </div>

                            {/* Enhanced Due Date */}
                            {order.due_date && (
                              <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                                <Clock className="h-3 w-3" />
                                <span>Due: {new Date(order.due_date).toLocaleDateString()}</span>
                              </div>
                            )}

                            {/* Enhanced CTA Button */}
                            {canStartStep(order, step) && (
                              <Button
                                size="sm"
                                className="w-full mt-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
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
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">No orders in this step</p>
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
