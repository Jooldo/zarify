
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, User, Package, CheckCircle2, Pause, Play, X } from 'lucide-react';
import { format } from 'date-fns';
import { ManufacturingOrderStep } from '@/hooks/useManufacturingSteps';
import { useUpdateManufacturingStep } from '@/hooks/useUpdateManufacturingStep';
import { useToast } from '@/hooks/use-toast';
import UpdateStepDialog from './UpdateStepDialog';
import StepProgressDialog from './StepProgressDialog';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';

interface ManufacturingStepProgressCardProps {
  step: ManufacturingOrderStep;
  order: ManufacturingOrder;
  onStepUpdate?: () => void;
}

const ManufacturingStepProgressCard: React.FC<ManufacturingStepProgressCardProps> = ({ 
  step, 
  order,
  onStepUpdate 
}) => {
  const { updateStep } = useUpdateManufacturingStep();
  const { toast } = useToast();
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'blocked': return <X className="h-4 w-4" />;
      default: return <Pause className="h-4 w-4" />;
    }
  };

  const calculateProgress = () => {
    if (step.status === 'completed') return 100;
    if (step.status === 'in_progress') return 50;
    return 0;
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateStep({
        stepId: step.id,
        fieldValues: {},
        status: newStatus as any,
        progress: newStatus === 'completed' ? 100 : newStatus === 'in_progress' ? 50 : 0,
        stepName: step.step_name,
        orderNumber: order.order_number
      });

      toast({
        title: 'Success',
        description: `Step status updated to ${newStatus.replace('_', ' ')}`,
      });

      onStepUpdate?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update step status',
        variant: 'destructive',
      });
    }
  };

  const getNextStatus = () => {
    switch (step.status) {
      case 'pending': return 'in_progress';
      case 'in_progress': return 'completed';
      case 'blocked': return 'in_progress';
      default: return null;
    }
  };

  const getNextStatusLabel = () => {
    const nextStatus = getNextStatus();
    if (!nextStatus) return null;
    return nextStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const nextStatus = getNextStatus();
  const nextStatusLabel = getNextStatusLabel();
  const progress = calculateProgress();

  return (
    <>
      <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                {step.step_name}
              </CardTitle>
              <p className="text-sm text-gray-600">Order: {order.order_number}</p>
              <p className="text-sm text-gray-600">Product: {order.product_name}</p>
            </div>
            <Badge className={getStatusColor(step.status)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(step.status)}
                {step.status.replace('_', ' ').toUpperCase()}
              </div>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step timing information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {step.started_at && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-gray-600">Started</p>
                  <p className="font-semibold">{format(new Date(step.started_at), 'MMM dd, HH:mm')}</p>
                </div>
              </div>
            )}

            {step.completed_at && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-gray-600">Completed</p>
                  <p className="font-semibold">{format(new Date(step.completed_at), 'MMM dd, HH:mm')}</p>
                </div>
              </div>
            )}

            {step.due_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-gray-600">Due Date</p>
                  <p className="font-semibold">{format(new Date(step.due_date), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            )}

            {step.assigned_worker && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-gray-600">Assigned To</p>
                  <p className="font-semibold">Worker ID: {step.assigned_worker}</p>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {step.notes && (
            <div className="bg-gray-50 p-3 rounded-lg border">
              <p className="text-sm text-gray-800">
                <span className="font-medium">Notes:</span> {step.notes}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsUpdateDialogOpen(true)}
              className="flex-1"
            >
              Update Details
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsProgressDialogOpen(true)}
              className="flex-1"
            >
              View Progress
            </Button>
            {nextStatus && (
              <Button 
                size="sm" 
                onClick={() => handleStatusUpdate(nextStatus)}
                className="flex-1"
              >
                Mark as {nextStatusLabel}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <UpdateStepDialog
        step={step}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        onStepUpdate={onStepUpdate}
      />

      <StepProgressDialog
        order={order}
        orderSteps={[step]}
        open={isProgressDialogOpen}
        onOpenChange={setIsProgressDialogOpen}
      />
    </>
  );
};

export default ManufacturingStepProgressCard;
