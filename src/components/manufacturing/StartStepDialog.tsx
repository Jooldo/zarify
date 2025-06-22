
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useWorkers } from '@/hooks/useWorkers';
import { useCreateManufacturingStep } from '@/hooks/useCreateManufacturingStep';
import { useCreateBatchFromStep } from '@/hooks/useCreateBatchFromStep';
import { Play, User, Settings } from 'lucide-react';

interface StartStepDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  step: any;
  sourceStepId?: string; // If provided, this indicates we're starting a new batch from an existing step
}

const StartStepDialog: React.FC<StartStepDialogProps> = ({
  isOpen,
  onClose,
  order,
  step,
  sourceStepId
}) => {
  const { getStepFields } = useManufacturingSteps();
  const { workers } = useWorkers();
  const { createStep, isCreating: isCreatingStep } = useCreateManufacturingStep();
  const { createBatch, isCreating: isCreatingBatch } = useCreateBatchFromStep();
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const stepFields = step ? getStepFields(step.id) : [];
  const isCreating = isCreatingStep || isCreatingBatch;
  const isNewBatch = !!sourceStepId;

  // Reset form when dialog opens/closes or step changes
  useEffect(() => {
    if (isOpen && stepFields.length > 0) {
      const initialValues: Record<string, string> = {};
      stepFields.forEach(field => {
        initialValues[field.field_id] = '';
      });
      setFieldValues(initialValues);
    } else {
      setFieldValues({});
    }
  }, [isOpen, stepFields]);

  const handleFieldValueChange = (fieldId: string, value: string) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const renderField = (field: any) => {
    const currentValue = fieldValues[field.field_id] || '';

    switch (field.field_type) {
      case 'worker':
        return (
          <Select 
            value={currentValue} 
            onValueChange={(value) => handleFieldValueChange(field.field_id, value)}
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
            value={currentValue}
            onChange={(e) => handleFieldValueChange(field.field_id, e.target.value)}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
          />
        );
      case 'text':
        return (
          <Input
            type="text"
            value={currentValue}
            onChange={(e) => handleFieldValueChange(field.field_id, e.target.value)}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={currentValue}
            onChange={(e) => handleFieldValueChange(field.field_id, e.target.value)}
          />
        );
      default:
        return (
          <Input
            type="text"
            value={currentValue}
            onChange={(e) => handleFieldValueChange(field.field_id, e.target.value)}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
          />
        );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!order || !step) {
      return;
    }

    // Validate required fields
    const requiredFields = stepFields.filter(field => field.is_required);
    const missingFields = requiredFields.filter(field => 
      !fieldValues[field.field_id] || fieldValues[field.field_id].toString().trim() === ''
    );
    
    if (missingFields.length > 0) {
      return;
    }

    try {
      if (isNewBatch && sourceStepId) {
        // Create a new batch from existing step
        await createBatch({
          sourceOrderId: order.id,
          sourceStepId: sourceStepId,
          targetStepId: step.id,
          fieldValues: fieldValues
        });
      } else {
        // Create next step in sequence (existing functionality)
        await createStep({
          manufacturingOrderId: order.id,
          stepId: step.id,
          fieldValues: fieldValues
        });
      }

      onClose();
      setFieldValues({});
    } catch (error) {
      console.error('Error starting step:', error);
    }
  };

  if (!order || !step) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-blue-600" />
            {isNewBatch ? `Start New ${step.step_name} Batch` : `Start ${step.step_name}`}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Information */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-blue-800 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-blue-700">Order Number</Label>
                  <div className="font-semibold text-blue-900">{order.order_number}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-blue-700">
                    {isNewBatch ? 'New Batch Step' : 'Next Step'}
                  </Label>
                  <div className="font-semibold text-blue-900">{step.step_name}</div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-blue-700">Product</Label>
                <div className="font-semibold text-blue-900">{order.product_name}</div>
              </div>
              {isNewBatch && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 mb-2">
                    New Batch
                  </Badge>
                  <p className="text-sm text-orange-700">
                    This will create a new {step.step_name} batch/path, separate from any existing steps.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step Configuration Fields */}
          {stepFields.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-green-800 flex items-center justify-between">
                  Step Configuration
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {stepFields.length} field{stepFields.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stepFields.map(field => (
                    <div key={field.id} className="space-y-2">
                      <Label>
                        {field.field_label}
                        {field.field_options?.unit && ` (${field.field_options.unit})`}
                        {field.is_required && <span className="text-red-500 ml-1">*</span>}
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
              {isCreating ? 'Starting...' : (isNewBatch ? `Start New ${step.step_name} Batch` : `Start ${step.step_name}`)}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StartStepDialog;
