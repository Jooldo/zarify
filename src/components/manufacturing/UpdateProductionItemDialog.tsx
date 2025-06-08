
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, Package, Scale } from 'lucide-react';
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
    weight_recorded?: number;
    qc_passed?: number;
    qc_failed?: number;
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
  const [weight, setWeight] = useState<number>(0);
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
      setWeight(stepData.weight_recorded || 0);
      setQcPassed(stepData.qc_passed || 0);
      setQcFailed(stepData.qc_failed || 0);
    }
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
        weight_recorded: weight,
        qc_passed: qcPassed,
        qc_failed: qcFailed,
        status: completedQuantity > 0 ? 'In Progress' : 'Pending'
      };

      // Mark step as completed if all quantity is done
      if (completedQuantity === maxCompletableQuantity && qcFailed === 0) {
        updatedItem.manufacturing_steps[stepIndex].status = 'Completed';
      }
    }

    // If there are QC failures, add them back to the previous step or raw materials
    if (qcFailed > 0 && selectedStep > 1) {
      const previousStepIndex = stepIndex - 1;
      if (previousStepIndex >= 0) {
        // Add failed quantity back to previous step
        updatedItem.manufacturing_steps[previousStepIndex].completed_quantity -= qcFailed;
      }
    }

    // Update current step and overall status
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

    // Update quantity in progress
    updatedItem.quantity_in_progress = updatedItem.manufacturing_steps
      .filter(step => step.status === 'In Progress')
      .reduce((sum, step) => sum + step.completed_quantity, 0);

    onUpdate(updatedItem);
    onOpenChange(false);
    
    toast({
      title: 'Production Updated',
      description: `Step ${selectedStep} updated successfully`,
    });
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

  const canWorkOnStep = (stepNumber: number) => {
    if (stepNumber === 1) return true;
    const previousStep = item.manufacturing_steps[stepNumber - 2];
    return previousStep && previousStep.status === 'Completed';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Update Production: {item.product_code}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium">Product Details</Label>
              <p className="text-sm">{item.category} • {item.subcategory} • {item.size}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Total Required</Label>
              <p className="text-sm">{item.quantity_required} units</p>
            </div>
          </div>

          {/* Worker Assignment */}
          <div className="space-y-2">
            <Label htmlFor="worker">Assigned Worker</Label>
            <Input
              id="worker"
              value={assignedWorker || item.assigned_worker || ''}
              onChange={(e) => setAssignedWorker(e.target.value)}
              placeholder="Enter worker name"
            />
          </div>

          {/* Step Selection */}
          <div className="space-y-2">
            <Label>Select Manufacturing Step</Label>
            <Select value={selectedStep.toString()} onValueChange={handleStepChange}>
              <SelectTrigger>
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
                    {!canWorkOnStep(step.step) && ' (Previous step incomplete)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Step Status */}
          {currentStepData && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Step {selectedStep}: {currentStepData.name}</h4>
                <Badge className={getStepStatusColor(currentStepData.status)}>
                  {currentStepData.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Available for Processing</Label>
                  <p className="text-lg font-semibold text-blue-600">{maxCompletableQuantity} units</p>
                </div>
                <div>
                  <Label className="text-sm">Currently Completed</Label>
                  <p className="text-lg font-semibold">{currentStepData.completed_quantity} units</p>
                </div>
              </div>

              <Separator />

              {/* Update Form */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="completed">Completed Quantity</Label>
                  <Input
                    id="completed"
                    type="number"
                    min="0"
                    max={maxCompletableQuantity}
                    value={completedQuantity}
                    onChange={(e) => setCompletedQuantity(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-1">
                    <Scale className="h-4 w-4" />
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qc-passed" className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    QC Passed
                  </Label>
                  <Input
                    id="qc-passed"
                    type="number"
                    min="0"
                    max={completedQuantity}
                    value={qcPassed}
                    onChange={(e) => setQcPassed(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qc-failed" className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    QC Failed
                  </Label>
                  <Input
                    id="qc-failed"
                    type="number"
                    min="0"
                    max={completedQuantity}
                    value={qcFailed}
                    onChange={(e) => setQcFailed(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {qcFailed > 0 && selectedStep > 1 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    {qcFailed} units will be reassigned to Step {selectedStep - 1} for rework.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>
              Update Production
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProductionItemDialog;
