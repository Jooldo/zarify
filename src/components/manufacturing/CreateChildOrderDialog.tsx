import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useWorkers } from '@/hooks/useWorkers';
import { supabase } from '@/integrations/supabase/client';

interface CreateChildOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parentOrder: any;
  currentStep: any;
  onSuccess: () => void;
  parentOrderStep?: any;
}

const CreateChildOrderDialog = ({ 
  isOpen, 
  onClose, 
  parentOrder, 
  currentStep, 
  onSuccess,
  parentOrderStep 
}: CreateChildOrderDialogProps) => {
  const { toast } = useToast();
  const { manufacturingSteps, getStepFields } = useManufacturingSteps();
  const { getStepValue } = useManufacturingStepValues();
  const { workers } = useWorkers();
  const [selectedStepId, setSelectedStepId] = useState<string>('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  // Include current step and previous steps for reassignment
  const availableSteps = manufacturingSteps.filter(step => {
    if (!currentStep || !step.step_order || !currentStep.step_order) {
      return false;
    }
    return step.step_order <= currentStep.step_order && step.is_active;
  });

  const selectedStep = manufacturingSteps.find(step => step.id === selectedStepId);
  const stepFields = selectedStepId ? getStepFields(selectedStepId) : [];

  // Get current step fields and their values for display
  const currentStepFields = currentStep ? getStepFields(currentStep.id) : [];
  const getCurrentStepFieldValue = (fieldId: string) => {
    if (parentOrderStep) {
      return getStepValue(parentOrderStep.id, fieldId);
    }
    return null;
  };

  // Get worker name from worker ID
  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : 'Unknown Worker';
  };

  const handleStepSelection = (stepId: string) => {
    setSelectedStepId(stepId);
    setFieldValues({});
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleCreateChildOrder = async () => {
    if (!selectedStepId) {
      toast({
        title: 'Error',
        description: 'Please select a step for reassignment',
        variant: 'destructive',
      });
      return;
    }

    // Validate required fields
    const requiredFields = stepFields.filter(field => field.is_required);
    for (const field of requiredFields) {
      if (!fieldValues[field.field_id] || fieldValues[field.field_id].trim() === '') {
        toast({
          title: 'Error',
          description: `${field.field_label} is required`,
          variant: 'destructive',
        });
        return;
      }
    }

    setIsCreating(true);

    try {
      // Get next child order number
      const { data: childOrderNumber, error: orderNumberError } = await supabase
        .rpc('get_next_manufacturing_order_number');

      if (orderNumberError) throw orderNumberError;

      // Create child manufacturing order - use correct column names that exist in database
      const { data: childOrder, error: childOrderError } = await supabase
        .from('manufacturing_orders')
        .insert({
          order_number: `${childOrderNumber}-R`, // R for Rework
          product_name: parentOrder.product_name,
          product_config_id: parentOrder.product_config_id,
          quantity_required: parentOrder.quantity_required,
          priority: 'high', // Rework orders get high priority
          status: 'pending',
          due_date: parentOrder.due_date,
          special_instructions: `Rework from ${parentOrder.order_number || 'Unknown Order'} - Step ${currentStep?.step_name || 'Unknown'}`,
          merchant_id: parentOrder.merchant_id,
          parent_order_id: parentOrder.id,
          assigned_to_step: selectedStep?.step_order
        })
        .select()
        .single();

      if (childOrderError) throw childOrderError;

      // Create the manufacturing order step for the selected step
      const { error: stepError } = await supabase
        .from('manufacturing_order_steps')
        .insert({
          manufacturing_order_id: childOrder.id,
          manufacturing_step_id: selectedStepId,
          step_order: selectedStep?.step_order || 1,
          status: 'pending',
          merchant_id: parentOrder.merchant_id
        });

      if (stepError) throw stepError;

      // Save field values if any
      if (Object.keys(fieldValues).length > 0) {
        const stepValueInserts = Object.entries(fieldValues).map(([fieldId, value]) => ({
          manufacturing_order_step_id: childOrder.id,
          field_id: fieldId,
          field_value: value,
          merchant_id: parentOrder.merchant_id
        }));

        const { error: valuesError } = await supabase
          .from('manufacturing_order_step_values')
          .insert(stepValueInserts);

        if (valuesError) throw valuesError;
      }

      toast({
        title: 'Success',
        description: `Child order ${childOrder.order_number} created successfully`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating child order:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create child order',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setSelectedStepId('');
    setFieldValues({});
    onClose();
  };

  const renderField = (field: any) => {
    const value = fieldValues[field.field_id] || '';

    switch (field.field_type) {
      case 'worker':
        return (
          <Select 
            value={value} 
            onValueChange={(val) => handleFieldChange(field.field_id, val)}
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
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => handleFieldChange(field.field_id, date ? date.toISOString().split('T')[0] : '')}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
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
      case 'select':
        if (field.field_options?.options) {
          return (
            <Select 
              value={value} 
              onValueChange={(val) => handleFieldChange(field.field_id, val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.field_label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.field_options.options.map((option: string) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
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

  // Don't render if currentStep is null or invalid
  if (!currentStep) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Rework Child Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Step Information */}
          <div className="space-y-3 border rounded-lg p-4 bg-amber-50 border-amber-200">
            <h4 className="font-semibold text-amber-800">Current Step Information</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-amber-700">Step:</span>
                <span className="text-sm text-amber-900">{currentStep.step_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-amber-700">Order:</span>
                <span className="text-sm text-amber-900">#{currentStep.step_order}</span>
              </div>
              
              {/* Current Step Field Values */}
              {currentStepFields.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-amber-200">
                  <span className="text-sm font-medium text-amber-700">Configured Fields:</span>
                  {currentStepFields.map(field => {
                    const fieldValue = getCurrentStepFieldValue(field.field_id);
                    let displayValue = fieldValue || 'Not set';
                    
                    // Format worker field value
                    if (field.field_type === 'worker' && fieldValue) {
                      displayValue = getWorkerName(fieldValue);
                    }
                    
                    return (
                      <div key={field.field_id} className="flex items-center justify-between text-xs">
                        <span className="text-amber-600">
                          {field.field_label}
                          {field.field_options?.unit && ` (${field.field_options.unit})`}:
                        </span>
                        <span className={`font-medium ${fieldValue ? 'text-amber-900' : 'text-amber-500 italic'}`}>
                          {displayValue}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="step-select">Reassign to Step</Label>
            <Select value={selectedStepId} onValueChange={handleStepSelection}>
              <SelectTrigger>
                <SelectValue placeholder="Select step for rework" />
              </SelectTrigger>
              <SelectContent>
                {availableSteps.map(step => (
                  <SelectItem key={step.id} value={step.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>Step {step.step_order}: {step.step_name}</span>
                      {step.id === currentStep.id && (
                        <Badge variant="secondary" className="ml-2 text-xs">Current</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableSteps.length === 0 && (
              <p className="text-sm text-amber-600 mt-1">
                No steps available for rework assignment
              </p>
            )}
          </div>

          {/* Step Configuration Fields */}
          {selectedStepId && stepFields.length > 0 && (
            <div className="space-y-3 border-t pt-4">
              <Label className="text-base font-semibold">Step Configuration Fields</Label>
              <div className="space-y-3">
                {stepFields.map(field => (
                  <div key={field.field_id} className="space-y-2">
                    <Label htmlFor={field.field_id}>
                      {field.field_label}
                      {field.field_options?.unit && ` (${field.field_options.unit})`}
                      {field.is_required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleCreateChildOrder} 
              disabled={isCreating || !selectedStepId}
              className="flex-1"
            >
              {isCreating ? 'Creating...' : 'Create Rework Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChildOrderDialog;
