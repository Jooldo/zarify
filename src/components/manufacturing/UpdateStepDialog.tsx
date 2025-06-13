
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWorkers } from '@/hooks/useWorkers';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useUpdateManufacturingStep } from '@/hooks/useUpdateManufacturingStep';
import { StepCardData } from './ManufacturingStepCard';
import { ManufacturingStepField, ManufacturingOrderStep } from '@/hooks/useManufacturingSteps';

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
  previousSteps
}) => {
  const { workers } = useWorkers();
  const { getStepValue } = useManufacturingStepValues();
  const { updateStep, isUpdating } = useUpdateManufacturingStep();
  
  // Initialize state once when dialog opens
  const [initialized, setInitialized] = useState(false);
  const [formData, setFormData] = useState({
    fieldValues: {} as Record<string, any>,
    status: '',
    progress: 0,
  });

  // Initialize form data only once when dialog opens and we have all required data
  useEffect(() => {
    if (open && currentOrderStep && stepFields.length > 0 && !initialized) {
      console.log('Initializing form data...');
      
      const initialFieldValues: Record<string, any> = {};
      stepFields.forEach(field => {
        const savedValue = getStepValue(currentOrderStep.id, field.field_id);
        initialFieldValues[field.field_id] = savedValue || '';
      });

      setFormData({
        fieldValues: initialFieldValues,
        status: currentOrderStep.status,
        progress: currentOrderStep.progress_percentage || 0,
      });
      
      setInitialized(true);
    }
  }, [open, currentOrderStep?.id, stepFields, getStepValue, initialized]);

  // Reset initialization when dialog closes
  useEffect(() => {
    if (!open) {
      setInitialized(false);
      setFormData({
        fieldValues: {},
        status: '',
        progress: 0,
      });
    }
  }, [open]);

  const handleFieldValueChange = (fieldId: string, value: any) => {
    console.log('Field value changing:', fieldId, value);
    setFormData(prev => ({
      ...prev,
      fieldValues: {
        ...prev.fieldValues,
        [fieldId]: value
      }
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value
    }));
  };

  const handleProgressChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      progress: value
    }));
  };

  const handleSubmit = () => {
    if (!currentOrderStep) return;

    console.log('Submitting form data:', formData);

    updateStep({
      stepId: currentOrderStep.id,
      fieldValues: formData.fieldValues,
      status: formData.status,
      progress: formData.progress
    });

    onOpenChange(false);
  };

  const renderField = (field: ManufacturingStepField) => {
    const value = formData.fieldValues[field.field_id] || '';

    switch (field.field_type) {
      case 'worker':
        return (
          <Select 
            value={value} 
            onValueChange={(val) => handleFieldValueChange(field.field_id, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select worker" />
            </SelectTrigger>
            <SelectContent>
              {workers.map(worker => (
                <SelectItem key={worker.id} value={worker.id}>
                  {worker.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldValueChange(field.field_id, e.target.value)}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
          />
        );
      case 'text':
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleFieldValueChange(field.field_id, e.target.value)}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
          />
        );
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleFieldValueChange(field.field_id, e.target.value)}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
          />
        );
    }
  };

  if (!stepData || !currentOrderStep || !initialized) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update {stepData.stepName} - {stepData.orderNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Step Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Step Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Progress (%)</Label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => handleProgressChange(Number(e.target.value))}
                  />
                  <Progress value={formData.progress} className="h-2" />
                </div>
              </div>
            </div>

            {/* Step Fields */}
            {stepFields.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Step Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stepFields.map(field => (
                    <div key={field.id} className="space-y-2">
                      <Label>
                        {field.field_label}
                        {field.is_required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Previous Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Previous Steps 
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({previousSteps.length} step{previousSteps.length !== 1 ? 's' : ''})
              </span>
            </h3>
            
            {previousSteps.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Step</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Worker</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previousSteps.map(step => (
                      <TableRow key={step.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-medium">
                              {step.manufacturing_steps?.step_name || 'Unknown Step'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Order #{step.manufacturing_steps?.step_order || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            step.status === 'completed' ? 'default' :
                            step.status === 'in_progress' ? 'secondary' : 'outline'
                          }>
                            {step.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {step.workers?.name || 
                             (step.assigned_worker_id ? `Worker ID: ${step.assigned_worker_id}` : 'Not assigned')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={step.progress_percentage || 0} className="h-2 w-16" />
                            <span className="text-xs font-mono">
                              {step.progress_percentage || 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {step.started_at ? new Date(step.started_at).toLocaleDateString() : '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {step.completed_at ? new Date(step.completed_at).toLocaleDateString() : '-'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/30">
                <p>No previous steps found for this manufacturing order.</p>
                <p className="text-sm mt-1">This appears to be the first step in the process.</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end border-t pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Step'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStepDialog;
