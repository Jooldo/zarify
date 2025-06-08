
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, Package, Scale, Ticket } from 'lucide-react';
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
  const [selectedStep, setSelectedStep] = useState<number>(1);
  const [completedQuantity, setCompletedQuantity] = useState<number>(0);
  const [assignedWeight, setAssignedWeight] = useState<number>(0);
  const [receivedWeight, setReceivedWeight] = useState<number>(0);
  const [qcPassed, setQcPassed] = useState<number>(0);
  const [qcFailed, setQcFailed] = useState<number>(0);
  const [assignedWorker, setAssignedWorker] = useState<string>('');
  const { toast } = useToast();

  if (!item) return null;

  const currentStepData = item.manufacturing_steps.find(step => step.step === selectedStep);
  const maxCompletableQuantity = selectedStep === 1 ? item.quantity_required : 
    item.manufacturing_steps[selectedStep - 2]?.completed_quantity || 0;

  const handleStepChange = (stepNumber: string) => {
    const stepNum = parseInt(stepNumber);
    setSelectedStep(stepNum);
    const stepData = item.manufacturing_steps.find(step => step.step === stepNum);
    if (stepData) {
      setCompletedQuantity(stepData.completed_quantity || 0);
      setAssignedWeight(stepData.assigned_weight || 0);
      setReceivedWeight(stepData.received_weight || 0);
      setQcPassed(stepData.qc_passed || 0);
      setQcFailed(stepData.qc_failed || 0);
    }
  };

  const generateChildTicket = (parentStep: number, failedQuantity: number) => {
    return {
      id: `CT-${item.id.substring(0, 8)}-${parentStep}-${Date.now()}`,
      parent_step: parentStep,
      quantity: failedQuantity,
      reason: `QC Failed - Step ${parentStep}`,
      status: 'Open' as const,
      created_at: new Date().toISOString()
    };
  };

  const handleUpdate = () => {
    if (completedQuantity > maxCompletableQuantity) {
      toast({
        title: 'Invalid Quantity',
        description: `Cannot complete more than ${maxCompletableQuantity} items for this step`,
        variant: 'destructive',
      });
      return;
    }

    if (qcPassed + qcFailed > completedQuantity) {
      toast({
        title: 'Invalid QC Numbers',
        description: 'QC passed + failed cannot exceed completed quantity',
        variant: 'destructive',
      });
      return;
    }

    const updatedItem = { ...item };
    updatedItem.assigned_worker = assignedWorker || item.assigned_worker;

    // Update the selected step
    const stepIndex = updatedItem.manufacturing_steps.findIndex(step => step.step === selectedStep);
    if (stepIndex !== -1) {
      updatedItem.manufacturing_steps[stepIndex] = {
        ...updatedItem.manufacturing_steps[stepIndex],
        completed_quantity: completedQuantity,
        assigned_weight: assignedWeight,
        received_weight: receivedWeight,
        qc_passed: qcPassed,
        qc_failed: qcFailed,
        status: completedQuantity > 0 ? 'In Progress' : 'Pending'
      };

      // Mark step as completed if all quantity is done and no QC failures
      if (completedQuantity === maxCompletableQuantity && qcFailed === 0) {
        updatedItem.manufacturing_steps[stepIndex].status = 'Completed';
      }
    }

    // Generate child ticket for QC failed items
    if (qcFailed > 0) {
      const childTicket = generateChildTicket(selectedStep, qcFailed);
      if (!updatedItem.child_tickets) {
        updatedItem.child_tickets = [];
      }
      updatedItem.child_tickets.push(childTicket);

      // Add failed quantity back to previous step or raw materials
      if (selectedStep > 1) {
        const previousStepIndex = stepIndex - 1;
        if (previousStepIndex >= 0) {
          updatedItem.manufacturing_steps[previousStepIndex].completed_quantity -= qcFailed;
        }
      }
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
      description: `Step ${selectedStep} updated successfully${qcFailed > 0 ? '. Child ticket created for QC failures.' : ''}`,
    });
  };

  const canWorkOnStep = (stepNumber: number) => {
    if (stepNumber === 1) return true;
    const previousStep = item.manufacturing_steps[stepNumber - 2];
    return previousStep && previousStep.status === 'Completed';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Package className="h-4 w-4" />
            Update: {item.product_code}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Compact Product Info */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-muted/50 rounded text-sm">
            <div>
              <span className="font-medium">Product:</span> {item.category} • {item.subcategory}
            </div>
            <div>
              <span className="font-medium">Size:</span> {item.size}
            </div>
            <div>
              <span className="font-medium">Required:</span> {item.quantity_required}
            </div>
          </div>

          {/* Worker and Step Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">Worker</Label>
              <Input
                value={assignedWorker || item.assigned_worker || ''}
                onChange={(e) => setAssignedWorker(e.target.value)}
                placeholder="Assign worker"
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-sm">Step</Label>
              <Select value={selectedStep.toString()} onValueChange={handleStepChange}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {item.manufacturing_steps.map((step) => (
                    <SelectItem 
                      key={step.step} 
                      value={step.step.toString()}
                      disabled={!canWorkOnStep(step.step)}
                    >
                      Step {step.step}: {step.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Current Step Details */}
          {currentStepData && (
            <div className="border rounded p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Step {selectedStep}: {currentStepData.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {currentStepData.status}
                </Badge>
              </div>

              {/* Compact Form Grid */}
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <Label className="text-xs">Available</Label>
                  <div className="font-medium text-blue-600">{maxCompletableQuantity}</div>
                </div>
                <div>
                  <Label className="text-xs">Current</Label>
                  <div className="font-medium">{currentStepData.completed_quantity}</div>
                </div>
                <div>
                  <Label className="text-xs">Completed</Label>
                  <Input
                    type="number"
                    min="0"
                    max={maxCompletableQuantity}
                    value={completedQuantity}
                    onChange={(e) => setCompletedQuantity(parseInt(e.target.value) || 0)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>

              <Separator />

              {/* Weight Tracking */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs flex items-center gap-1">
                    <Scale className="h-3 w-3" />
                    Assigned Weight (kg)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={assignedWeight}
                    onChange={(e) => setAssignedWeight(parseFloat(e.target.value) || 0)}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs flex items-center gap-1">
                    <Scale className="h-3 w-3" />
                    Received Weight (kg)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={receivedWeight}
                    onChange={(e) => setReceivedWeight(parseFloat(e.target.value) || 0)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>

              {/* QC Section */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    QC Passed
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max={completedQuantity}
                    value={qcPassed}
                    onChange={(e) => setQcPassed(parseInt(e.target.value) || 0)}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-red-600" />
                    QC Failed
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max={completedQuantity}
                    value={qcFailed}
                    onChange={(e) => setQcFailed(parseInt(e.target.value) || 0)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>

              {qcFailed > 0 && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                  <div className="flex items-center gap-1 text-amber-800">
                    <Ticket className="h-3 w-3" />
                    Child ticket will be created for {qcFailed} failed items
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Child Tickets Display */}
          {item.child_tickets && item.child_tickets.length > 0 && (
            <div className="border rounded p-3">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                <Ticket className="h-3 w-3" />
                Child Tickets ({item.child_tickets.length})
              </h4>
              <div className="space-y-1">
                {item.child_tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded">
                    <span>{ticket.id}</span>
                    <span>Step {ticket.parent_step} • {ticket.quantity} items</span>
                    <Badge variant="outline" className="text-xs">
                      {ticket.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpdate}>
              Update
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProductionItemDialog;
