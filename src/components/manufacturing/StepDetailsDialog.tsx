
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
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tables } from '@/integrations/supabase/types';
import { useStepDetailsData } from '@/hooks/useStepDetailsData';
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
