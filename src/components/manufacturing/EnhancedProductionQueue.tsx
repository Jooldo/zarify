import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Play,
  Pause,
  MoreHorizontal,
  Eye,
  Edit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AddToQueueDialog from './AddToQueueDialog';
import StepAssignmentDialog from './StepAssignmentDialog';
import EnhancedUpdateProductionItemDialog from './EnhancedUpdateProductionItemDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ProductionItem {
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

// Mock data for demonstration
const mockProductionItems: ProductionItem[] = [
  {
    id: '1',
    product_code: 'FG-001',
    category: 'Furniture',
    subcategory: 'Chair',
    size: 'Standard',
    quantity_required: 100,
    quantity_in_progress: 20,
    priority: 'High',
    status: 'In Progress',
    estimated_completion: '2024-08-15',
    order_numbers: ['SO-2024-001', 'SO-2024-002'],
    created_date: '2024-01-20',
    current_step: 2,
    manufacturing_steps: [
      { step: 1, name: 'Jalhai', status: 'Completed', completed_quantity: 100 },
      { step: 2, name: 'Cutting & Shaping', status: 'In Progress', completed_quantity: 20 },
      { step: 3, name: 'Assembly', status: 'Pending', completed_quantity: 0 },
      { step: 4, name: 'Finishing', status: 'Pending', completed_quantity: 0 },
      { step: 5, name: 'Quality Control', status: 'Pending', completed_quantity: 0 }
    ]
  },
  {
    id: '2',
    product_code: 'FG-002',
    category: 'Textiles',
    subcategory: 'Fabric Roll',
    size: 'Large',
    quantity_required: 500,
    quantity_in_progress: 100,
    priority: 'Medium',
    status: 'In Progress',
    estimated_completion: '2024-09-01',
    order_numbers: ['SO-2024-005'],
    created_date: '2024-02-10',
    current_step: 3,
    manufacturing_steps: [
      { step: 1, name: 'Jalhai', status: 'Completed', completed_quantity: 500 },
      { step: 2, name: 'Cutting & Shaping', status: 'Completed', completed_quantity: 500 },
      { step: 3, name: 'Assembly', status: 'In Progress', completed_quantity: 100 },
      { step: 4, name: 'Finishing', status: 'Pending', completed_quantity: 0 },
      { step: 5, name: 'Quality Control', status: 'Pending', completed_quantity: 0 }
    ]
  },
  {
    id: '3',
    product_code: 'FG-003',
    category: 'Electronics',
    subcategory: 'Circuit Board',
    size: 'Small',
    quantity_required: 1000,
    quantity_in_progress: 0,
    priority: 'Low',
    status: 'Queued',
    estimated_completion: '2024-10-15',
    order_numbers: ['SO-2024-010', 'SO-2024-011'],
    created_date: '2024-03-01',
    current_step: 1,
    manufacturing_steps: [
      { step: 1, name: 'Jalhai', status: 'Pending', completed_quantity: 0 },
      { step: 2, name: 'Cutting & Shaping', status: 'Pending', completed_quantity: 0 },
      { step: 3, name: 'Assembly', status: 'Pending', completed_quantity: 0 },
      { step: 4, name: 'Finishing', status: 'Pending', completed_quantity: 0 },
      { step: 5, name: 'Quality Control', status: 'Pending', completed_quantity: 0 }
    ]
  },
  {
    id: '4',
    product_code: 'FG-004',
    category: 'Plastics',
    subcategory: 'Container',
    size: 'Medium',
    quantity_required: 200,
    quantity_in_progress: 50,
    priority: 'Medium',
    status: 'In Progress',
    estimated_completion: '2024-09-20',
    order_numbers: ['SO-2024-007'],
    created_date: '2024-02-20',
    current_step: 4,
    manufacturing_steps: [
      { step: 1, name: 'Jalhai', status: 'Completed', completed_quantity: 200 },
      { step: 2, name: 'Cutting & Shaping', status: 'Completed', completed_quantity: 200 },
      { step: 3, name: 'Assembly', status: 'Completed', completed_quantity: 200 },
      { step: 4, name: 'Finishing', status: 'In Progress', completed_quantity: 50 },
      { step: 5, name: 'Quality Control', status: 'Pending', completed_quantity: 0 }
    ]
  },
  {
    id: '5',
    product_code: 'FG-005',
    category: 'Metals',
    subcategory: 'Metal Sheet',
    size: 'Large',
    quantity_required: 300,
    quantity_in_progress: 0,
    priority: 'High',
    status: 'Queued',
    estimated_completion: '2024-08-25',
    order_numbers: ['SO-2024-003', 'SO-2024-004'],
    created_date: '2024-01-25',
    current_step: 1,
    manufacturing_steps: [
      { step: 1, name: 'Jalhai', status: 'Pending', completed_quantity: 0 },
      { step: 2, name: 'Cutting & Shaping', status: 'Pending', completed_quantity: 0 },
      { step: 3, name: 'Assembly', status: 'Pending', completed_quantity: 0 },
      { step: 4, name: 'Finishing', status: 'Pending', completed_quantity: 0 },
      { step: 5, name: 'Quality Control', status: 'Pending', completed_quantity: 0 }
    ]
  }
];

const EnhancedProductionQueue = () => {
  const [productionItems, setProductionItems] = useState<ProductionItem[]>(mockProductionItems);
  const [stepAssignmentDialog, setStepAssignmentDialog] = useState<{
    open: boolean;
    productionItemId: string;
    stepNumber: number;
    stepName: string;
    productionItem?: ProductionItem;
  }>({
    open: false,
    productionItemId: '',
    stepNumber: 1,
    stepName: '',
    productionItem: undefined
  });
  const [updateDialog, setUpdateDialog] = useState<{
    open: boolean;
    item: ProductionItem | null;
  }>({
    open: false,
    item: null
  });

  const handleProductAdded = (newItem: ProductionItem) => {
    setProductionItems(prev => [newItem, ...prev]);
  };

  const handleAssignStep = (item: ProductionItem, stepNumber: number, stepName: string) => {
    console.log('DEBUG: handleAssignStep called with:', {
      itemId: item.id,
      productCode: item.product_code,
      category: item.category,
      subcategory: item.subcategory,
      size: item.size,
      quantityRequired: item.quantity_required,
      stepNumber,
      stepName
    });
    
    setStepAssignmentDialog({
      open: true,
      productionItemId: item.id,
      stepNumber,
      stepName,
      productionItem: item // Make sure the full item is passed
    });
  };

  const handleAssignmentComplete = () => {
    // Refresh production items or update the specific item
    console.log('Assignment completed');
  };

  const handleUpdateItem = (item: ProductionItem) => {
    setUpdateDialog({
      open: true,
      item
    });
  };

  const handleItemUpdated = (updatedItem: ProductionItem) => {
    setProductionItems(prev => 
      prev.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
    );
  };

  const calculateProgress = (item: ProductionItem): number => {
    const completedSteps = item.manufacturing_steps.filter(step => step.status === 'Completed').length;
    return (completedSteps / item.manufacturing_steps.length) * 100;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Queued': return 'text-gray-500';
      case 'In Progress': return 'text-blue-500';
      case 'Completed': return 'text-green-500';
      case 'On Hold': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'High': return 'text-red-500';
      case 'Medium': return 'text-yellow-500';
      case 'Low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Production Queue</h2>
          <p className="text-muted-foreground">
            Manage and track manufacturing progress
          </p>
        </div>
        <AddToQueueDialog onProductAdded={handleProductAdded} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productionItems.length}</div>
            <p className="text-muted-foreground">Total items in the queue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productionItems.filter(item => item.status === 'In Progress').length}</div>
            <p className="text-muted-foreground">Items currently being manufactured</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productionItems.filter(item => item.status === 'Queued').length}</div>
            <p className="text-muted-foreground">Items waiting to be manufactured</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productionItems.filter(item => item.status === 'Completed').length}</div>
            <p className="text-muted-foreground">Items that have completed manufacturing</p>
          </CardContent>
        </Card>
      </div>

      {/* Production Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Production Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Estimated Completion</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productionItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product_code}</TableCell>
                  <TableCell>{item.category} / {item.subcategory}</TableCell>
                  <TableCell>{item.size}</TableCell>
                  <TableCell>{item.quantity_required}</TableCell>
                  <TableCell className={getPriorityColor(item.priority)}>
                    {item.priority}
                  </TableCell>
                  <TableCell className={getStatusColor(item.status)}>
                    {item.status}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Progress value={calculateProgress(item)} className="w-[150px] mr-2" />
                      <span>{calculateProgress(item).toFixed(0)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(item.estimated_completion).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleUpdateItem(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Update Item
                        </DropdownMenuItem>
                        {item.manufacturing_steps
                          .filter(step => step.status === 'Pending')
                          .slice(0, 1)
                          .map(step => (
                            <DropdownMenuItem 
                              key={step.step}
                              onClick={() => handleAssignStep(item, step.step, step.name)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Assign Step {step.step}
                            </DropdownMenuItem>
                          ))
                        }
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Step Assignment Dialog */}
      <StepAssignmentDialog
        open={stepAssignmentDialog.open}
        onOpenChange={(open) => setStepAssignmentDialog(prev => ({ ...prev, open }))}
        productionItemId={stepAssignmentDialog.productionItemId}
        stepNumber={stepAssignmentDialog.stepNumber}
        stepName={stepAssignmentDialog.stepName}
        productionItem={stepAssignmentDialog.productionItem}
        onAssignmentComplete={handleAssignmentComplete}
      />

      {/* Update Production Item Dialog */}
      <EnhancedUpdateProductionItemDialog
        open={updateDialog.open}
        onOpenChange={(open) => setUpdateDialog(prev => ({ ...prev, open }))}
        item={updateDialog.item}
        onUpdate={handleItemUpdated}
      />
    </div>
  );
};

export default EnhancedProductionQueue;
