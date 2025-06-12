
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, Package, Clock, Scale, Settings } from 'lucide-react';
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
      <DialogContent className="max-w-3xl">
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

          {/* Product Details */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Product Configuration
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-700">Product Code</label>
                <p className="text-sm text-blue-800 font-mono bg-white px-2 py-1 rounded border">
                  {stepData.productCode || 'Not specified'}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-700">Category</label>
                <p className="text-sm text-blue-800">
                  {stepData.category || 'Not specified'}
                </p>
              </div>
            </div>
          </div>

          {/* Raw Materials Section */}
          {stepData.rawMaterials && stepData.rawMaterials.length > 0 && (
            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-amber-900 mb-3 flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Raw Materials Required
              </h3>
              <div className="space-y-2">
                {stepData.rawMaterials.map((material, index) => (
                  <div key={index} className="flex justify-between items-center bg-white px-3 py-2 rounded border">
                    <span className="text-sm font-medium text-amber-800">{material.name}</span>
                    <span className="text-sm text-amber-700">
                      {material.quantity} {material.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Manufacturing Details */}
          {stepData.stepName === 'Manufacturing Order' && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-900 mb-3">Manufacturing Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-700">Quantity Required</label>
                  <p className="text-sm text-green-800">{stepData.quantityRequired || 'Not specified'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-700">Priority</label>
                  <p className="text-sm text-green-800 capitalize">{stepData.priority || 'Medium'}</p>
                </div>
              </div>
            </div>
          )}

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
