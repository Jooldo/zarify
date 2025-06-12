
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, Package, Clock, Scale } from 'lucide-react';
import { StepCardData } from './ManufacturingStepCard';

interface StepDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stepData: StepCardData | null;
  onMoveToJhalai?: (stepData: StepCardData) => void;
}

const StepDetailsDialog: React.FC<StepDetailsDialogProps> = ({
  open,
  onOpenChange,
  stepData,
  onMoveToJhalai
}) => {
  if (!stepData) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canMoveToJhalai = stepData.status === 'pending' && stepData.stepName === 'Manufacturing Order';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {stepData.stepName} Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Order Number</label>
              <p className="text-lg font-semibold">{stepData.orderNumber}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Product Name</label>
              <p className="text-lg">{stepData.productName}</p>
            </div>
          </div>

          <Separator />

          {/* Status and Progress */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Current Status</label>
              <Badge className={getStatusColor(stepData.status)}>
                {stepData.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Progress</label>
              <p className="text-lg font-semibold">{stepData.progress}%</p>
            </div>
          </div>

          <Separator />

          {/* Step Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Step Order</label>
              <p className="text-lg">Step {stepData.stepOrder}</p>
            </div>
            {stepData.estimatedDuration && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Estimated Duration</label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p>{stepData.estimatedDuration}h</p>
                </div>
              </div>
            )}
          </div>

          {/* Worker Assignment */}
          {stepData.assignedWorker && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Assigned Worker</label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{stepData.assignedWorker}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {canMoveToJhalai && (
              <Button 
                onClick={() => {
                  onMoveToJhalai?.(stepData);
                  onOpenChange(false);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Move to Next Step: Jhalai
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StepDetailsDialog;
