
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Play, Package2, User, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { ManufacturingStep } from '@/hooks/useManufacturingSteps';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useUpdateManufacturingStep } from '@/hooks/useUpdateManufacturingStep';
import { useWorkers } from '@/hooks/useWorkers';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMerchant } from '@/hooks/useMerchant';

interface StartStepDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: ManufacturingOrder | null;
  step: ManufacturingStep | null;
}

const StartStepDialog: React.FC<StartStepDialogProps> = ({
  isOpen,
  onClose,
  order,
  step
}) => {
  const { stepFields, orderSteps } = useManufacturingSteps();
  const { updateStep } = useUpdateManufacturingStep();
  const { workers } = useWorkers();
  const { merchant } = useMerchant();
  const { toast } = useToast();
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initializedStepId, setInitializedStepId] = useState<string | null>(null);

  const stepId = step?.id ? String(step.id) : null;
  
  const currentStepFields = stepFields.filter(field => {
    const fieldStepId = String(field.manufacturing_step_id);
    return stepId && fieldStepId === stepId;
  });

  // Initialize field values only when dialog opens with a new step
  useEffect(() => {
    if (isOpen && stepId && stepId !== initializedStepId) {
      console.log('Initializing field values for step:', stepId);
      const initialValues: Record<string, any> = {};
      
      currentStepFields.forEach(field => {
        if (field.field_type === 'status' && field.field_options?.options) {
          initialValues[field.field_id] = field.field_options.options[0] || '';
        } else {
          initialValues[field.field_id] = '';
        }
      });
      
      console.log('Initial values:', initialValues);
      setFieldValues(initialValues);
      setInitializedStepId(stepId);
    } else if (!isOpen) {
      setFieldValues({});
      setInitializedStepId(null);
    }
  }, [isOpen, stepId, currentStepFields.length, initializedStepId]);

  if (!order || !step) {
    return null;
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    console.log('Field change:', fieldId, value);
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSelectChange = (fieldId: string) => (value: string) => {
    console.log('Select change:', fieldId, value);
    handleFieldChange(fieldId, value);
  };

  const handleDateSelect = (fieldId: string) => (date: Date | undefined) => {
    if (date) {
      handleFieldChange(fieldId, format(date, 'yyyy-MM-dd'));
    }
  };

  const handleStartStep = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!merchant?.id) {
      toast({
        title: 'Error',
        description: 'Merchant information not available',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Starting step with values:', fieldValues);
      
      let orderStep = orderSteps.find(os => 
        os.manufacturing_order_id === order.id && 
        os.manufacturing_step_id === stepId
      );

      let stepIdForUpdate = orderStep?.id;

      if (!orderStep) {
        console.log('Creating new order step');
        // Get the step_order from the manufacturing_steps table
        const { data: stepData, error: stepError } = await supabase
          .from('manufacturing_steps')
          .select('step_order')
          .eq('id', stepId)
          .single();

        if (stepError) {
          console.error('Error fetching step data:', stepError);
          throw stepError;
        }

        const { data: newOrderStep, error: createError } = await supabase
          .from('manufacturing_order_steps')
          .insert({
            manufacturing_order_id: order.id,
            manufacturing_step_id: stepId,
            step_order: stepData.step_order,
            status: 'in_progress',
            merchant_id: merchant.id,
            started_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating order step:', createError);
          throw createError;
        }
        
        stepIdForUpdate = newOrderStep.id;
        console.log('Created new order step:', stepIdForUpdate);
      }

      if (stepIdForUpdate) {
        console.log('Updating step with ID:', stepIdForUpdate);
        await updateStep({
          stepId: stepIdForUpdate,
          fieldValues,
          status: 'in_progress',
          progress: 0,
          stepName: step.step_name,
          orderNumber: order.order_number
        });

        toast({
          title: 'Success',
          description: `${step.step_name} started successfully`,
        });

        // Reset form and close dialog
        setFieldValues({});
        setInitializedStepId(null);
        onClose();
      }
    } catch (error) {
      console.error('Error starting step:', error);
      toast({
        title: 'Error',
        description: 'Failed to start manufacturing step',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    const value = fieldValues[field.field_id] || '';

    switch (field.field_type) {
      case 'worker':
        return (
          <Select
            value={value}
            onValueChange={handleSelectChange(field.field_id)}
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
                onClick={(e) => e.stopPropagation()}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={handleDateSelect(field.field_id)}
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
            placeholder="Enter number"
          />
        );

      case 'status':
        return (
          <Select
            value={value}
            onValueChange={handleSelectChange(field.field_id)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {field.field_options?.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'text':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.field_id, e.target.value)}
            placeholder="Enter text"
            rows={3}
          />
        );

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.field_id, e.target.value)}
            placeholder={`Enter ${field.field_label}`}
          />
        );
    }
  };

  const requiredFields = currentStepFields.filter(field => field.is_required);
  const isFormValid = requiredFields.every(field => {
    const value = fieldValues[field.field_id];
    return value !== undefined && value !== null && value !== '';
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isSubmitting) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Start {step.step_name}
            <Badge variant="outline" className="ml-2">
              {order.order_number}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleStartStep} className="space-y-4">
          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package2 className="h-4 w-4" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Product:</span>
                  <div className="font-medium">{order.product_name}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Quantity:</span>
                  <div className="font-medium">{order.quantity_required}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step Fields */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                {step.step_name} Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {currentStepFields.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No configuration required for this step
                </div>
              ) : (
                <div className="space-y-3">
                  {currentStepFields.map(field => (
                    <div key={field.field_id} className="space-y-1">
                      <Label htmlFor={field.field_id} className="text-sm font-medium">
                        {field.field_label}
                        {field.is_required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? 'Starting...' : `Start ${step.step_name}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StartStepDialog;
