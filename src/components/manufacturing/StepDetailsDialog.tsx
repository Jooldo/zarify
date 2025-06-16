
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Play, CheckCircle2, ArrowRight, User, Calendar, Package, FileText } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useStepDetailsData } from '@/hooks/useStepDetailsData';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { format } from 'date-fns';
import { CurrentStepDisplay } from './CurrentStepDisplay';
import { PreviousStepsDisplay } from './PreviousStepsDisplay';

interface StepDetailsDialogProps {
  step: Tables<'manufacturing_order_steps'> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StepDetailsDialog = ({ step, open, onOpenChange }: StepDetailsDialogProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateStepStatus } = useManufacturingSteps();
  
  const {
    order,
    currentStepDefinition,
    currentStepValues,
    previousStepsData,
    isLoading
  } = useStepDetailsData(step);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!step || !currentStepDefinition || !order) return;
    
    setIsUpdating(true);
    try {
      // Pass the required parameters for next step creation
      updateStepStatus({
        stepId: step.id,
        status: newStatus,
        stepOrder: currentStepDefinition.step_order,
        orderId: order.id
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Play className="h-4 w-4 mr-2" />;
      case 'in_progress': return <ArrowRight className="h-4 w-4 mr-2" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 mr-2" />;
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Manufacturing Step Details
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="text-center py-4">
            Loading step details...
          </div>
        )}

        {!step && !isLoading && (
          <div className="text-center py-4">
            No step selected.
          </div>
        )}

        {step && currentStepDefinition && order && (
          <div className="space-y-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Order Number:</strong> {order.order_number}
                </div>
                <div>
                  <strong>Product:</strong> {order.product_name}
                </div>
                <div>
                  <strong>Quantity:</strong> {order.quantity_required}
                </div>
                <div>
                  <strong>Due Date:</strong> {order.due_date ? format(new Date(order.due_date), 'MMM dd, yyyy') : 'N/A'}
                </div>
                <div>
                  <strong>Priority:</strong> {order.priority}
                </div>
                <div>
                  <strong>Status:</strong>
                  <Badge className={getStatusColor(step.status)}>
                    {step.status.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Step Information */}
            <Card>
              <CardHeader>
                <CardTitle>Step Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <strong>Step Name:</strong> {currentStepDefinition.step_name}
                </div>
                <div>
                  <strong>Step Order:</strong> {currentStepDefinition.step_order}
                </div>
                <div>
                  <strong>Description:</strong> {currentStepDefinition.description || 'No description provided.'}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              {step.status === 'pending' && (
                <Button 
                  onClick={() => handleStatusUpdate('in_progress')}
                  disabled={isUpdating}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Step
                </Button>
              )}
              
              {step.status === 'in_progress' && (
                <Button 
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={isUpdating}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Complete Step
                </Button>
              )}

              {step.status === 'completed' && (
                <Badge className="bg-green-100 text-green-800 px-3 py-1">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Step Completed
                </Badge>
              )}
            </div>

            {/* Current Step Display */}
            <CurrentStepDisplay currentStepValues={currentStepValues} isLoading={isLoading} />

            {/* Previous Steps Display */}
            <PreviousStepsDisplay previousStepsData={previousStepsData} isLoading={isLoading} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StepDetailsDialog;
