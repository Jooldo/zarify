
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { supabase } from '@/integrations/supabase/client';

interface CreateChildOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parentOrder: any;
  currentStep: any;
  onSuccess: () => void;
}

const CreateChildOrderDialog = ({ isOpen, onClose, parentOrder, currentStep, onSuccess }: CreateChildOrderDialogProps) => {
  const { toast } = useToast();
  const { manufacturingSteps, getStepFields } = useManufacturingSteps();
  const [selectedStepId, setSelectedStepId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  // Get available steps (only steps with order less than current step)
  // Add null check for currentStep
  const availableSteps = manufacturingSteps.filter(step => 
    currentStep && step.step_order < currentStep.step_order && step.is_active
  );

  const selectedStep = manufacturingSteps.find(step => step.id === selectedStepId);
  const stepFields = selectedStepId ? getStepFields(selectedStepId) : [];

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
    if (!selectedStepId || quantity <= 0) {
      toast({
        title: 'Error',
        description: 'Please select a step and enter a valid quantity',
        variant: 'destructive',
      });
      return;
    }

    if (!parentOrder || quantity > parentOrder.quantity_required) {
      toast({
        title: 'Error',
        description: 'Child order quantity cannot exceed parent order quantity',
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

      // Create child manufacturing order
      const { data: childOrder, error: childOrderError } = await supabase
        .from('manufacturing_orders')
        .insert({
          order_number: `${childOrderNumber}-R`, // R for Rework
          product_name: parentOrder.product_name,
          product_config_id: parentOrder.product_config_id,
          quantity_required: quantity,
          priority: 'high', // Rework orders get high priority
          status: 'pending',
          due_date: parentOrder.due_date,
          special_instructions: `Rework from ${parentOrder.order_number} - Step ${currentStep?.step_name || 'Unknown'}`,
          merchant_id: parentOrder.merchant_id,
          parent_order_id: parentOrder.id,
          rework_from_step: currentStep?.step_order,
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
    setQuantity(0);
    setFieldValues({});
    onClose();
  };

  // Don't render if currentStep is null
  if (!currentStep) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Rework Child Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Parent Order:</strong> {parentOrder?.order_number}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Current Step:</strong> {currentStep?.step_name}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Available Quantity:</strong> {parentOrder?.quantity_required}
            </p>
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
                    Step {step.step_order}: {step.step_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity">Quantity for Rework</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              max={parentOrder?.quantity_required}
              min={1}
              placeholder="Enter quantity"
            />
          </div>

          {stepFields.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Step Configuration Fields</Label>
              {stepFields.map(field => (
                <div key={field.field_id}>
                  <Label htmlFor={field.field_id}>
                    {field.field_label}
                    {field.is_required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  
                  {field.field_type === 'select' && field.field_options?.options ? (
                    <Select 
                      value={fieldValues[field.field_id] || ''} 
                      onValueChange={(value) => handleFieldChange(field.field_id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.field_label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.field_options.options.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={field.field_id}
                      type={field.field_type === 'number' ? 'number' : 'text'}
                      value={fieldValues[field.field_id] || ''}
                      onChange={(e) => handleFieldChange(field.field_id, e.target.value)}
                      placeholder={`Enter ${field.field_label.toLowerCase()}`}
                    />
                  )}
                  
                  {field.field_options?.unit && (
                    <p className="text-xs text-gray-500 mt-1">Unit: {field.field_options.unit}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleCreateChildOrder} 
              disabled={isCreating || !selectedStepId || quantity <= 0}
              className="flex-1"
            >
              {isCreating ? 'Creating...' : 'Create Child Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChildOrderDialog;
