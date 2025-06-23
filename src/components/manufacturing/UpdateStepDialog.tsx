
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, User, Clock, Package, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ManufacturingOrderStep } from '@/hooks/useManufacturingSteps';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useUpdateManufacturingStep } from '@/hooks/useUpdateManufacturingStep';
import { useWorkers } from '@/hooks/useWorkers';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      console.log('Initializing form with step:', step);
      
      // Initialize field values with current database values
      const initialValues: Record<string, any> = {};
      
      currentStepFields.forEach(field => {
        // Check if the step has the field value directly from database
        switch (field.field_key) {
          case 'quantity_assigned':
            initialValues[field.field_key] = step.quantity_assigned || '';
            break;
          case 'quantity_received':
            initialValues[field.field_key] = step.quantity_received || '';
            break;
          case 'weight_assigned':
            initialValues[field.field_key] = step.weight_assigned || '';
            break;
          case 'weight_received':
            initialValues[field.field_key] = step.weight_received || '';
            break;
          case 'purity':
            initialValues[field.field_key] = step.purity || '';
            break;
          case 'wastage':
            initialValues[field.field_key] = step.wastage || '';
            break;
          default:
            initialValues[field.field_key] = '';
        }
      });
      
      console.log('Initial field values:', initialValues);
      
      setFieldValues(initialValues);
      setStatus(step.status || '');
      setAssignedWorker(step.assigned_worker || '');
      setDueDate(step.due_date ? new Date(step.due_date) : undefined);
      setNotes(step.notes || '');
    }
  }, [step, open, currentStepFields.length]);

  const handleFieldChange = (fieldKey: string, value: any) => {
    console.log('Field changed:', fieldKey, '=', value);
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
      console.log('Submitting update with field values:', fieldValues);
      
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
      console.error('Error updating step:', error);
      toast({
        title: 'Error',
        description: 'Failed to update step',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderField = (field: any) => {
    const value = fieldValues[field.field_key] || '';

    return (
      <div key={field.id} className="space-y-1">
        <Label htmlFor={field.field_key} className="text-xs font-medium text-gray-600">
          {field.field_key.replace('_', ' ')}
          {field.is_visible && <span className="text-red-500 ml-1">*</span>}
          {field.unit && <span className="text-gray-400 ml-1">({field.unit})</span>}
        </Label>
        <Input
          id={field.field_key}
          value={value}
          onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
          placeholder={`Enter ${field.field_key.replace('_', ' ')}`}
          type={field.field_key.includes('quantity') || field.field_key.includes('weight') || field.field_key.includes('purity') || field.field_key.includes('wastage') ? 'number' : 'text'}
          step={field.field_key.includes('quantity') || field.field_key.includes('weight') || field.field_key.includes('purity') || field.field_key.includes('wastage') ? '0.01' : undefined}
          className="h-8 text-sm"
        />
      </div>
    );
  };

  if (!step) return null;

  const getWorkerName = (workerId: string | null) => {
    if (!workerId || workerId === 'unassigned') return 'Unassigned';
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : 'Unknown Worker';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5 text-blue-600" />
              Update Step
            </DialogTitle>
            <Badge className={`text-xs ${getStatusColor(step.status)}`}>
              {step.status?.replace('_', ' ')}
            </Badge>
          </div>
          <div className="text-sm text-gray-600">
            {step.step_name}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Controls in a compact grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Status */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-8 text-sm">
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
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600">
                <User className="h-3 w-3 inline mr-1" />
                Assigned Worker
              </Label>
              <Select value={assignedWorker} onValueChange={setAssignedWorker}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select worker" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {workers.map(worker => (
                    <SelectItem key={worker.id} value={worker.id}>
                      {worker.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-600">
              <Clock className="h-3 w-3 inline mr-1" />
              Due Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-8 text-sm",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
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

          {/* Step Configuration Fields in 2x2 Grid */}
          {currentStepFields.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  Step Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3">
                  {currentStepFields.map(field => renderField(field))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="notes" className="text-xs font-medium text-gray-600">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this step..."
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-8 px-4 text-sm"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="h-8 px-4 text-sm"
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
