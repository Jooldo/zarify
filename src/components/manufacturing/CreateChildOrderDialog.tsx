
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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

      // Create child manufacturing order - use parent's quantity by default
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
          special_instructions: `Rework from ${parentOrder.order_number} - Step ${currentStep?.step_name || 'Unknown'}`,
          merchant_id: parentOrder.merchant_id,
          parent_order_id: parentOrder.id,
          rework_from_step: currentStep?.step_order || 0,
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

      // Create child manufacturing order - use parent's quantity by default
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
          special_instructions: `Rework from ${parentOrder.order_number} - Step ${currentStep?.step_name || 'Unknown'}`,
          merchant_id: parentOrder.merchant_id,
          parent_order_id: parentOrder.id,
          rework_from_step: currentStep?.step_order || 0,
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
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 space-y-3">
            <h4 className="font-semibold text-amber-900">Current Step Information</h4>
            <div className="space-y-2">
              <div>
                <span className="text-amber-700 font-medium">Step Name:</span>
                <div className="text-amber-900 font-semibold">{currentStep?.step_name || 'Unknown Step'}</div>
              </div>
              <div>
                <span className="text-amber-700 font-medium">Step Order:</span>
                <div className="text-amber-900">{currentStep?.step_order || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Current Step Field Values */}
          {currentStepFields.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
              <h4 className="font-semibold text-blue-900">Current Step Field Values</h4>
              <div className="space-y-2">
                {currentStepFields.map(field => {
                  const fieldValue = getCurrentStepFieldValue(field.field_id);
                  let displayValue = fieldValue || 'Not set';
                  
                  // If it's a worker field, show worker name instead of ID
                  if (field.field_type === 'worker' && fieldValue) {
                    displayValue = getWorkerName(fieldValue);
                  }
                  
                  return (
                    <div key={field.field_id} className="flex justify-between items-center text-sm">
                      <span className="text-blue-700 font-medium">
                        {field.field_label}
                        {field.field_options?.unit && ` (${field.field_options.unit})`}:
                      </span>
                      <span className="text-blue-900 font-semibold">
                        {displayValue}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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

          {/* Step Configuration Fields - Only show when step is selected */}
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
