
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Scale, User, Clock, AlertCircle, Package, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { StepCardData } from './ManufacturingStepCard';
import { ManufacturingStep, ManufacturingStepField } from '@/hooks/useManufacturingSteps';
import { useWorkers } from '@/hooks/useWorkers';
import { useToast } from '@/hooks/use-toast';

interface CreateStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manufacturingOrderData: StepCardData | null;
  targetStep: ManufacturingStep | null;
  stepFields: ManufacturingStepField[];
  onCreateStep?: (stepData: any) => void;
}

const CreateStepDialog: React.FC<CreateStepDialogProps> = ({
  open,
  onOpenChange,
  manufacturingOrderData,
  targetStep,
  stepFields,
  onCreateStep
}) => {
  const { toast } = useToast();
  const { workers, isLoading: workersLoading } = useWorkers();
  
  const [fieldValues, setFieldValues] = useState<{[key: string]: any}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    stepFields.forEach(field => {
      if (field.is_visible && (!fieldValues[field.field_key] || fieldValues[field.field_key] === '')) {
        newErrors[field.field_key] = `${field.field_key} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: ''
      }));
    }
  };

  const renderField = (field: ManufacturingStepField) => {
    const fieldValue = fieldValues[field.field_key] || '';
    const hasError = !!errors[field.field_key];

    // Basic text input for all field types since we only have field_key and unit in the database
    return (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={field.field_key} className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {field.field_key} {field.is_visible && '*'}
        </Label>
        <Input
          id={field.field_key}
          type="text"
          value={fieldValue}
          onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
          placeholder={`Enter ${field.field_key.replace('_', ' ')}`}
          className={hasError ? 'border-red-500' : ''}
        />
        {field.unit && (
          <div className="text-xs text-muted-foreground">
            Unit: {field.unit}
          </div>
        )}
        {hasError && (
          <div className="flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-3 w-3" />
            {errors[field.field_key]}
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = async () => {
    if (!manufacturingOrderData || !targetStep) return;
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors and try again',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const stepData = {
        manufacturingOrderId: manufacturingOrderData.orderId,
        stepId: targetStep.id,
        stepName: targetStep.step_name,
        fieldValues,
        orderContext: {
          orderNumber: manufacturingOrderData.orderNumber,
          productName: manufacturingOrderData.productName,
          productCode: manufacturingOrderData.productCode,
          priority: manufacturingOrderData.priority,
          quantityRequired: manufacturingOrderData.quantityRequired,
          rawMaterials: manufacturingOrderData.rawMaterials,
        }
      };

      onCreateStep?.(stepData);
      
      toast({
        title: `${targetStep.step_name} Step Created`,
        description: `Successfully created ${targetStep.step_name} step for ${manufacturingOrderData.orderNumber}`,
      });

      // Reset form
      setFieldValues({});
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to create ${targetStep?.step_name} step`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setFieldValues({});
      setErrors({});
    }
    onOpenChange(newOpen);
  };

  if (!manufacturingOrderData || !targetStep) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Move to {targetStep.step_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Context */}
          <div className="bg-blue-50 p-3 rounded-lg border">
            <p className="text-sm text-blue-800">
              <strong>Order:</strong> {manufacturingOrderData.orderNumber}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Product:</strong> {manufacturingOrderData.productName}
            </p>
            {manufacturingOrderData.productCode && (
              <p className="text-sm text-blue-800">
                <strong>Product Code:</strong> {manufacturingOrderData.productCode}
              </p>
            )}
            {manufacturingOrderData.quantityRequired && (
              <p className="text-sm text-blue-800">
                <strong>Quantity:</strong> {manufacturingOrderData.quantityRequired}
              </p>
            )}
            {manufacturingOrderData.priority && (
              <p className="text-sm text-blue-800">
                <strong>Priority:</strong> <span className="capitalize">{manufacturingOrderData.priority}</span>
              </p>
            )}
          </div>

          {/* Step Information */}
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-1 mb-2">
              <Settings className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium text-green-700">Step Details</span>
            </div>
            <p className="text-xs text-green-800">
              <strong>Step:</strong> {targetStep.step_name}
            </p>
          </div>

          {/* Dynamic Fields */}
          {stepFields.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Step Configuration</h3>
              {stepFields.map(field => renderField(field))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">No additional fields configured for this step.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Creating...' : `Move to ${targetStep.step_name}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStepDialog;
