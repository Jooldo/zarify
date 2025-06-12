
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Scale, User, Clock } from 'lucide-react';
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

  // Calculate required raw material weight based on BOM (simplified calculation)
  const requiredRawMaterialWeight = manufacturingStepData ? 50 : 0; // Placeholder calculation

  const handleSubmit = async () => {
    if (!manufacturingStepData || !assignedWorkerId || !dueDate || rawMaterialWeightAssigned <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
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
        dueDate,
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

  if (!manufacturingStepData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-blue-600" />
            Create Jhalai Step
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Context */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Order:</strong> {manufacturingStepData.orderNumber}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Product:</strong> {manufacturingStepData.productName}
            </p>
          </div>

          {/* Worker Assignment */}
          <div className="space-y-2">
            <Label htmlFor="worker" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Assigned Worker *
            </Label>
            <Select value={assignedWorkerId} onValueChange={setAssignedWorkerId}>
              <SelectTrigger>
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
                    !dueDate && "text-muted-foreground"
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
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Required Raw Material Weight (Read-only) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Required Raw Material Weight (Auto-calculated)
            </Label>
            <Input
              value={`${requiredRawMaterialWeight}g`}
              readOnly
              className="bg-gray-50"
            />
          </div>

          {/* Raw Material Weight Assigned */}
          <div className="space-y-2">
            <Label htmlFor="weight" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Raw Material Weight Assigned (g) *
            </Label>
            <Input
              id="weight"
              type="number"
              value={rawMaterialWeightAssigned || ''}
              onChange={(e) => setRawMaterialWeightAssigned(Number(e.target.value))}
              placeholder="Enter weight in grams"
              min="0"
              step="0.1"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Creating...' : 'Create Jhalai Step'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJhalaiStepDialog;
