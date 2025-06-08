
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, AlertCircle, Package, Scale, Ticket, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    assigned_weight?: number;
    received_weight?: number;
    qc_passed?: number;
    qc_failed?: number;
  }[];
  child_tickets?: {
    id: string;
    parent_step: number;
    quantity: number;
    reason: string;
    status: 'Open' | 'In Progress' | 'Resolved';
    created_at: string;
  }[];
}

interface UpdateProductionItemDialogProps {
  item: ProductionQueueItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedItem: ProductionQueueItem) => void;
}

const UpdateProductionItemDialog = ({ item, open, onOpenChange, onUpdate }: UpdateProductionItemDialogProps) => {
  const [assignedWorker, setAssignedWorker] = useState<string>('');
  const [stepData, setStepData] = useState<Record<number, {
    completed_quantity: number;
    assigned_weight: number;
    received_weight: number;
    qc_passed: number;
    qc_failed: number;
  }>>({});
  const { toast } = useToast();

  // Initialize step data when item changes
  React.useEffect(() => {
    if (item) {
      setAssignedWorker(item.assigned_worker || '');
      const initialStepData: Record<number, any> = {};
      item.manufacturing_steps.forEach(step => {
        initialStepData[step.step] = {
          completed_quantity: step.completed_quantity || 0,
          assigned_weight: step.assigned_weight || 0,
          received_weight: step.received_weight || 0,
          qc_passed: step.qc_passed || 0,
          qc_failed: step.qc_failed || 0,
        };
      });
      setStepData(initialStepData);
    }
  }, [item]);

  const updateStepField = (stepNumber: number, field: string, value: number) => {
    setStepData(prev => ({
      ...prev,
      [stepNumber]: {
        ...prev[stepNumber],
        [field]: value
      }
    }));
  };

  const getMaxCompletableQuantity = (stepNumber: number) => {
    if (!item) return 0;
    if (stepNumber === 1) return item.quantity_required;
    const previousStep = item.manufacturing_steps.find(step => step.step === stepNumber - 1);
    return previousStep?.completed_quantity || 0;
  };

  const generateChildTicket = (parentStep: number, failedQuantity: number) => {
    if (!item) return null;
    return {
      id: `CT-${item.id.substring(0, 8)}-${parentStep}-${Date.now()}`,
      parent_step: parentStep,
      quantity: failedQuantity,
      reason: `QC Failed - Step ${parentStep}`,
      status: 'Open' as const,
      created_at: new Date().toISOString()
    };
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

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Open':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChildTicketsForStep = (stepNumber: number) => {
    if (!item?.child_tickets) return [];
    return item.child_tickets.filter(ticket => ticket.parent_step === stepNumber);
  };

  const resolveChildTicket = (ticketId: string) => {
    if (!item) return;
    
    const updatedItem = { ...item };
    if (updatedItem.child_tickets) {
      updatedItem.child_tickets = updatedItem.child_tickets.map(ticket =>
        ticket.id === ticketId ? { ...ticket, status: 'Resolved' as const } : ticket
      );
    }
    
    onUpdate(updatedItem);
    
    toast({
      title: 'Child Ticket Resolved',
      description: `Ticket ${ticketId} has been marked as resolved.`,
    });
  };

  const handleUpdate = () => {
    if (!item) return;
    
    const updatedItem = { ...item };
    updatedItem.assigned_worker = assignedWorker || item.assigned_worker;

    let hasErrors = false;
    let newChildTickets: any[] = [];

    // Validate and update all steps
    updatedItem.manufacturing_steps = updatedItem.manufacturing_steps.map(step => {
      const currentStepData = stepData[step.step] || {
        completed_quantity: step.completed_quantity || 0,
        assigned_weight: step.assigned_weight || 0,
        received_weight: step.received_weight || 0,
        qc_passed: step.qc_passed || 0,
        qc_failed: step.qc_failed || 0,
      };

      const maxCompletable = getMaxCompletableQuantity(step.step);

      // Validation
      if (currentStepData.completed_quantity > maxCompletable) {
        toast({
          title: 'Invalid Quantity',
          description: `Step ${step.step}: Cannot complete more than ${maxCompletable} items`,
          variant: 'destructive',
        });
        hasErrors = true;
        return step;
      }

      if (currentStepData.qc_passed + currentStepData.qc_failed > currentStepData.completed_quantity) {
        toast({
          title: 'Invalid QC Numbers',
          description: `Step ${step.step}: QC passed + failed cannot exceed completed quantity`,
          variant: 'destructive',
        });
        hasErrors = true;
        return step;
      }

      // Generate child ticket for QC failed items
      if (currentStepData.qc_failed > 0) {
        const childTicket = generateChildTicket(step.step, currentStepData.qc_failed);
        if (childTicket) {
          newChildTickets.push(childTicket);
        }
      }

      // Determine step status with proper typing
      let stepStatus: 'Pending' | 'In Progress' | 'Completed' = 'Pending';
      if (currentStepData.completed_quantity > 0) {
        stepStatus = 'In Progress';
      }
      if (currentStepData.completed_quantity === maxCompletable && currentStepData.qc_failed === 0) {
        stepStatus = 'Completed';
      }

      return {
        ...step,
        completed_quantity: currentStepData.completed_quantity,
        assigned_weight: currentStepData.assigned_weight,
        received_weight: currentStepData.received_weight,
        qc_passed: currentStepData.qc_passed,
        qc_failed: currentStepData.qc_failed,
        status: stepStatus
      };
    });

    if (hasErrors) return;

    // Add new child tickets
    if (newChildTickets.length > 0) {
      if (!updatedItem.child_tickets) {
        updatedItem.child_tickets = [];
      }
      updatedItem.child_tickets.push(...newChildTickets);
    }

    // Update overall status and current step
    const completedSteps = updatedItem.manufacturing_steps.filter(step => step.status === 'Completed').length;
    const inProgressSteps = updatedItem.manufacturing_steps.filter(step => step.status === 'In Progress').length;

    if (completedSteps === updatedItem.manufacturing_steps.length) {
      updatedItem.status = 'Completed';
      updatedItem.current_step = updatedItem.manufacturing_steps.length;
    } else if (inProgressSteps > 0 || completedSteps > 0) {
      updatedItem.status = 'In Progress';
      updatedItem.current_step = Math.max(1, completedSteps + 1);
    } else {
      updatedItem.status = 'Queued';
      updatedItem.current_step = 1;
    }

    updatedItem.quantity_in_progress = updatedItem.manufacturing_steps
      .filter(step => step.status === 'In Progress')
      .reduce((sum, step) => sum + step.completed_quantity, 0);

    onUpdate(updatedItem);
    onOpenChange(false);
    
    toast({
      title: 'Production Updated',
      description: `All steps updated successfully${newChildTickets.length > 0 ? `. ${newChildTickets.length} child ticket(s) created for QC failures.` : ''}`,
    });
  };

  // Handle the case when item is null - don't render the dialog content but still keep it in sync with open state
  if (!item) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Package className="h-4 w-4" />
            Update Production: {item.product_code}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Compact Product Info */}
          <div className="grid grid-cols-4 gap-3 p-3 bg-muted/50 rounded text-sm">
            <div>
              <span className="font-medium">Product:</span> {item.category} • {item.subcategory}
            </div>
            <div>
              <span className="font-medium">Size:</span> {item.size}
            </div>
            <div>
              <span className="font-medium">Required:</span> {item.quantity_required}
            </div>
            <div>
              <span className="font-medium">Priority:</span>
              <Badge className="ml-1" variant="outline">{item.priority}</Badge>
            </div>
          </div>

          {/* Worker Assignment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Assigned Worker</Label>
              <Input
                value={assignedWorker}
                onChange={(e) => setAssignedWorker(e.target.value)}
                placeholder="Assign worker"
                className="h-8"
              />
            </div>
          </div>

          <Separator />

          {/* Manufacturing Steps Table */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Manufacturing Steps Progress
            </h4>
            
            <div className="space-y-4">
              {item.manufacturing_steps.map((step) => {
                const currentData = stepData[step.step] || {
                  completed_quantity: step.completed_quantity || 0,
                  assigned_weight: step.assigned_weight || 0,
                  received_weight: step.received_weight || 0,
                  qc_passed: step.qc_passed || 0,
                  qc_failed: step.qc_failed || 0,
                };
                const maxCompletable = getMaxCompletableQuantity(step.step);
                const childTickets = getChildTicketsForStep(step.step);
                
                return (
                  <div key={step.step} className="border rounded-lg overflow-hidden">
                    {/* Step Header */}
                    <div className="bg-muted/30 p-3 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getStepStatusColor(step.status)} variant="outline">
                            Step {step.step}
                          </Badge>
                          <span className="font-medium">{step.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Max: {maxCompletable}
                        </div>
                      </div>
                    </div>

                    {/* Step Data Table */}
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/20">
                            <TableHead className="w-20">Completed</TableHead>
                            <TableHead className="w-24">Assigned Wt</TableHead>
                            <TableHead className="w-24">Received Wt</TableHead>
                            <TableHead className="w-20">QC Pass</TableHead>
                            <TableHead className="w-20">QC Fail</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="text-sm">
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max={maxCompletable}
                                value={currentData.completed_quantity}
                                onChange={(e) => updateStepField(step.step, 'completed_quantity', parseInt(e.target.value) || 0)}
                                className="h-7 w-16 text-xs"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={currentData.assigned_weight}
                                onChange={(e) => updateStepField(step.step, 'assigned_weight', parseFloat(e.target.value) || 0)}
                                className="h-7 w-20 text-xs"
                                placeholder="kg"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={currentData.received_weight}
                                onChange={(e) => updateStepField(step.step, 'received_weight', parseFloat(e.target.value) || 0)}
                                className="h-7 w-20 text-xs"
                                placeholder="kg"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max={currentData.completed_quantity}
                                value={currentData.qc_passed}
                                onChange={(e) => updateStepField(step.step, 'qc_passed', parseInt(e.target.value) || 0)}
                                className="h-7 w-16 text-xs"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max={currentData.completed_quantity}
                                value={currentData.qc_failed}
                                onChange={(e) => updateStepField(step.step, 'qc_failed', parseInt(e.target.value) || 0)}
                                className="h-7 w-16 text-xs"
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    {/* Child Tickets for this Step */}
                    {childTickets.length > 0 && (
                      <div className="p-3 bg-muted/10 border-t">
                        <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                          <Ticket className="h-3 w-3" />
                          Child Tickets ({childTickets.length})
                        </h5>
                        <div className="space-y-2">
                          {childTickets.map((ticket) => (
                            <div key={ticket.id} className="flex items-center justify-between p-2 bg-background rounded border text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-mono">{ticket.id}</span>
                                <span>•</span>
                                <span>{ticket.quantity} items</span>
                                <span>•</span>
                                <span className="text-muted-foreground">{ticket.reason}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getTicketStatusColor(ticket.status)} variant="outline">
                                  {ticket.status}
                                </Badge>
                                {ticket.status !== 'Resolved' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => resolveChildTicket(ticket.id)}
                                    className="h-6 px-2"
                                  >
                                    <Check className="h-3 w-3" />
                                    Resolve
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpdate}>
              Update All Steps
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProductionItemDialog;
