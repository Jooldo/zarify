
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, Package, Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { StepCardData } from './ManufacturingStepCard';
import { ManufacturingStepField, ManufacturingOrderStep } from '@/hooks/useManufacturingSteps';
import { useWorkers } from '@/hooks/useWorkers';
import { useUpdateManufacturingStep } from '@/hooks/useUpdateManufacturingStep';
import { useToast } from '@/hooks/use-toast';

interface UpdateStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stepData: StepCardData | null;
  currentOrderStep: ManufacturingOrderStep | null;
  stepFields: ManufacturingStepField[];
  previousSteps: ManufacturingOrderStep[];
}

const UpdateStepDialog: React.FC<UpdateStepDialogProps> = ({
  open,
  onOpenChange,
  stepData,
  currentOrderStep,
  stepFields,
  previousSteps,
}) => {
  const { workers } = useWorkers();
  const { updateStep, isUpdating } = useUpdateManufacturingStep();
  const { toast } = useToast();

  // Initialize form state
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const [assignedWorker, setAssignedWorker] = useState('');
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');

  // Initialize form when dialog opens and data is available
  useEffect(() => {
    if (open && stepData && currentOrderStep) {
      console.log('Initializing UpdateStepDialog form');
      
      // Initialize basic fields
      setStatus(currentOrderStep.status || 'pending');
      setAssignedWorker(currentOrderStep.assigned_worker_id || '');
      setProgress(currentOrderStep.progress_percentage || 0);
      setNotes(currentOrderStep.notes || '');
      
      // Initialize custom field values
      const initialValues: Record<string, string> = {};
      stepFields.forEach(field => {
        initialValues[field.field_id] = ''; // Default empty, will be populated from server if available
      });
      setFormValues(initialValues);
    }
  }, [open, stepData, currentOrderStep, stepFields]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormValues({});
      setStatus('');
      setAssignedWorker('');
      setProgress(0);
      setNotes('');
    }
  }, [open]);

  const handleFieldChange = useCallback((fieldId: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentOrderStep || !stepData) {
      toast({
        title: 'Error',
        description: 'Missing step data',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateStep({
        stepId: currentOrderStep.id,
        status,
        assignedWorkerId: assignedWorker || null,
        progressPercentage: progress,
        notes: notes || null,
        fieldValues: formValues,
      });

      toast({
        title: 'Success',
        description: 'Step updated successfully',
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating step:', error);
      toast({
        title: 'Error',
        description: 'Failed to update step',
        variant: 'destructive',
      });
    }
  }, [currentOrderStep, stepData, status, assignedWorker, progress, notes, formValues, updateStep, toast, onOpenChange]);

  if (!stepData || !currentOrderStep) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Manufacturing Step</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Step Information */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{stepData.stepName}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary">Step {stepData.stepOrder}</Badge>
                  <Badge className={getStatusColor(status)}>
                    {status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {stepData.qcRequired && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      QC Required
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span>{stepData.orderNumber} - {stepData.productName}</span>
                </div>
                
                {stepData.dueDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Due: {format(new Date(stepData.dueDate), 'MMM dd, yyyy')}</span>
                  </div>
                )}

                {stepData.estimatedDuration && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Est. Duration: {stepData.estimatedDuration}h</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Previous Steps */}
            {previousSteps.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Previous Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {previousSteps.map((step, index) => (
                      <div key={step.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Step {step.manufacturing_steps?.step_order}
                          </Badge>
                          <span className="text-sm">{step.manufacturing_steps?.step_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {step.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          )}
                          <Badge className={getStatusColor(step.status || 'pending')} variant="secondary">
                            {(step.status || 'pending').replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Update Form */}
          <div>
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

              {/* Worker Assignment */}
              <div className="space-y-2">
                <Label htmlFor="worker">Assigned Worker</Label>
                <Select value={assignedWorker} onValueChange={setAssignedWorker}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select worker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No worker assigned</SelectItem>
                    {workers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.name} - {worker.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <Label htmlFor="progress">Progress (%)</Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                />
              </div>

              {/* Custom Fields */}
              {stepFields.map((field) => (
                <div key={field.field_id} className="space-y-2">
                  <Label htmlFor={field.field_id}>
                    {field.field_label}
                    {field.is_required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  
                  {field.field_type === 'text' && (
                    <Input
                      id={field.field_id}
                      value={formValues[field.field_id] || ''}
                      onChange={(e) => handleFieldChange(field.field_id, e.target.value)}
                      required={field.is_required}
                    />
                  )}
                  
                  {field.field_type === 'number' && (
                    <Input
                      id={field.field_id}
                      type="number"
                      value={formValues[field.field_id] || ''}
                      onChange={(e) => handleFieldChange(field.field_id, e.target.value)}
                      required={field.is_required}
                    />
                  )}
                  
                  {field.field_type === 'date' && (
                    <Input
                      id={field.field_id}
                      type="date"
                      value={formValues[field.field_id] || ''}
                      onChange={(e) => handleFieldChange(field.field_id, e.target.value)}
                      required={field.is_required}
                    />
                  )}
                  
                  {field.field_type === 'multiselect' && field.field_options && (
                    <Select
                      value={formValues[field.field_id] || ''}
                      onValueChange={(value) => handleFieldChange(field.field_id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(field.field_options) && field.field_options.map((option: string, index: number) => (
                          <SelectItem key={index} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes or comments..."
                  rows={3}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isUpdating} className="flex-1">
                  {isUpdating ? 'Updating...' : 'Update Step'}
                </Button>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStepDialog;
