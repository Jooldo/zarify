import { useState, useEffect } from 'react';
import { Package, Clock, Play, Pause, CheckCircle, AlertCircle, Eye, Plus, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import EnhancedUpdateProductionItemDialog from './EnhancedUpdateProductionItemDialog';
import AddToQueueDialog from './AddToQueueDialog';
import StepAssignmentDialog from './StepAssignmentDialog';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';

interface ProductionQueueItem {
  id: string;
  order_number: string;
  product_code: string;
  category: string;
  subcategory: string;
  size: string;
  quantity_required: number;
  quantity_in_progress: number;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Created' | 'In Progress' | 'Completed' | 'On Hold';
  expected_completion_date: string;
  assigned_worker?: string;
  order_numbers: string[];
  created_at: string;
  current_step: number;
  manufacturing_steps: {
    step: number;
    name: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    completed_quantity: number;
    assignment?: {
      id: string;
      worker_name: string;
      delivery_date: string;
      status: string;
      materials: { name: string; allocated_weight: number; unit: string; }[];
      total_weight_assigned?: number;
      received_weight?: number;
      received_quantity?: number;
    };
    qc_logs?: {
      received_weight: number;
      received_pieces: number;
      qc_passed_pieces: number;
      qc_failed_pieces: number;
      qc_passed_weight: number;
      qc_failed_weight: number;
    }[];
  }[];
  child_tickets?: {
    id: string;
    parent_step: number;
    quantity: number;
    failed_weight: number;
    reason: string;
    status: 'Open' | 'In Progress' | 'Resolved';
    created_at: string;
  }[];
}

const EnhancedProductionQueue = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [updateItem, setUpdateItem] = useState<ProductionQueueItem | null>(null);
  const [queueItems, setQueueItems] = useState<ProductionQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignmentDialog, setAssignmentDialog] = useState<{
    open: boolean;
    itemId: string;
    stepNumber: number;
    stepName: string;
  }>({
    open: false,
    itemId: '',
    stepNumber: 0,
    stepName: ''
  });
  const { profile } = useUserProfile();
  const { toast } = useToast();

  // Fetch production orders from database
  const fetchProductionOrders = async () => {
    if (!profile?.merchantId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('production_orders')
        .select(`
          *,
          product_configs (
            product_code,
            category,
            subcategory,
            size_value
          )
        `)
        .eq('merchant_id', profile.merchantId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match the expected interface
      const transformedData: ProductionQueueItem[] = data.map(order => ({
        id: order.id,
        order_number: order.order_number,
        product_code: order.product_configs?.product_code || 'Unknown',
        category: order.product_configs?.category || 'Unknown',
        subcategory: order.product_configs?.subcategory || 'Unknown',
        size: `${order.product_configs?.size_value || 0}"`,
        quantity_required: order.quantity_required,
        quantity_in_progress: 0, // This would come from step assignments
        priority: order.priority as 'High' | 'Medium' | 'Low',
        status: order.status as 'Created' | 'In Progress' | 'Completed' | 'On Hold',
        expected_completion_date: order.expected_completion_date,
        order_numbers: [order.order_number],
        created_at: order.created_at,
        current_step: 1, // Default to first step
        manufacturing_steps: [
          { step: 1, name: 'Jalhai', status: 'Pending', completed_quantity: 0 }
        ]
      }));

      setQueueItems(transformedData);
    } catch (error) {
      console.error('Error fetching production orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch production orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductionOrders();
  }, [profile?.merchantId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Created':
        return <Clock className="h-4 w-4" />;
      case 'In Progress':
        return <Play className="h-4 w-4" />;
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'On Hold':
        return <Pause className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Created':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'On Hold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCurrentStepProgress = (item: ProductionQueueItem) => {
    const currentStep = item.manufacturing_steps.find(step => step.step === item.current_step);
    if (!currentStep) return 0;
    return (currentStep.completed_quantity / item.quantity_required) * 100;
  };

  const getOverallProgress = (item: ProductionQueueItem) => {
    const completedSteps = item.manufacturing_steps.filter(step => step.status === 'Completed').length;
    const inProgressSteps = item.manufacturing_steps.filter(step => step.status === 'In Progress').length;
    const totalSteps = item.manufacturing_steps.length;
    
    let progress = (completedSteps / totalSteps) * 100;
    
    if (inProgressSteps > 0) {
      const currentStepProgress = getCurrentStepProgress(item);
      progress += (currentStepProgress / 100) * (1 / totalSteps) * 100;
    }
    
    return Math.round(progress);
  };

  const handleUpdateItem = (item: ProductionQueueItem) => {
    setUpdateItem(item);
  };

  const handleUpdateComplete = (updatedItem: ProductionQueueItem) => {
    setQueueItems(items => 
      items.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
  };

  const handleProductAdded = (newOrder: any) => {
    // Transform the new order to match our interface
    const newItem: ProductionQueueItem = {
      id: newOrder.id,
      order_number: newOrder.order_number,
      product_code: newOrder.product_configs?.product_code || 'Unknown',
      category: newOrder.product_configs?.category || 'Unknown',
      subcategory: newOrder.product_configs?.subcategory || 'Unknown',
      size: `${newOrder.product_configs?.size_value || 0}"`,
      quantity_required: newOrder.quantity_required,
      quantity_in_progress: 0,
      priority: newOrder.priority as 'High' | 'Medium' | 'Low',
      status: newOrder.status as 'Created' | 'In Progress' | 'Completed' | 'On Hold',
      expected_completion_date: newOrder.expected_completion_date,
      order_numbers: [newOrder.order_number],
      created_at: newOrder.created_at,
      current_step: 1,
      manufacturing_steps: [
        { step: 1, name: 'Jalhai', status: 'Pending', completed_quantity: 0 }
      ]
    };
    
    setQueueItems(items => [newItem, ...items]);
  };

  // Open assignment dialog
  const handleOpenAssignmentDialog = (itemId: string, stepNumber: number, stepName: string) => {
    setAssignmentDialog({
      open: true,
      itemId,
      stepNumber,
      stepName
    });
  };

  // Handle step assignment after dialog submission
  const handleStepAssignment = (assignmentData: {
    workerName: string;
    deliveryDate: string;
    totalWeight: number;
    materials: { name: string; allocated_weight: number; unit: string; }[];
  }) => {
    setQueueItems(items => 
      items.map(item => {
        if (item.id === assignmentDialog.itemId) {
          return {
            ...item,
            manufacturing_steps: item.manufacturing_steps.map(step => {
              if (step.step === assignmentDialog.stepNumber) {
                return {
                  ...step,
                  status: 'In Progress' as const,
                  assignment: {
                    id: 'mock-assignment-id',
                    worker_name: assignmentData.workerName,
                    delivery_date: assignmentData.deliveryDate,
                    status: 'Assigned',
                    materials: assignmentData.materials,
                    total_weight_assigned: assignmentData.totalWeight
                  }
                };
              }
              return step;
            })
          };
        }
        return item;
      })
    );
    
    setAssignmentDialog({ open: false, itemId: '', stepNumber: 0, stepName: '' });
    
    toast({
      title: 'Step Assigned',
      description: `Step ${assignmentDialog.stepNumber} has been assigned successfully.`,
    });
  };

  // Mock function to handle receipt and QC submission
  const handleReceiptQC = (itemId: string, stepNumber: number, receivedWeight: number, receivedQuantity: number) => {
    setQueueItems(items => 
      items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            manufacturing_steps: item.manufacturing_steps.map(step => {
              if (step.step === stepNumber && step.assignment) {
                return {
                  ...step,
                  assignment: {
                    ...step.assignment,
                    received_weight: receivedWeight,
                    received_quantity: receivedQuantity,
                    status: 'Received'
                  }
                };
              }
              return step;
            })
          };
        }
        return item;
      })
    );
    
    toast({
      title: 'Receipt Recorded',
      description: `Step ${stepNumber} receipt and QC data recorded successfully.`,
    });
  };

  const filteredItems = queueItems.filter(item => {
    const matchesSearch = item.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const statusStats = {
    queued: queueItems.filter(item => item.status === 'Created').length,
    inProgress: queueItems.filter(item => item.status === 'In Progress').length,
    completed: queueItems.filter(item => item.status === 'Completed').length,
    onHold: queueItems.filter(item => item.status === 'On Hold').length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading production queue...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Queued</p>
                <p className="text-2xl font-bold text-blue-600">{statusStats.queued}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{statusStats.inProgress}</p>
              </div>
              <Play className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{statusStats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Hold</p>
                <p className="text-2xl font-bold text-red-600">{statusStats.onHold}</p>
              </div>
              <Pause className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Enhanced Production Queue
            </CardTitle>
            <AddToQueueDialog onProductAdded={handleProductAdded} />
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search by product code, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Created">Created</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Queue Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Details</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Manufacturing Progress</TableHead>
                  <TableHead>Current Step</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const currentStep = item.manufacturing_steps.find(step => step.step === item.current_step);
                  const isStepAssigned = currentStep?.assignment;
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-2">
                            {item.product_code}
                            {item.child_tickets && item.child_tickets.length > 0 && (
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-600">
                                {item.child_tickets.length} rework
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.category} • {item.subcategory} • {item.size}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Order: {item.order_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.quantity_required} required</div>
                          {item.quantity_in_progress > 0 && (
                            <div className="text-sm text-muted-foreground">
                              {item.quantity_in_progress} in progress
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Overall Progress</span>
                            <span>{getOverallProgress(item)}%</span>
                          </div>
                          <Progress value={getOverallProgress(item)} className="h-2" />
                          <div className="flex gap-1">
                            {item.manufacturing_steps.map((step) => (
                              <div
                                key={step.step}
                                className={`h-2 w-4 rounded-sm ${
                                  step.status === 'Completed'
                                    ? 'bg-green-500'
                                    : step.status === 'In Progress'
                                    ? 'bg-yellow-500'
                                    : 'bg-gray-200'
                                }`}
                                title={`Step ${step.step}: ${step.name} (${step.status})`}
                              />
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={getStepStatusColor(item.manufacturing_steps[item.current_step - 1]?.status || 'Pending')}>
                            Step {item.current_step}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {item.manufacturing_steps[item.current_step - 1]?.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(item.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(item.status)}
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleUpdateItem(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          {/* Step Assignment/Update Button */}
                          {currentStep && (
                            <>
                              {!isStepAssigned ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenAssignmentDialog(item.id, currentStep.step, currentStep.name)}
                                  className="flex items-center gap-1"
                                >
                                  <Plus className="h-3 w-3" />
                                  Assign
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateItem(item)}
                                  className="flex items-center gap-1"
                                >
                                  <Edit className="h-3 w-3" />
                                  Update
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No items found in the production queue matching your filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Update Production Item Dialog */}
      <EnhancedUpdateProductionItemDialog
        item={updateItem}
        open={!!updateItem}
        onOpenChange={(open) => !open && setUpdateItem(null)}
        onUpdate={handleUpdateComplete}
        onStepAssignment={() => {}} // Not used anymore since we handle it differently
        onReceiptQC={handleReceiptQC}
      />

      {/* Step Assignment Dialog */}
      <StepAssignmentDialog
        open={assignmentDialog.open}
        onOpenChange={(open) => setAssignmentDialog(prev => ({ ...prev, open }))}
        onAssign={handleStepAssignment}
        stepNumber={assignmentDialog.stepNumber}
        stepName={assignmentDialog.stepName}
      />
    </div>
  );
};

export default EnhancedProductionQueue;
