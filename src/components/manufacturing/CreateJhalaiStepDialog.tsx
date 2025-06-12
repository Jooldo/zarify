
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Scale, User, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { StepCardData } from './ManufacturingStepCard';
import { useWorkers } from '@/hooks/useWorkers';
import { useToast } from '@/hooks/use-toast';

interface CreateJhalaiStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manufacturingStepData: StepCardData | null;
  onCreateJhalaiStep?: (jhalaiStepData: JhalaiStepData) => void;
}

export interface JhalaiStepData {
  manufacturingOrderId: string;
  assignedWorkerId: string;
  assignedWorkerName: string;
  dueDate: Date;
  rawMaterialWeightAssigned: number;
  requiredRawMaterialWeight: number;
}

const CreateJhalaiStepDialog: React.FC<CreateJhalaiStepDialogProps> = ({
  open,
  onOpenChange,
  manufacturingStepData,
  onCreateJhalaiStep
}) => {
  const { toast } = useToast();
  const { workers } = useWorkers();
  
  const [assignedWorkerId, setAssignedWorkerId] = useState<string>('');
  const [dueDate, setDueDate] = useState<Date>();
  const [rawMaterialWeightAssigned, setRawMaterialWeightAssigned] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Calculate required raw material weight based on quantity and raw materials
  const requiredRawMaterialWeight = React.useMemo(() => {
    if (!manufacturingStepData?.rawMaterials || !manufacturingStepData?.quantityRequired) {
      return 50; // Default fallback
    }
    
    // Calculate total raw material weight needed
    const totalWeight = manufacturingStepData.rawMaterials.reduce((total, material) => {
      return total + (material.quantity * (manufacturingStepData.quantityRequired || 1));
    }, 0);
    
    return Math.round(totalWeight * 100) / 100; // Round to 2 decimal places
  }, [manufacturingStepData]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!assignedWorkerId) {
      newErrors.worker = 'Please select a worker';
    }
    
    if (!dueDate) {
      newErrors.dueDate = 'Please select a due date';
    } else if (dueDate < new Date()) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }
    
    if (!rawMaterialWeightAssigned || rawMaterialWeightAssigned <= 0) {
      newErrors.weight = 'Please enter a valid weight';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!manufacturingStepData) return;
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors and try again',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedWorker = workers.find(w => w.id === assignedWorkerId);
      
      const jhalaiStepData: JhalaiStepData = {
        manufacturingOrderId: manufacturingStepData.orderId,
        assignedWorkerId,
        assignedWorkerName: selectedWorker?.name || '',
        dueDate: dueDate!,
        rawMaterialWeightAssigned,
        requiredRawMaterialWeight,
      };

      onCreateJhalaiStep?.(jhalaiStepData);
      
      toast({
        title: 'Jhalai Step Created',
        description: `Successfully created Jhalai step assigned to ${selectedWorker?.name}`,
      });

      // Reset form
      setAssignedWorkerId('');
      setDueDate(undefined);
      setRawMaterialWeightAssigned(0);
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create Jhalai step',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setAssignedWorkerId('');
      setDueDate(undefined);
      setRawMaterialWeightAssigned(0);
      setErrors({});
    }
    onOpenChange(newOpen);
  };

  if (!manufacturingStepData) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-blue-600" />
            Move to Jhalai
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Context */}
          <div className="bg-blue-50 p-3 rounded-lg border">
            <p className="text-sm text-blue-800">
              <strong>Order:</strong> {manufacturingStepData.orderNumber}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Product:</strong> {manufacturingStepData.productName}
            </p>
            {manufacturingStepData.quantityRequired && (
              <p className="text-sm text-blue-800">
                <strong>Quantity:</strong> {manufacturingStepData.quantityRequired}
              </p>
            )}
          </div>

          {/* Worker Assignment */}
          <div className="space-y-2">
            <Label htmlFor="worker" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Assigned Worker *
            </Label>
            <Select value={assignedWorkerId} onValueChange={setAssignedWorkerId}>
              <SelectTrigger className={errors.worker ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a worker" />
              </SelectTrigger>
              <SelectContent>
                {workers.map((worker) => (
                  <SelectItem key={worker.id} value={worker.id}>
                    {worker.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.worker && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors.worker}
              </div>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Due Date *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground",
                    errors.dueDate && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
            {errors.dueDate && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors.dueDate}
              </div>
            )}
          </div>

          {/* Required Material Weight (Read-only) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Required Material Weight (Auto-calculated)
            </Label>
            <Input
              value={`${requiredRawMaterialWeight}g`}
              readOnly
              className="bg-gray-50 text-gray-700"
            />
            <p className="text-xs text-muted-foreground">
              Based on quantity ({manufacturingStepData.quantityRequired || 1}) and BOM requirements
            </p>
          </div>

          {/* Material Weight Assigned */}
          <div className="space-y-2">
            <Label htmlFor="weight" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Material Weight Assigned (g) *
            </Label>
            <Input
              id="weight"
              type="number"
              value={rawMaterialWeightAssigned || ''}
              onChange={(e) => setRawMaterialWeightAssigned(Number(e.target.value))}
              placeholder="Enter weight in grams"
              min="0"
              step="0.1"
              className={errors.weight ? 'border-red-500' : ''}
            />
            {errors.weight && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors.weight}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Creating...' : 'Move to Jhalai'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJhalaiStepDialog;
