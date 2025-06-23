
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
import { useWorkers } from '@/hooks/useWorkers';
import { StepDebugLogger } from './debug/StepDebugLogger';
import { PreviousStepsDisplay } from './PreviousStepsDisplay';
import { CurrentStepDisplay } from './CurrentStepDisplay';

interface StepDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: Tables<'manufacturing_order_step_data'> | null;
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
  const { workers } = useWorkers();

  const [dueDate, setDueDate] = useState<Date | undefined>(
    order?.due_date ? new Date(order.due_date) : undefined
  );

  if (!step || !order) {
    return null;
  }

  const handleDueDateSave = () => {
    console.log('Saving due date:', dueDate);
  };

  // Get all order steps for this order with their field data
  const getOrderStepsWithFieldData = () => {
    const currentOrderSteps = orderSteps
      .filter(orderStep => orderStep.order_id === order.id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return currentOrderSteps.map(orderStep => {
      const stepStepFields = stepFields.filter(field => 
        field.step_name === orderStep.step_name
      );
      
      const stepStepValues = stepValues.filter(value => 
        value.step_id === orderStep.id
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

  const getFieldValue = (fieldKey: string, values: any[]) => {
    const value = values.find(v => v.field_key === fieldKey);
    return value?.field_value || '-';
  };

  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : 'Unknown Worker';
  };

  const getDisplayValue = (field: any, fieldValue: string) => {
    // Simple display since we don't have field_type
    return fieldValue;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">Step Details: {step.step_name}</DialogTitle>
          <DialogDescription className="text-sm">
            Order #{order.order_number} - {order.product_name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {/* Due Date Section - More Compact */}
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-base mb-2">Due Date Management</h4>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium">Current:</label>
                <span className="text-xs text-gray-600">
                  {order.due_date ? format(new Date(order.due_date), 'MMM dd, yyyy') : 'Not set'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium">Update:</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "w-[180px] justify-start text-left font-normal text-xs",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {dueDate ? format(dueDate, "MMM dd, yyyy") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button onClick={handleDueDateSave} size="sm" className="text-xs">
                Save Due Date
              </Button>
            </div>
          </div>

          {/* All Manufacturing Steps Progress - More Compact */}
          {orderStepsWithData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Workflow className="h-4 w-4" />
                  All Manufacturing Steps Configuration Data
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {orderStepsWithData.map((orderStep, index) => (
                  <div key={orderStep.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{orderStep.step_name}</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getStepStatusColor(orderStep.status)}`}>
                          {orderStep.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    {/* Step timing info - More Compact */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-2 text-xs">
                      {orderStep.started_at && (
                        <div>
                          <span className="text-muted-foreground">Started:</span>
                          <p className="font-medium">{format(new Date(orderStep.started_at), 'MMM dd, HH:mm')}</p>
                        </div>
                      )}
                      {orderStep.completed_at && (
                        <div>
                          <span className="text-muted-foreground">Completed:</span>
                          <p className="font-medium">{format(new Date(orderStep.completed_at), 'MMM dd, HH:mm')}</p>
                        </div>
                      )}
                      {orderStep.assigned_worker && (
                        <div>
                          <span className="text-muted-foreground">Assigned Worker:</span>
                          <p className="font-medium">{getWorkerName(orderStep.assigned_worker)}</p>
                        </div>
                      )}
                    </div>

                    {/* Step field data - More Compact */}
                    {orderStep.fields.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-1 text-xs">Step Data:</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {orderStep.fields.map((field) => {
                            const fieldValue = getFieldValue(field.field_key, orderStep.values);
                            const displayValue = getDisplayValue(field, fieldValue);
                            
                            return (
                              <div key={field.id} className="bg-muted/50 p-2 rounded text-xs">
                                <span className="text-muted-foreground block">{field.field_key}:</span>
                                <span className="font-medium">
                                  {displayValue}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Notes - More Compact */}
                    {orderStep.notes && (
                      <div className="mt-2 pt-2 border-t">
                        <span className="text-xs text-muted-foreground">Notes:</span>
                        <p className="text-xs">{orderStep.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Previous Steps Data - More Compact */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <PreviousStepsDisplay
              previousStepsData={previousStepsData}
              orderNumber={order.order_number}
              isLoading={isLoading}
            />
          </div>
          
          {/* Current Step Inputs - More Compact */}
          <div className="pt-2 border-t">
            <h4 className="font-semibold text-base mb-2">Current Step Configuration</h4>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <CurrentStepDisplay
                currentStepValues={currentStepValues}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} size="sm">Close</Button>
        </DialogFooter>

        <StepDebugLogger open={open} order={order} step={step} />
      </DialogContent>
    </Dialog>
  );
};

export default StepDetailsDialog;
