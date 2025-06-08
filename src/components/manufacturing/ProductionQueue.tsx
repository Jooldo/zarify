
import { useState } from 'react';
import { Package, Clock, Play, Pause, CheckCircle, AlertCircle, Eye, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface ProductionQueueItem {
  id: string;
  product_code: string;
  category: string;
  subcategory: string;
  size: string;
  quantity_required: number;
  quantity_in_progress: number;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Queued' | 'In Progress' | 'Completed' | 'On Hold';
  estimated_completion: string;
  assigned_worker?: string;
  order_numbers: string[];
  created_date: string;
  current_step: number;
  manufacturing_steps: {
    step: number;
    name: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    completed_quantity: number;
  }[];
}

const ProductionQueue = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<ProductionQueueItem | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Mock data with sequential manufacturing steps
  const queueItems: ProductionQueueItem[] = [
    {
      id: '1',
      product_code: 'ANK-001-2.50',
      category: 'Traditional',
      subcategory: 'Silver',
      size: '2.50m',
      quantity_required: 50,
      quantity_in_progress: 20,
      priority: 'High',
      status: 'In Progress',
      estimated_completion: '2024-01-15',
      assigned_worker: 'John Doe',
      order_numbers: ['ORD-001', 'ORD-003'],
      created_date: '2024-01-10',
      current_step: 3,
      manufacturing_steps: [
        { step: 1, name: 'Material Preparation', status: 'Completed', completed_quantity: 50 },
        { step: 2, name: 'Cutting & Shaping', status: 'Completed', completed_quantity: 50 },
        { step: 3, name: 'Assembly', status: 'In Progress', completed_quantity: 20 },
        { step: 4, name: 'Finishing', status: 'Pending', completed_quantity: 0 },
        { step: 5, name: 'Quality Control', status: 'Pending', completed_quantity: 0 }
      ]
    },
    {
      id: '2',
      product_code: 'ANK-002-3.00',
      category: 'Modern',
      subcategory: 'Gold',
      size: '3.00m',
      quantity_required: 30,
      quantity_in_progress: 0,
      priority: 'Medium',
      status: 'Queued',
      estimated_completion: '2024-01-18',
      order_numbers: ['ORD-002'],
      created_date: '2024-01-11',
      current_step: 1,
      manufacturing_steps: [
        { step: 1, name: 'Material Preparation', status: 'Pending', completed_quantity: 0 },
        { step: 2, name: 'Cutting & Shaping', status: 'Pending', completed_quantity: 0 },
        { step: 3, name: 'Assembly', status: 'Pending', completed_quantity: 0 },
        { step: 4, name: 'Finishing', status: 'Pending', completed_quantity: 0 },
        { step: 5, name: 'Quality Control', status: 'Pending', completed_quantity: 0 }
      ]
    },
    {
      id: '3',
      product_code: 'ANK-001-2.25',
      category: 'Traditional',
      subcategory: 'Silver',
      size: '2.25m',
      quantity_required: 25,
      quantity_in_progress: 25,
      priority: 'Low',
      status: 'Completed',
      estimated_completion: '2024-01-12',
      assigned_worker: 'Jane Smith',
      order_numbers: ['ORD-004'],
      created_date: '2024-01-08',
      current_step: 5,
      manufacturing_steps: [
        { step: 1, name: 'Material Preparation', status: 'Completed', completed_quantity: 25 },
        { step: 2, name: 'Cutting & Shaping', status: 'Completed', completed_quantity: 25 },
        { step: 3, name: 'Assembly', status: 'Completed', completed_quantity: 25 },
        { step: 4, name: 'Finishing', status: 'Completed', completed_quantity: 25 },
        { step: 5, name: 'Quality Control', status: 'Completed', completed_quantity: 25 }
      ]
    },
    {
      id: '4',
      product_code: 'ANK-003-2.75',
      category: 'Designer',
      subcategory: 'Platinum',
      size: '2.75m',
      quantity_required: 15,
      quantity_in_progress: 5,
      priority: 'High',
      status: 'On Hold',
      estimated_completion: '2024-01-20',
      order_numbers: ['ORD-005'],
      created_date: '2024-01-12',
      current_step: 2,
      manufacturing_steps: [
        { step: 1, name: 'Material Preparation', status: 'Completed', completed_quantity: 15 },
        { step: 2, name: 'Cutting & Shaping', status: 'In Progress', completed_quantity: 5 },
        { step: 3, name: 'Assembly', status: 'Pending', completed_quantity: 0 },
        { step: 4, name: 'Finishing', status: 'Pending', completed_quantity: 0 },
        { step: 5, name: 'Quality Control', status: 'Pending', completed_quantity: 0 }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Queued':
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
      case 'Queued':
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
    
    // Add partial progress for in-progress step
    if (inProgressSteps > 0) {
      const currentStepProgress = getCurrentStepProgress(item);
      progress += (currentStepProgress / 100) * (1 / totalSteps) * 100;
    }
    
    return Math.round(progress);
  };

  const handleViewItem = (item: ProductionQueueItem) => {
    setSelectedItem(item);
  };

  const handleAddToQueue = () => {
    setShowAddDialog(true);
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
    queued: queueItems.filter(item => item.status === 'Queued').length,
    inProgress: queueItems.filter(item => item.status === 'In Progress').length,
    completed: queueItems.filter(item => item.status === 'Completed').length,
    onHold: queueItems.filter(item => item.status === 'On Hold').length
  };

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
              Production Queue
            </CardTitle>
            <Button onClick={handleAddToQueue}>
              <Plus className="h-4 w-4 mr-2" />
              Add to Queue
            </Button>
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
                <SelectItem value="Queued">Queued</SelectItem>
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
                  <TableHead>Assigned Worker</TableHead>
                  <TableHead>Est. Completion</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.product_code}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.category} • {item.subcategory} • {item.size}
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
                        <div className="text-xs text-muted-foreground">
                          {item.manufacturing_steps[item.current_step - 1]?.completed_quantity || 0}/{item.quantity_required}
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
                      {item.assigned_worker || (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>{item.estimated_completion}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.order_numbers.map((orderNum) => (
                          <Badge key={orderNum} variant="outline" className="text-xs">
                            {orderNum}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewItem(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {item.status === 'Queued' && (
                          <Button variant="ghost" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {item.status === 'In Progress' && (
                          <Button variant="ghost" size="sm">
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No items found in the production queue matching your filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Item Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Production Item Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Product Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Product Code:</strong> {selectedItem.product_code}</p>
                    <p><strong>Category:</strong> {selectedItem.category}</p>
                    <p><strong>Subcategory:</strong> {selectedItem.subcategory}</p>
                    <p><strong>Size:</strong> {selectedItem.size}</p>
                    <p><strong>Priority:</strong> {selectedItem.priority}</p>
                    <p><strong>Status:</strong> {selectedItem.status}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Production Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Quantity Required:</strong> {selectedItem.quantity_required}</p>
                    <p><strong>Quantity in Progress:</strong> {selectedItem.quantity_in_progress}</p>
                    <p><strong>Assigned Worker:</strong> {selectedItem.assigned_worker || 'Unassigned'}</p>
                    <p><strong>Est. Completion:</strong> {selectedItem.estimated_completion}</p>
                    <p><strong>Created Date:</strong> {selectedItem.created_date}</p>
                    <p><strong>Overall Progress:</strong> {getOverallProgress(selectedItem)}%</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Manufacturing Steps Progress</h4>
                <div className="space-y-3">
                  {selectedItem.manufacturing_steps.map((step, index) => {
                    const isCurrentStep = step.step === selectedItem.current_step;
                    const isPreviousStepCompleted = index === 0 || selectedItem.manufacturing_steps[index - 1].status === 'Completed';
                    const canStart = isPreviousStepCompleted;
                    
                    return (
                      <div key={step.step} className={`flex items-center justify-between p-3 border rounded-lg ${
                        isCurrentStep ? 'border-yellow-300 bg-yellow-50' : ''
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <Badge className={`${getStepStatusColor(step.status)} mb-1`}>
                              Step {step.step}
                            </Badge>
                            {!canStart && step.status === 'Pending' && (
                              <span className="text-xs text-red-500">Waiting</span>
                            )}
                          </div>
                          <div>
                            <span className="font-medium">{step.name}</span>
                            {isCurrentStep && (
                              <span className="ml-2 text-sm text-yellow-600">(Current)</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            {step.completed_quantity}/{selectedItem.quantity_required} completed
                          </div>
                          {step.status === 'In Progress' && (
                            <div className="text-xs text-yellow-600">
                              {Math.round((step.completed_quantity / selectedItem.quantity_required) * 100)}% done
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add to Queue Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item to Production Queue</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center text-muted-foreground">
            Add to Queue functionality would be implemented here with a form to select products and quantities.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductionQueue;
