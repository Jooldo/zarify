
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
  
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (currentOrderStep && stepFields.length > 0) {
      const initialValues: Record<string, any> = {};
      
      stepFields.forEach(field => {
        const savedValue = getStepValue(currentOrderStep.id, field.field_id);
        if (savedValue) {
          try {
            initialValues[field.field_id] = field.field_type === 'worker' || field.field_type === 'text' || field.field_type === 'number' 
              ? savedValue 
              : JSON.parse(savedValue);
          } catch {
            initialValues[field.field_id] = savedValue;
          }
        }
      });

      setFieldValues(initialValues);
      setStatus(currentOrderStep.status);
      setProgress(currentOrderStep.progress_percentage || 0);
    }
  }, [currentOrderStep, stepFields, getStepValue]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = () => {
    if (!currentOrderStep) return;

    updateStep({
      stepId: currentOrderStep.id,
      fieldValues,
      status,
      progress
    });

    onOpenChange(false);
  };

  const renderField = (field: ManufacturingStepField) => {
    const value = fieldValues[field.field_id] || '';

    switch (field.field_type) {
      case 'worker':
        return (
          <Select value={value} onValueChange={(val) => handleFieldChange(field.field_id, val)}>
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
            onChange={(e) => handleFieldChange(field.field_id, e.target.value)}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
          />
        );
      case 'text':
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.field_id, e.target.value)}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
          />
        );
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.field_id, e.target.value)}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
          />
        );
    }
  };

  if (!stepData || !currentOrderStep) return null;

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
                <Select value={status} onValueChange={setStatus}>
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
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                  />
                  <Progress value={progress} className="h-2" />
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
          {previousSteps.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Previous Steps</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Step</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Worker</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previousSteps.map(step => (
                    <TableRow key={step.id}>
                      <TableCell className="font-medium">
                        {step.manufacturing_steps?.step_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          step.status === 'completed' ? 'default' :
                          step.status === 'in_progress' ? 'secondary' : 'outline'
                        }>
                          {step.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{step.workers?.name || 'Not assigned'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={step.progress_percentage || 0} className="h-2 w-16" />
                          <span className="text-xs">{step.progress_percentage || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {step.completed_at ? new Date(step.completed_at).toLocaleDateString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
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
