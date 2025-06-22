
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit3, Save, X, Play } from 'lucide-react';
import { format } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';
import { useStepDetailsData } from '@/hooks/useStepDetailsData';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useUpdateManufacturingStep } from '@/hooks/useUpdateManufacturingStep';
import { useCreateManufacturingStep } from '@/hooks/useCreateManufacturingStep';
import { useWorkers } from '@/hooks/useWorkers';
import { StepDebugLogger } from './debug/StepDebugLogger';
import { PreviousStepsDisplay } from './PreviousStepsDisplay';

interface StepDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: Tables<'manufacturing_order_steps'> | null;
}

type StepStatus = 'pending' | 'in_progress' | 'completed' | 'partially_completed';

const StepDetailsDialog: React.FC<StepDetailsDialogProps> = ({ open, onOpenChange, step }) => {
  const {
    order,
    currentStepDefinition,
    currentStepValues,
    previousStepsData,
    isLoading
  } = useStepDetailsData(step);

  const { orderSteps, stepFields, manufacturingSteps } = useManufacturingSteps();
  const { stepValues, getStepValue } = useManufacturingStepValues();
  const { updateStep, isUpdating } = useUpdateManufacturingStep();
  const { createStep } = useCreateManufacturingStep();
  const { workers } = useWorkers();

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    status: 'pending' as StepStatus,
    fieldValues: {} as Record<string, any>
  });

  // Get current step fields for this step
  const currentStepFields = step ? stepFields.filter(field => 
    field.manufacturing_step_id === step.manufacturing_step_id
  ) : [];

  // Initialize edit form data when dialog opens or step changes
  useEffect(() => {
    if (open && step) {
      const initialFieldValues: Record<string, any> = {};
      if (currentStepFields.length > 0) {
        currentStepFields.forEach(field => {
          const savedValue = getStepValue(step.id, field.field_id);
          initialFieldValues[field.field_id] = savedValue || '';
        });
      }

      setEditFormData({
        status: step.status as StepStatus,
        fieldValues: initialFieldValues
      });
    }
  }, [open, step?.id, currentStepFields, getStepValue]);

  // Reset edit mode when dialog closes
  useEffect(() => {
    if (!open) {
      setIsEditMode(false);
    }
  }, [open]);

  const handleFieldValueChange = (fieldId: string, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      fieldValues: {
        ...prev.fieldValues,
        [fieldId]: value
      }
    }));
  };

  const handleStatusChange = (value: string) => {
    setEditFormData(prev => ({
      ...prev,
      status: value as StepStatus
    }));
  };

  const handleSaveChanges = async () => {
    if (!step) return;

    const getProgressValue = (status: StepStatus): number => {
      switch (status) {
        case 'completed': return 100;
        case 'in_progress': return 50;
        case 'partially_completed': return 75;
        case 'pending':
        default: return 0;
      }
    };

    const progressValue = getProgressValue(editFormData.status);

    await updateStep({
      stepId: step.id,
      fieldValues: editFormData.fieldValues,
      status: editFormData.status,
      progress: progressValue,
      stepName: currentStepDefinition?.step_name,
      orderNumber: order?.order_number
    });

    setIsEditMode(false);
  };

  const handleStartNextStep = async () => {
    if (!step || !order) return;

    const currentStepOrder = step.step_order;
    const nextStep = manufacturingSteps.find(ms => 
      ms.step_order === currentStepOrder + 1 && ms.is_active
    );

    if (!nextStep) {
      console.log('No next step found');
      return;
    }

    const existingNextStep = orderSteps.find(os => 
      os.manufacturing_order_id === order.id && 
      os.manufacturing_step_id === nextStep.id
    );

    if (existingNextStep) {
      console.log('Next step already exists');
      return;
    }

    await createStep({
      manufacturingOrderId: order.id,
      stepId: nextStep.id,
      fieldValues: {}
    });
  };

  const renderEditableField = (field: any) => {
    const value = editFormData.fieldValues[field.field_id] || '';

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

  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : 'Unknown Worker';
  };

  const getStepStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'skipped': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!step || !order) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                Step Details: {currentStepDefinition?.step_name || 'Unknown Step'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                Order #{order.order_number} - {order.product_name}
              </DialogDescription>
            </div>
            <Badge className={`${getStepStatusColor(step.status)}`}>
              {step.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Action Buttons - Always Visible */}
          <div className="flex gap-3 p-4 bg-gray-50 rounded-lg border">
            {!isEditMode ? (
              <>
                <Button
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-2"
                  variant="default"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Step Details
                </Button>
                <Button
                  onClick={handleStartNextStep}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Play className="h-4 w-4" />
                  Start Next Step
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleSaveChanges}
                  disabled={isUpdating}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditMode(false)}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            )}
          </div>

          {/* Current Step Configuration */}
          <Card className="border-2 border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Current Step Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditMode ? (
                <>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Select value={editFormData.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="partially_completed">Partially Completed (QC Failed)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {currentStepFields.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Configure Step Fields</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentStepFields.map(field => (
                          <div key={field.id} className="space-y-2">
                            <Label className="text-sm font-medium">
                              {field.field_label}
                              {field.field_options?.unit && ` (${field.field_options.unit})`}
                              {field.is_required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            {renderEditableField(field)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Display current step information */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Progress:</span>
                      <span className="ml-2 font-medium">{step.progress_percentage || 0}%</span>
                    </div>
                    
                    {step.assigned_worker_id && (
                      <div>
                        <span className="text-sm text-muted-foreground">Assigned Worker:</span>
                        <span className="ml-2 font-medium">{getWorkerName(step.assigned_worker_id)}</span>
                      </div>
                    )}

                    {step.started_at && (
                      <div>
                        <span className="text-sm text-muted-foreground">Started:</span>
                        <span className="ml-2 font-medium">{format(new Date(step.started_at), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                    )}

                    {step.completed_at && (
                      <div>
                        <span className="text-sm text-muted-foreground">Completed:</span>
                        <span className="ml-2 font-medium">{format(new Date(step.completed_at), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                    )}
                  </div>

                  {/* Current Step Field Values */}
                  {currentStepValues.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Current Field Values</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentStepValues.map((value, index) => (
                          <div key={index} className="bg-muted/50 p-3 rounded">
                            <span className="text-sm text-muted-foreground block">{value.label}:</span>
                            <span className="font-medium">
                              {value.value}
                              {value.unit && ` ${value.unit}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Previous Steps Data */}
          {!isEditMode && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <PreviousStepsDisplay
                previousStepsData={previousStepsData}
                orderNumber={order.order_number}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} size="sm">Close</Button>
        </DialogFooter>

        <StepDebugLogger open={open} order={order} step={step} />
      </DialogContent>
    </Dialog>
  );
};

export default StepDetailsDialog;
