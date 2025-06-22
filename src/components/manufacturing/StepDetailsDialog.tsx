
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Workflow, Edit3, Save, X, Play } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tables } from '@/integrations/supabase/types';
import { useStepDetailsData } from '@/hooks/useStepDetailsData';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useUpdateManufacturingStep } from '@/hooks/useUpdateManufacturingStep';
import { useCreateManufacturingStep } from '@/hooks/useCreateManufacturingStep';
import { useWorkers } from '@/hooks/useWorkers';
import { StepDebugLogger } from './debug/StepDebugLogger';
import { PreviousStepsDisplay } from './PreviousStepsDisplay';
import { CurrentStepDisplay } from './CurrentStepDisplay';

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

  const [dueDate, setDueDate] = useState<Date | undefined>(
    order?.due_date ? new Date(order.due_date) : undefined
  );
  
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
    if (open && step && currentStepFields.length > 0) {
      const initialFieldValues: Record<string, any> = {};
      currentStepFields.forEach(field => {
        const savedValue = getStepValue(step.id, field.field_id);
        initialFieldValues[field.field_id] = savedValue || '';
      });

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
      setEditFormData({
        status: 'pending',
        fieldValues: {}
      });
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

    // Calculate progress value based on status
    const getProgressValue = (status: StepStatus): number => {
      switch (status) {
        case 'completed':
          return 100;
        case 'in_progress':
          return 50;
        case 'partially_completed':
          return 75;
        case 'pending':
        default:
          return 0;
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

    // Check if next step already exists for this order
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
      manufacturing_step_id: nextStep.id,
      stepOrder: nextStep.step_order,
      status: 'pending'
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

  if (!step || !order) {
    return null;
  }

  const getAllConfiguredFields = () => {
    const allFields = new Map();
    
    // Get all previous steps for this order
    const allOrderStepsForOrder = orderSteps.filter(os => String(os.manufacturing_order_id) === String(order.id));
    
    allOrderStepsForOrder.forEach(orderStep => {
      if (orderStep.manufacturing_steps?.id) {
        const stepFieldsForStep = stepFields.filter(field => 
          field.manufacturing_step_id === orderStep.manufacturing_steps?.id
        );
        
        stepFieldsForStep.forEach(field => {
          if (!['worker'].includes(field.field_type)) {
            allFields.set(field.field_id, {
              id: field.field_id,
              label: field.field_label,
              type: field.field_type,
              unit: field.field_options?.unit
            });
          }
        });
      }
    });
    
    return Array.from(allFields.values());
  };

  const getFieldValue = (fieldId: string, values: any[]) => {
    const value = values.find(v => v.field_id === fieldId);
    return value?.field_value || '-';
  };

  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : 'Unknown Worker';
  };

  const getDisplayValue = (field: any, fieldValue: string) => {
    if (field.field_type === 'worker' && fieldValue && fieldValue !== '-') {
      return getWorkerName(fieldValue);
    }
    return fieldValue;
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

  const orderStepsWithData = orderSteps
    .filter(orderStep => orderStep.manufacturing_order_id === order.id)
    .sort((a, b) => (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0))
    .map(orderStep => {
      const stepStepFields = stepFields.filter(field => 
        field.manufacturing_step_id === orderStep.manufacturing_step_id
      );
      
      const stepStepValues = stepValues.filter(value => 
        value.manufacturing_order_step_id === orderStep.id
      );

      return {
        ...orderStep,
        fields: stepStepFields,
        values: stepStepValues
      };
    });

  const allConfiguredFields = getAllConfiguredFields();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg">Step Details: {currentStepDefinition?.step_name}</DialogTitle>
              <DialogDescription className="text-sm">
                Order #{order.order_number} - {order.product_name}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {!isEditMode ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditMode(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Step
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleStartNextStep}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Start Next Step
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    onClick={handleSaveChanges}
                    disabled={isUpdating}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isUpdating ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
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
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {/* Current Step Configuration - Editable when in edit mode */}
          {isEditMode ? (
            <Card className="border-2 border-blue-200 bg-blue-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Edit Current Step</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <Select value={editFormData.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
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
                    <h4 className="font-medium">Configure Fields</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentStepFields.map(field => (
                        <div key={field.id} className="space-y-2">
                          <Label>
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
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Due Date Section - More Compact */}
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-base mb-2">Due Date Management</h4>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium">Current:</label>
                    <span className="text-xs text-gray-600">
                      {order.due_date ? format(new Date(order.due_date), 'MMM dd, yyyy') : 'Not set'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium">Update:</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "w-[180px] justify-start text-left font-normal text-xs",
                            !dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {dueDate ? format(dueDate, "MMM dd, yyyy") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          initialFocus
                          className="p-3"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button onClick={() => console.log('Save due date:', dueDate)} size="sm" className="text-xs">
                    Save Due Date
                  </Button>
                </div>
              </div>

              {/* All Manufacturing Steps Progress - More Compact */}
              {orderStepsWithData.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Workflow className="h-4 w-4" />
                      All Manufacturing Steps Configuration Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {orderStepsWithData.map((orderStep, index) => (
                      <div key={orderStep.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                              {orderStep.manufacturing_steps?.step_order}
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{orderStep.manufacturing_steps?.step_name}</h4>
                              {orderStep.manufacturing_steps?.description && (
                                <p className="text-xs text-muted-foreground">{orderStep.manufacturing_steps.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${getStepStatusColor(orderStep.status)}`}>
                              {orderStep.status.replace('_', ' ')}
                            </Badge>
                            {orderStep.progress_percentage !== null && (
                              <span className="text-xs font-medium">{orderStep.progress_percentage}%</span>
                            )}
                          </div>
                        </div>

                        {/* Step timing info - More Compact */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-2 text-xs">
                          {orderStep.started_at && (
                            <div>
                              <span className="text-muted-foreground">Started:</span>
                              <p className="font-medium">{format(new Date(orderStep.started_at), 'MMM dd, HH:mm')}</p>
                            </div>
                          )}
                          {orderStep.completed_at && (
                            <div>
                              <span className="text-muted-foreground">Completed:</span>
                              <p className="font-medium">{format(new Date(orderStep.completed_at), 'MMM dd, HH:mm')}</p>
                            </div>
                          )}
                          {orderStep.assigned_worker_id && (
                            <div>
                              <span className="text-muted-foreground">Assigned Worker:</span>
                              <p className="font-medium">{getWorkerName(orderStep.assigned_worker_id)}</p>
                            </div>
                          )}
                        </div>

                        {/* Step field data - More Compact */}
                        {orderStep.fields.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-1 text-xs">Step Data:</h5>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {orderStep.fields.map((field) => {
                                const fieldValue = getFieldValue(field.field_id, orderStep.values);
                                const displayValue = getDisplayValue(field, fieldValue);
                                
                                return (
                                  <div key={field.id} className="bg-muted/50 p-2 rounded text-xs">
                                    <span className="text-muted-foreground block">{field.field_label}:</span>
                                    <span className="font-medium">
                                      {displayValue}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Notes - More Compact */}
                        {orderStep.notes && (
                          <div className="mt-2 pt-2 border-t">
                            <span className="text-xs text-muted-foreground">Notes:</span>
                            <p className="text-xs">{orderStep.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Previous Steps Data - More Compact */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <PreviousStepsDisplay
                  previousStepsData={previousStepsData}
                  orderNumber={order.order_number}
                  isLoading={isLoading}
                />
              </div>
              
              {/* Current Step Inputs - More Compact */}
              <div className="pt-2 border-t">
                <h4 className="font-semibold text-base mb-2">Current Step Configuration</h4>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <CurrentStepDisplay
                    currentStepValues={currentStepValues}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} size="sm">Close</Button>
        </DialogFooter>

        <StepDebugLogger open={open} order={order} step={step} />
      </DialogContent>
    </Dialog>
  );
};

export default StepDetailsDialog;
