
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useWorkers } from '@/hooks/useWorkers';
import { ArrowRight, GitBranch, Settings } from 'lucide-react';

interface CreateChildOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parentOrder: any;
  currentStep: any;
  parentOrderStep?: any;
  onSuccess: () => void;
}

const CreateChildOrderDialog: React.FC<CreateChildOrderDialogProps> = ({
  isOpen,
  onClose,
  parentOrder,
  currentStep,
  parentOrderStep,
  onSuccess
}) => {
  const { toast } = useToast();
  const { manufacturingSteps, stepFields } = useManufacturingSteps();
  const { workers } = useWorkers();
  const [isCreating, setIsCreating] = useState(false);
  const [reworkReason, setReworkReason] = useState('');
  const [assignedToStep, setAssignedToStep] = useState<number>(1);
  const [selectedStepFields, setSelectedStepFields] = useState<any[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const activeSteps = manufacturingSteps
    .filter(step => step.is_active)
    .sort((a, b) => a.step_order - b.step_order);

  // Update selected step fields when assignedToStep changes
  useEffect(() => {
    console.log('Step changed to:', assignedToStep);
    console.log('Available steps:', activeSteps);
    console.log('All step fields:', stepFields);
    
    const selectedStep = activeSteps.find(step => step.step_order === assignedToStep);
    if (selectedStep) {
      const fields = stepFields.filter(field => field.manufacturing_step_id === selectedStep.id);
      console.log('Fields for selected step:', fields);
      setSelectedStepFields(fields);
      
      // Initialize field values for new step
      const initialValues: Record<string, string> = {};
      fields.forEach(field => {
        initialValues[field.field_id] = '';
      });
      console.log('Initial field values:', initialValues);
      setFieldValues(initialValues);
    } else {
      console.log('No step found for order:', assignedToStep);
      setSelectedStepFields([]);
      setFieldValues({});
    }
  }, [assignedToStep, activeSteps, stepFields]);

  const handleFieldValueChange = (fieldId: string, value: string) => {
    console.log('Updating field:', fieldId, 'with value:', value);
    setFieldValues(prev => {
      const updated = {
        ...prev,
        [fieldId]: value
      };
      console.log('Updated field values:', updated);
      return updated;
    });
  };

  const renderField = (field: any) => {
    const value = fieldValues[field.field_id] || '';
    console.log('Rendering field:', field.field_id, 'with value:', value);

    switch (field.field_type) {
      case 'worker':
        return (
          <Select 
            value={value} 
            onValueChange={(val) => {
              console.log('Worker field changed:', field.field_id, val);
              handleFieldValueChange(field.field_id, val);
            }}
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
            onChange={(e) => {
              console.log('Number field changed:', field.field_id, e.target.value);
              handleFieldValueChange(field.field_id, e.target.value);
            }}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
          />
        );
      case 'text':
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => {
              console.log('Text field changed:', field.field_id, e.target.value);
              handleFieldValueChange(field.field_id, e.target.value);
            }}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => {
              console.log('Date field changed:', field.field_id, e.target.value);
              handleFieldValueChange(field.field_id, e.target.value);
            }}
          />
        );
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => {
              console.log('Default field changed:', field.field_id, e.target.value);
              handleFieldValueChange(field.field_id, e.target.value);
            }}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
          />
        );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with field values:', fieldValues);
    
    if (!parentOrder || !currentStep) {
      toast({
        title: 'Error',
        description: 'Missing parent order or current step information',
        variant: 'destructive',
      });
      return;
    }

    // Validate required fields
    const requiredFields = selectedStepFields.filter(field => field.is_required);
    const missingFields = requiredFields.filter(field => 
      !fieldValues[field.field_id] || fieldValues[field.field_id].trim() === ''
    );
    
    if (missingFields.length > 0) {
      toast({
        title: 'Error',
        description: `Please fill in all required fields: ${missingFields.map(f => f.field_label).join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create rework order
      const { data: childOrder, error: orderError } = await supabase
        .from('manufacturing_orders')
        .insert({
          order_number: `${parentOrder.order_number}-R`,
          product_name: parentOrder.product_name,
          product_config_id: parentOrder.product_config_id,
          quantity_required: parentOrder.quantity_required,
          priority: parentOrder.priority,
          status: 'pending',
          special_instructions: `Rework from ${parentOrder.order_number} - Step ${currentStep.step_name} - ${reworkReason}`,
          merchant_id: parentOrder.merchant_id,
          parent_order_id: parentOrder.id,
          rework_source_step_id: parentOrderStep?.id,
          rework_reason: reworkReason,
          assigned_to_step: assignedToStep
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating rework order:', orderError);
        throw orderError;
      }

      // Create manufacturing order step for the assigned step
      const assignedStep = activeSteps.find(step => step.step_order === assignedToStep);
      if (assignedStep) {
        const { data: createdStepData, error: stepError } = await supabase
          .from('manufacturing_order_steps')
          .insert({
            manufacturing_order_id: childOrder.id,
            manufacturing_step_id: assignedStep.id,
            step_order: assignedStep.step_order,
            status: 'pending',
            merchant_id: parentOrder.merchant_id
          })
          .select()
          .single();

        if (stepError) throw stepError;

        // Save field values if any
        if (selectedStepFields.length > 0 && Object.keys(fieldValues).length > 0) {
          const stepValueInserts = Object.entries(fieldValues)
            .filter(([_, value]) => value && value.toString().trim() !== '')
            .map(([fieldId, value]) => ({
              manufacturing_order_step_id: createdStepData.id,
              field_id: fieldId,
              field_value: value.toString(),
              merchant_id: parentOrder.merchant_id
            }));

          if (stepValueInserts.length > 0) {
            const { error: valuesError } = await supabase
              .from('manufacturing_order_step_values')
              .insert(stepValueInserts);

            if (valuesError) {
              console.error('Error saving field values:', valuesError);
              // Don't throw here as the order was created successfully
            }
          }
        }
      }

      toast({
        title: 'Success',
        description: `Rework order ${childOrder.order_number} created successfully`,
      });

      onSuccess();
      onClose();
      
      // Reset form
      setReworkReason('');
      setAssignedToStep(1);
      setFieldValues({});

    } catch (error: any) {
      console.error('Error creating rework order:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create rework order',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (!parentOrder || !currentStep) return null;

  console.log('Dialog render - selectedStepFields:', selectedStepFields);
  console.log('Dialog render - fieldValues:', fieldValues);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-orange-600" />
            Create Rework Order
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Step Details */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-blue-800 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Current Step Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-blue-700">Parent Order</Label>
                  <div className="font-semibold text-blue-900">{parentOrder.order_number}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-blue-700">Current Step</Label>
                  <div className="font-semibold text-blue-900">{currentStep.step_name}</div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-blue-700">Product</Label>
                <div className="font-semibold text-blue-900">{parentOrder.product_name}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-blue-700">Quantity</Label>
                <div className="font-semibold text-blue-900">{parentOrder.quantity_required} units</div>
              </div>
            </CardContent>
          </Card>

          {/* Rework Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <ArrowRight className="h-4 w-4 text-gray-500" />
              <h3 className="text-lg font-semibold">Rework Configuration</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assigned-step">Assign to Step</Label>
                <Select 
                  value={assignedToStep.toString()} 
                  onValueChange={(value) => {
                    console.log('Step selection changed to:', value);
                    setAssignedToStep(parseInt(value));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select step" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeSteps.map((step) => (
                      <SelectItem key={step.id} value={step.step_order.toString()}>
                        {step.step_order}. {step.step_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rework-reason">Rework Reason</Label>
                <Textarea
                  id="rework-reason"
                  value={reworkReason}
                  onChange={(e) => setReworkReason(e.target.value)}
                  placeholder="Describe the reason for rework..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Dynamic Step Fields */}
          {selectedStepFields.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-green-800 flex items-center justify-between">
                  Step Configuration Fields
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {selectedStepFields.length} field{selectedStepFields.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedStepFields.map(field => (
                    <div key={field.id} className="space-y-2">
                      <Label>
                        {field.field_label}
                        {field.field_options?.unit && ` (${field.field_options.unit})`}
                        {field.is_required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {renderField(field)}
                      <div className="text-xs text-gray-500">
                        Field ID: {field.field_id}, Value: {fieldValues[field.field_id] || 'empty'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Rework Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChildOrderDialog;
