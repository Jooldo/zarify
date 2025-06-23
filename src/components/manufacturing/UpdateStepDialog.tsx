
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ManufacturingOrderStep } from '@/hooks/useManufacturingSteps';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useUpdateManufacturingStep } from '@/hooks/useUpdateManufacturingStep';
import { useWorkers } from '@/hooks/useWorkers';
import { useToast } from '@/hooks/use-toast';

interface UpdateStepDialogProps {
  step: ManufacturingOrderStep | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStepUpdate?: () => void;
}

const UpdateStepDialog: React.FC<UpdateStepDialogProps> = ({
  step,
  open,
  onOpenChange,
  onStepUpdate
}) => {
  const { stepFields } = useManufacturingSteps();
  const { updateStep } = useUpdateManufacturingStep();
  const { workers } = useWorkers();
  const { toast } = useToast();
  
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [status, setStatus] = useState('');
  const [assignedWorker, setAssignedWorker] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current step fields that match this step
  const currentStepFields = stepFields.filter(field => {
    return step && field.step_name === step.step_name;
  });

  // Initialize form values when step changes
  useEffect(() => {
    if (step && open) {
      // Initialize field values
      const initialValues: Record<string, any> = {};
      
      currentStepFields.forEach(field => {
        initialValues[field.field_key] = '';
      });
      
      setFieldValues(initialValues);
      setStatus(step.status || '');
      setAssignedWorker(step.assigned_worker || '');
      setDueDate(step.due_date ? new Date(step.due_date) : undefined);
      setNotes(step.notes || '');
    }
  }, [step, open, currentStepFields.length]);

  const handleFieldChange = (fieldKey: string, value: any) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!step) return;
    
    setIsSubmitting(true);

    try {
      await updateStep({
        stepId: step.id,
        fieldValues,
        status: status as any,
        assigned_worker: assignedWorker || undefined,
        dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
        notes,
        stepName: step.step_name,
        orderNumber: 'Unknown' // This would need to be passed in properly
      });

      toast({
        title: 'Success',
        description: 'Step updated successfully',
      });

      onStepUpdate?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update step',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    const value = fieldValues[field.field_key] || '';

    // Render as simple text input since we don't have field_type
    return (
      <Input
        value={value}
        onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
        placeholder={`Enter ${field.field_key.replace('_', ' ')}`}
      />
    );
  };

  if (!step) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Step: {step.step_name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assigned Worker */}
          <div className="space-y-2">
            <Label htmlFor="assignedWorker">Assigned Worker</Label>
            <Select value={assignedWorker} onValueChange={setAssignedWorker}>
              <SelectTrigger>
                <SelectValue placeholder="Select worker" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {workers.map(worker => (
                  <SelectItem key={worker.id} value={worker.id}>
                    {worker.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date</Label>
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
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Step Fields */}
          {currentStepFields.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Step Configuration</h4>
              {currentStepFields.map(field => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.field_key}>
                    {field.field_key.replace('_', ' ')}
                    {field.is_visible && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                    {field.unit && (
                      <span className="text-muted-foreground text-sm ml-1">({field.unit})</span>
                    )}
                  </Label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this step..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Step'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStepDialog;
