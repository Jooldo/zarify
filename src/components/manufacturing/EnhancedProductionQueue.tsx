import { useState } from 'react';
import { Package, Clock, Play, Pause, CheckCircle, AlertCircle, Eye, Plus, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import EnhancedUpdateProductionItemDialog from './EnhancedUpdateProductionItemDialog';

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
    assignment?: {
      id: string;
      worker_name: string;
      delivery_date: string;
      status: string;
      materials: { name: string; allocated_weight: number; unit: string; }[];
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

  // Enhanced mock data with assignments and QC logs
  const [queueItems, setQueueItems] = useState<ProductionQueueItem[]>([
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
      current_step: 2,
      manufacturing_steps: [
        {
          step: 1,
          name: 'Jalhai',
          status: 'Completed',
          completed_quantity: 50,
          assignment: {
            id: 'assign-1',
            worker_name: 'John Doe',
            delivery_date: '2024-01-12',
            status: 'Completed',
            materials: [
              { name: 'Silver Wire', allocated_weight: 125.5, unit: 'kg' },
              { name: 'Copper Base', allocated_weight: 50.0, unit: 'kg' }
            ]
          },
          qc_logs: [
            {
              received_weight: 175.0,
              received_pieces: 50,
              qc_passed_pieces: 48,
              qc_failed_pieces: 2,
              qc_passed_weight: 168.5,
              qc_failed_weight: 6.5
            }
          ]
        },
        {
          step: 2,
          name: 'Cutting & Shaping',
          status: 'In Progress',
          completed_quantity: 20,
          assignment: {
            id: 'assign-2',
            worker_name: 'Jane Smith',
            delivery_date: '2024-01-14',
            status: 'In Progress',
            materials: [
              { name: 'Processed Silver', allocated_weight: 168.5, unit: 'kg' }
            ]
          }
        },
        { step: 3, name: 'Assembly', status: 'Pending', completed_quantity: 0 },
        { step: 4, name: 'Finishing', status: 'Pending', completed_quantity: 0 },
        { step: 5, name: 'Quality Control', status: 'Pending', completed_quantity: 0 }
      ],
      child_tickets: [
        {
          id: 'CT-12345678-1-001',
          parent_step: 1,
          quantity: 2,
          failed_weight: 6.5,
          reason: 'QC Failed - Material defects',
          status: 'Open',
          created_at: '2024-01-12'
        }
      ]
    }
  ]);

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
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Enhanced Production Queue
          </CardTitle>
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleUpdateItem(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
      />
    </div>
  );
};

export default EnhancedProductionQueue;
