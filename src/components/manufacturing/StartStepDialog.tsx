import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Play } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useWorkers } from '@/hooks/useWorkers';
import { useToast } from '@/hooks/use-toast';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { ManufacturingStep } from '@/hooks/useManufacturingSteps';

interface StartStepDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: ManufacturingOrder;
  step: ManufacturingStep | null;
}

const StartStepDialog = ({ isOpen, onClose, order, step }: StartStepDialogProps) => {
  const { toast } = useToast();
  const { orderSteps, updateStepStatus, getStepFields } = useManufacturingSteps();
  const { saveStepValue } = useManufacturingStepValues();
  const { workers } = useWorkers();
  
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (step) {
      const stepFields = getStepFields(step.id);
      const initialValues: Record<string, any> = {};
      stepFields.forEach(field => {
        initialValues[field.field_id] = '';
      });
      setFieldValues(initialValues);
    }
  }, [step, getStepFields]);

  const handleFieldValueChange = (fieldId: string, value: any) => {
    setFieldValues(prevValues => ({
      ...prevValues,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!step || !order) return;

    setIsSubmitting(true);
    try {
      // Find the corresponding order step
      const orderStep = orderSteps.find(os => 
        os.manufacturing_order_id === order.id && 
        os.manufacturing_step_id === step.id
      );

      if (!orderStep) {
        throw new Error('Order step not found');
      }

      // Save field values first
      const stepFields = getStepFields(step.id);
      for (const field of stepFields) {
        const value = fieldValues[field.field_id];
        if (value !== undefined && value !== '') {
          await saveStepValue(orderStep.id, field.field_id, value);
        }
      }

      // Update step status to in_progress with step order and order ID for next step creation
      updateStepStatus({
        stepId: orderStep.id,
        status: 'in_progress',
        stepOrder: step.step_order,
        orderId: order.id
      });

      toast({
        title: 'Success',
        description: `${step.step_name} started successfully`,
      });

      onClose();
    } catch (error: any) {
      console.error('Error starting step:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start manufacturing step',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!step) {
    return null;
  }

  const stepFields = getStepFields(step.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start {step.step_name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {stepFields.map(field => {
            switch (field.field_type) {
              case 'worker':
                return (
                  <div key={field.field_id}>
                    <Label htmlFor={field.field_id}>{field.field_label}</Label>
                    <Select onValueChange={(value) => handleFieldValueChange(field.field_id, value)}>
                      <SelectTrigger id={field.field_id}>
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
                  </div>
                );
              case 'date':
                return (
                  <div key={field.field_id}>
                    <Label htmlFor={field.field_id}>{field.field_label}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !fieldValues[field.field_id] && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {fieldValues[field.field_id] ? (
                            format(new Date(fieldValues[field.field_id]), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={fieldValues[field.field_id] ? new Date(fieldValues[field.field_id]) : undefined}
                          onSelect={(date) => handleFieldValueChange(field.field_id, date?.toISOString())}
                          disabled={(date) =>
                            date > new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                );
              case 'number':
                return (
                  <div key={field.field_id}>
                    <Label htmlFor={field.field_id}>{field.field_label}</Label>
                    <Input
                      type="number"
                      id={field.field_id}
                      value={fieldValues[field.field_id] || ''}
                      onChange={(e) => handleFieldValueChange(field.field_id, e.target.value)}
                    />
                  </div>
                );
              case 'text':
                return (
                  <div key={field.field_id}>
                    <Label htmlFor={field.field_id}>{field.field_label}</Label>
                    <Input
                      type="text"
                      id={field.field_id}
                      value={fieldValues[field.field_id] || ''}
                      onChange={(e) => handleFieldValueChange(field.field_id, e.target.value)}
                    />
                  </div>
                );
              case 'multiselect':
                return (
                  <div key={field.field_id}>
                    <Label htmlFor={field.field_id}>{field.field_label}</Label>
                    <Textarea
                      id={field.field_id}
                      value={fieldValues[field.field_id] || ''}
                      onChange={(e) => handleFieldValueChange(field.field_id, e.target.value)}
                    />
                  </div>
                );
              default:
                return null;
            }
          })}
          <Button type="submit" disabled={isSubmitting}>
            <Play className="h-4 w-4 mr-2" />
            Start Step
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StartStepDialog;
