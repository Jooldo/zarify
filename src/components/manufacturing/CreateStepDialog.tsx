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
      if (field.is_required && (!fieldValues[field.field_id] || fieldValues[field.field_id] === '')) {
        newErrors[field.field_id] = `${field.field_label} is required`;
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
    const fieldValue = fieldValues[field.field_id] || '';
    const hasError = !!errors[field.field_id];

    switch (field.field_type) {
      case 'worker':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_id} className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {field.field_label} {field.is_required && '*'}
            </Label>
            {workersLoading ? (
              <div className="text-sm text-muted-foreground">Loading workers...</div>
            ) : workers.length === 0 ? (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm text-yellow-800">
                  No workers found. Please seed dummy workers first using the Development Tools.
                </div>
              </div>
            ) : (
              <Select value={fieldValue} onValueChange={(value) => handleFieldChange(field.field_id, value)}>
                <SelectTrigger className={hasError ? 'border-red-500' : ''}>
                  <SelectValue placeholder={`Select ${field.field_label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{worker.name}</span>
                        {worker.role && (
                          <span className="text-xs text-muted-foreground">{worker.role}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {hasError && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors[field.field_id]}
              </div>
            )}
            {workers.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {workers.length} worker(s) available
              </div>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {field.field_label} {field.is_required && '*'}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !fieldValue && "text-muted-foreground",
                    hasError && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fieldValue ? format(new Date(fieldValue), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fieldValue ? new Date(fieldValue) : undefined}
                  onSelect={(date) => handleFieldChange(field.field_id, date)}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
            {hasError && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors[field.field_id]}
              </div>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_id}>
              {field.field_label} {field.is_required && '*'}
            </Label>
            <Input
              id={field.field_id}
              type="number"
              value={fieldValue}
              onChange={(e) => handleFieldChange(field.field_id, e.target.value)}
              placeholder={`Enter ${field.field_label.toLowerCase()}`}
              className={hasError ? 'border-red-500' : ''}
            />
            {hasError && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors[field.field_id]}
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_id}>
              {field.field_label} {field.is_required && '*'}
            </Label>
            <Input
              id={field.field_id}
              type="text"
              value={fieldValue}
              onChange={(e) => handleFieldChange(field.field_id, e.target.value)}
              placeholder={`Enter ${field.field_label.toLowerCase()}`}
              className={hasError ? 'border-red-500' : ''}
            />
            {hasError && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors[field.field_id]}
              </div>
            )}
          </div>
        );

      case 'status':
        const statusOptions = (field.field_options as { options?: string[] })?.options || ['pending', 'in_progress', 'completed', 'blocked'];
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_id}>
              {field.field_label} {field.is_required && '*'}
            </Label>
            <Select value={fieldValue} onValueChange={(value) => handleFieldChange(field.field_id, value)}>
              <SelectTrigger className={hasError ? 'border-red-500' : ''}>
                <SelectValue placeholder={`Select ${field.field_label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors[field.field_id]}
              </div>
            )}
          </div>
        );

      case 'multiselect':
        const multiselectOptions = (field.field_options as { options?: string[] })?.options || [];
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_id}>
              {field.field_label} {field.is_required && '*'}
            </Label>
            <Select value={fieldValue} onValueChange={(value) => handleFieldChange(field.field_id, value)}>
              <SelectTrigger className={hasError ? 'border-red-500' : ''}>
                <SelectValue placeholder={`Select ${field.field_label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {multiselectOptions.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors[field.field_id]}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
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

          {/* Raw Materials Context */}
          {manufacturingOrderData.rawMaterials && manufacturingOrderData.rawMaterials.length > 0 && (
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <div className="flex items-center gap-1 mb-2">
                <Scale className="h-3 w-3 text-amber-600" />
                <span className="text-xs font-medium text-amber-700">Raw Materials Required</span>
              </div>
              <div className="space-y-1">
                {manufacturingOrderData.rawMaterials.slice(0, 3).map((material, index) => (
                  <div key={index} className="flex justify-between items-center bg-white px-2 py-1 rounded text-xs">
                    <span className="font-medium text-amber-800">{material.name}</span>
                    <span className="text-amber-700">{material.quantity} {material.unit}</span>
                  </div>
                ))}
                {manufacturingOrderData.rawMaterials.length > 3 && (
                  <p className="text-xs text-amber-700">+{manufacturingOrderData.rawMaterials.length - 3} more materials</p>
                )}
              </div>
            </div>
          )}

          {/* Step Information */}
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-1 mb-2">
              <Settings className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium text-green-700">Step Details</span>
            </div>
            <p className="text-xs text-green-800">
              <strong>Step:</strong> {targetStep.step_name}
            </p>
            {targetStep.description && (
              <p className="text-xs text-green-800">
                <strong>Description:</strong> {targetStep.description}
              </p>
            )}
            {targetStep.estimated_duration_hours && (
              <p className="text-xs text-green-800">
                <strong>Estimated Duration:</strong> {targetStep.estimated_duration_hours}h
              </p>
            )}
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
