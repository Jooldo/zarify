
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
import { Play, Package2, User, CalendarIcon, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { MerchantStepConfig } from '@/hooks/useManufacturingSteps';
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
  step: MerchantStepConfig | null;
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
  
  // Get current step fields that match this step
  const currentStepFields = stepFields.filter(field => {
    return stepId && field.step_name === step?.step_name;
  });

  // Initialize field values only when dialog opens with a new step
  useEffect(() => {
    if (isOpen && stepId && stepId !== initializedStepId) {
      console.log('Initializing field values for step:', stepId);
      const initialValues: Record<string, any> = {};
      
      currentStepFields.forEach(field => {
        initialValues[field.field_key] = '';
      });
      
      console.log('Initial values:', initialValues);
      setFieldValues(initialValues);
      setInitializedStepId(stepId);
    } else if (!isOpen) {
      setFieldValues({});
      setInitializedStepId(null);
    }
  }, [isOpen, stepId, currentStepFields.length, initializedStepId]);

  // Early return with error dialog if no order or step when dialog is open
  if (isOpen && (!order || !step)) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          onClose();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              No Next Step Available
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {!order ? 'Order information is not available.' : 'There is no next step available for this manufacturing order.'}
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Don't render anything if dialog is closed
  if (!isOpen) {
    return null;
  }

  const handleFieldChange = (fieldKey: string, value: any) => {
    console.log('Field change:', fieldKey, value);
    setFieldValues(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const handleSelectChange = (fieldKey: string) => (value: string) => {
    console.log('Select change:', fieldKey, value);
    handleFieldChange(fieldKey, value);
  };

  const handleDateSelect = (fieldKey: string) => (date: Date | undefined) => {
    if (date) {
      handleFieldChange(fieldKey, format(date, 'yyyy-MM-dd'));
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
        os.order_id === order.id && 
        os.step_name === step.step_name
      );

      let stepIdForUpdate = orderStep?.id;

      if (!orderStep) {
        console.log('Creating new order step');
        
        const { data: newOrderStep, error: createError } = await supabase
          .from('manufacturing_order_step_data')
          .insert({
            order_id: order.id,
            step_name: step.step_name,
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
    const value = fieldValues[field.field_key] || '';

    // Since we only have basic field structure, render as text input
    return (
      <Input
        value={value}
        onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
        placeholder={`Enter ${field.field_key.replace('_', ' ')}`}
      />
    );
  };

  const requiredFields = currentStepFields.filter(field => field.is_visible);
  const isFormValid = requiredFields.every(field => {
    const value = fieldValues[field.field_key];
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
                    <div key={field.id} className="space-y-1">
                      <Label htmlFor={field.field_key} className="text-sm font-medium">
                        {field.field_key.replace('_', ' ')}
                        {field.is_visible && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                        {field.unit && (
                          <span className="text-muted-foreground text-xs ml-1">({field.unit})</span>
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
