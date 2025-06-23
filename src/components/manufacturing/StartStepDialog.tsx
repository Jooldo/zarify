
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  // Define field order for display
  const fieldOrder = [
    'assigned_worker',
    'due_date', 
    'weight_assigned',
    'quantity_assigned',
    'weight_received',
    'quantity_received'
  ];

  // Sort fields based on the defined order
  const sortedFields = currentStepFields.sort((a, b) => {
    const indexA = fieldOrder.indexOf(a.field_key);
    const indexB = fieldOrder.indexOf(b.field_key);
    
    // If field is not in order array, put it at the end
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    
    return indexA - indexB;
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

      // Extract assigned worker and due date from field values if they exist
      const assignedWorker = fieldValues['assigned_worker'] || undefined;
      const dueDate = fieldValues['due_date'] || undefined;

      if (!orderStep) {
        console.log('Creating new order step');
        
        const { data: newOrderStep, error: createError } = await supabase
          .from('manufacturing_order_step_data')
          .insert({
            order_id: order.id,
            step_name: step.step_name,
            status: 'in_progress',
            merchant_id: merchant.id,
            started_at: new Date().toISOString(),
            assigned_worker: assignedWorker,
            due_date: dueDate ? format(new Date(dueDate), 'yyyy-MM-dd') : undefined,
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
          orderNumber: order.order_number,
          assigned_worker: assignedWorker,
          dueDate: dueDate ? format(new Date(dueDate), 'yyyy-MM-dd') : undefined,
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

    // Handle specific field types based on field_key
    if (field.field_key === 'assigned_worker') {
      return (
        <Select value={value} onValueChange={(val) => handleFieldChange(field.field_key, val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a worker" />
          </SelectTrigger>
          <SelectContent>
            {workers.map(worker => (
              <SelectItem key={worker.id} value={worker.id}>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{worker.name}</span>
                  {worker.role && (
                    <span className="text-xs text-muted-foreground">({worker.role})</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.field_key === 'due_date') {
      const selectedDate = value ? new Date(value) : undefined;
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => handleFieldChange(field.field_key, date?.toISOString())}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      );
    }

    // Default to text input for other fields
    return (
      <Input
        value={value}
        onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
        placeholder={`Enter ${field.field_key.replace('_', ' ')}`}
      />
    );
  };

  const requiredFields = sortedFields.filter(field => field.is_visible);
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
              {sortedFields.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No configuration required for this step
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedFields.map(field => (
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
