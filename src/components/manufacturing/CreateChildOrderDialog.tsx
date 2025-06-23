import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const activeSteps = useMemo(() => {
    if (!Array.isArray(manufacturingSteps)) return [];
    return manufacturingSteps
      .filter(step => step.is_active)
      .sort((a, b) => a.step_order - b.step_order);
  }, [manufacturingSteps]);

  const selectedStepFields = useMemo(() => {
    if (!Array.isArray(stepFields)) return [];
    const selectedStep = activeSteps.find(step => step.step_order === assignedToStep);
    if (selectedStep) {
      return stepFields.filter(field => field.step_name === selectedStep.step_name);
    }
    return [];
  }, [activeSteps, stepFields, assignedToStep]);

  // Initialize field values when selected step fields change
  useEffect(() => {
    console.log('Selected step fields changed:', selectedStepFields.length);
    
    if (selectedStepFields.length > 0) {
      setFieldValues(prevValues => {
        const newValues: Record<string, string> = {};
        selectedStepFields.forEach(field => {
          // Keep existing value if it exists, otherwise set to empty string
          newValues[field.field_key] = prevValues[field.field_key] || '';
        });
        console.log('Initialized field values:', newValues);
        return newValues;
      });
    } else {
      setFieldValues({});
    }
  }, [selectedStepFields]);

  const handleFieldValueChange = useCallback((fieldKey: string, value: string) => {
    console.log('Field value changing:', fieldKey, '=', value);
    setFieldValues(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  }, []);

  const renderField = (field: any) => {
    const currentValue = fieldValues[field.field_key] || '';

    switch (field.field_key) {
      case 'assigned_worker':
        return (
          <Select 
            value={currentValue} 
            onValueChange={(value) => handleFieldValueChange(field.field_key, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select worker" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(workers) && workers.map(worker => (
                <SelectItem key={worker.id} value={worker.id}>
                  {worker.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'quantity_assigned':
      case 'quantity_received':
      case 'weight_assigned':
      case 'weight_received':
      case 'purity':
      case 'wastage':
      case 'temperature':
      case 'pressure':
        return (
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => handleFieldValueChange(field.field_key, e.target.value)}
            placeholder={`Enter ${field.field_key.replace('_', ' ')}`}
          />
        );
      case 'due_date':
        return (
          <Input
            type="date"
            value={currentValue}
            onChange={(e) => handleFieldValueChange(field.field_key, e.target.value)}
          />
        );
      case 'notes':
      case 'instructions':
        return (
          <Textarea
            value={currentValue}
            onChange={(e) => handleFieldValueChange(field.field_key, e.target.value)}
            placeholder={`Enter ${field.field_key}`}
          />
        );
      default:
        return (
          <Input
            type="text"
            value={currentValue}
            onChange={(e) => handleFieldValueChange(field.field_key, e.target.value)}
            placeholder={`Enter ${field.field_key.replace('_', ' ')}`}
          />
        );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!parentOrder || !parentOrderStep) {
      toast({
        title: 'Error',
        description: 'Missing parent order or current step information',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      // Generate unique rework order number using the database function
      const { data: reworkOrderNumber, error: reworkNumberError } = await supabase
        .rpc('get_next_manufacturing_order_number');

      if (reworkNumberError) {
        console.error('Error generating rework order number:', reworkNumberError);
        throw reworkNumberError;
      }

      console.log('Generated rework order number:', reworkOrderNumber);

      // Create rework order with proper step tracking
      const { data: childOrder, error: orderError } = await supabase
        .from('manufacturing_orders')
        .insert({
          order_number: reworkOrderNumber,
          product_name: parentOrder.product_name,
          quantity_required: parentOrder.quantity_required,
          priority: parentOrder.priority,
          status: 'pending',
          special_instructions: `Rework from ${parentOrder.order_number} - Step ${currentStep.step_name} - ${reworkReason}`,
          merchant_id: parentOrder.merchant_id
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating rework order:', orderError);
        throw orderError;
      }

      console.log('✅ Created rework order:', {
        childOrderId: childOrder.id,
        orderNumber: reworkOrderNumber
      });

      // Create manufacturing order step data for the assigned step
      const assignedStep = activeSteps.find(step => step.step_order === assignedToStep);
      if (assignedStep) {
        const stepData: any = {
          order_id: childOrder.id,
          step_name: assignedStep.step_name,
          status: 'pending',
          merchant_id: parentOrder.merchant_id
        };

        // Add field values to step data
        Object.entries(fieldValues).forEach(([fieldKey, value]) => {
          if (value && value.toString().trim() !== '') {
            stepData[fieldKey] = value;
          }
        });

        const { error: stepError } = await supabase
          .from('manufacturing_order_step_data')
          .insert(stepData);

        if (stepError) throw stepError;
      }

      toast({
        title: 'Success',
        description: `Rework order ${reworkOrderNumber} created successfully`,
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
                  onValueChange={(value) => setAssignedToStep(parseInt(value))}
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
                        {field.field_key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        {field.is_visible && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {renderField(field)}
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
