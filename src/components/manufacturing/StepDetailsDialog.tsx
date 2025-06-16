
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Workflow } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tables } from '@/integrations/supabase/types';
import { useStepDetailsData } from '@/hooks/useStepDetailsData';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { StepDebugLogger } from './debug/StepDebugLogger';
import { PreviousStepsDisplay } from './PreviousStepsDisplay';
import { CurrentStepDisplay } from './CurrentStepDisplay';

interface StepDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: Tables<'manufacturing_order_steps'> | null;
}

const StepDetailsDialog: React.FC<StepDetailsDialogProps> = ({ open, onOpenChange, step }) => {
  const {
    order,
    currentStepDefinition,
    currentStepValues,
    previousStepsData,
    isLoading
  } = useStepDetailsData(step);

  const { orderSteps, stepFields } = useManufacturingSteps();
  const { stepValues } = useManufacturingStepValues();

  const [dueDate, setDueDate] = useState<Date | undefined>(
    order?.due_date ? new Date(order.due_date) : undefined
  );

  if (!step || !order) {
    return null;
  }

  const handleDueDateSave = () => {
    // Here you would implement the logic to save the due date
    console.log('Saving due date:', dueDate);
    // You can add a mutation to update the order's due date
  };

  // Get all order steps for this order with their field data
  const getOrderStepsWithFieldData = () => {
    const currentOrderSteps = orderSteps
      .filter(orderStep => orderStep.manufacturing_order_id === order.id)
      .sort((a, b) => (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0));

    return currentOrderSteps.map(orderStep => {
      const stepStepFields = stepFields.filter(field => 
        field.manufacturing_step_id === orderStep.manufacturing_step_id
      );
      
      const stepStepValues = stepValues.filter(value => 
        value.manufacturing_order_step_id === orderStep.id
      );

      return {
        ...orderStep,
        fields: stepStepFields,
        values: stepStepValues
      };
    });
  };

  const orderStepsWithData = getOrderStepsWithFieldData();

  const getStepStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'skipped': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFieldValue = (fieldId: string, values: any[]) => {
    const value = values.find(v => v.field_id === fieldId);
    return value?.field_value || '-';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Step Details: {currentStepDefinition?.step_name}</DialogTitle>
          <DialogDescription>
            Order #{order.order_number} - {order.product_name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Due Date Section */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-lg mb-3">Due Date Management</h4>
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Current Due Date:</label>
                <span className="text-sm text-gray-600">
                  {order.due_date ? format(new Date(order.due_date), 'PPP') : 'Not set'}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Update Due Date:</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button onClick={handleDueDateSave} size="sm">
                Save Due Date
              </Button>
            </div>
          </div>

          {/* Manufacturing Steps Progress */}
          {orderStepsWithData.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  Manufacturing Steps Configuration Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderStepsWithData.map((orderStep, index) => (
                  <div key={orderStep.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {orderStep.manufacturing_steps?.step_order}
                        </div>
                        <div>
                          <h4 className="font-semibold">{orderStep.manufacturing_steps?.step_name}</h4>
                          {orderStep.manufacturing_steps?.description && (
                            <p className="text-sm text-muted-foreground">{orderStep.manufacturing_steps.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getStepStatusColor(orderStep.status)}`}>
                          {orderStep.status.replace('_', ' ')}
                        </Badge>
                        {orderStep.progress_percentage !== null && (
                          <span className="text-sm font-medium">{orderStep.progress_percentage}%</span>
                        )}
                      </div>
                    </div>

                    {/* Step timing info */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3 text-sm">
                      {orderStep.started_at && (
                        <div>
                          <span className="text-muted-foreground">Started:</span>
                          <p className="font-medium">{format(new Date(orderStep.started_at), 'MMM dd, yyyy HH:mm')}</p>
                        </div>
                      )}
                      {orderStep.completed_at && (
                        <div>
                          <span className="text-muted-foreground">Completed:</span>
                          <p className="font-medium">{format(new Date(orderStep.completed_at), 'MMM dd, yyyy HH:mm')}</p>
                        </div>
                      )}
                      {orderStep.workers?.name && (
                        <div>
                          <span className="text-muted-foreground">Worker:</span>
                          <p className="font-medium">{orderStep.workers.name}</p>
                        </div>
                      )}
                    </div>

                    {/* Step field data */}
                    {orderStep.fields.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2 text-sm">Step Data:</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {orderStep.fields.map((field) => (
                            <div key={field.id} className="bg-muted/50 p-2 rounded">
                              <span className="text-xs text-muted-foreground block">{field.field_label}:</span>
                              <span className="text-sm font-medium">
                                {getFieldValue(field.field_id, orderStep.values)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {orderStep.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="text-xs text-muted-foreground">Notes:</span>
                        <p className="text-sm">{orderStep.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Previous Steps Data */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <PreviousStepsDisplay
              previousStepsData={previousStepsData}
              orderNumber={order.order_number}
              isLoading={isLoading}
            />
          </div>
          
          {/* Current Step Inputs */}
          <div className="pt-4 border-t">
            <h4 className="font-semibold text-lg mb-3">Current Step Configuration</h4>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <CurrentStepDisplay
                currentStepValues={currentStepValues}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>

        <StepDebugLogger open={open} order={order} step={step} />
      </DialogContent>
    </Dialog>
  );
};

export default StepDetailsDialog;
