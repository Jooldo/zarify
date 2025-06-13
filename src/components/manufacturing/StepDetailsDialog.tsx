
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, Package, Clock, Scale, Settings, Weight, Hash, Type } from 'lucide-react';
import { StepCardData } from './ManufacturingStepCard';

interface StepDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stepData: StepCardData | null;
}

const StepDetailsDialog: React.FC<StepDetailsDialogProps> = ({
  open,
  onOpenChange,
  stepData
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

  // Get icon for field type
  const getFieldIcon = (fieldName: string, fieldType: string) => {
    if (fieldName.toLowerCase().includes('weight')) {
      return <Weight className="h-4 w-4 text-purple-600" />;
    }
    if (fieldName.toLowerCase().includes('quantity')) {
      return <Hash className="h-4 w-4 text-purple-600" />;
    }
    if (fieldType === 'date') {
      return <Calendar className="h-4 w-4 text-purple-600" />;
    }
    if (fieldType === 'worker') {
      return <User className="h-4 w-4 text-purple-600" />;
    }
    if (fieldType === 'number') {
      return <Hash className="h-4 w-4 text-purple-600" />;
    }
    return <Type className="h-4 w-4 text-purple-600" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {stepData.stepName} Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Order Information */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Order Number</label>
              <p className="text-sm font-semibold">{stepData.orderNumber}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Product Name</label>
              <p className="text-sm">{stepData.productName}</p>
            </div>
          </div>

          {/* Product Details */}
          {(stepData.productCode || stepData.category) && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h3 className="text-xs font-medium text-blue-900 mb-2 flex items-center gap-1">
                <Settings className="h-3 w-3" />
                Product Configuration
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {stepData.productCode && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-blue-700">Product Code</label>
                    <p className="text-xs text-blue-800 font-mono bg-white px-2 py-1 rounded border">
                      {stepData.productCode}
                    </p>
                  </div>
                )}
                {stepData.category && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-blue-700">Category</label>
                    <p className="text-xs text-blue-800">{stepData.category}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status and Progress */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Badge className={getStatusColor(stepData.status)}>
                {stepData.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Progress</label>
              <p className="text-sm font-semibold">{stepData.progress}%</p>
            </div>
          </div>

          {/* Manufacturing Details */}
          {stepData.stepName === 'Manufacturing Order' && (stepData.quantityRequired || stepData.priority) && (
            <div className="bg-green-50 p-3 rounded-lg">
              <h3 className="text-xs font-medium text-green-900 mb-2">Manufacturing Details</h3>
              <div className="grid grid-cols-2 gap-2">
                {stepData.quantityRequired && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-green-700">Quantity</label>
                    <p className="text-xs text-green-800">{stepData.quantityRequired}</p>
                  </div>
                )}
                {stepData.priority && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-green-700">Priority</label>
                    <p className="text-xs text-green-800 capitalize">{stepData.priority}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Raw Materials Section */}
          {stepData.rawMaterials && stepData.rawMaterials.length > 0 && (
            <div className="bg-amber-50 p-3 rounded-lg">
              <h3 className="text-xs font-medium text-amber-900 mb-2 flex items-center gap-1">
                <Scale className="h-3 w-3" />
                Raw Materials Required
              </h3>
              <div className="space-y-1">
                {stepData.rawMaterials.slice(0, 3).map((material, index) => (
                  <div key={index} className="flex justify-between items-center bg-white px-2 py-1 rounded border">
                    <span className="text-xs font-medium text-amber-800">{material.name}</span>
                    <span className="text-xs text-amber-700">
                      {material.quantity} {material.unit}
                    </span>
                  </div>
                ))}
                {stepData.rawMaterials.length > 3 && (
                  <p className="text-xs text-amber-700">+{stepData.rawMaterials.length - 3} more materials</p>
                )}
              </div>
            </div>
          )}

          {/* Step Fields - Enhanced with Icons and Units */}
          {stepData.stepFields && stepData.stepFields.length > 0 && (
            <div className="bg-purple-50 p-3 rounded-lg">
              <h3 className="text-xs font-medium text-purple-900 mb-2 flex items-center gap-1">
                <Settings className="h-3 w-3" />
                Step Configuration Fields
              </h3>
              <div className="space-y-2">
                {stepData.stepFields.map((field, index) => (
                  <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded border">
                    <div className="flex items-center gap-2">
                      {getFieldIcon(field.field_name, field.field_type)}
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-purple-800">{field.field_label}</span>
                        <span className="text-xs text-purple-600">
                          {field.field_type}
                          {field.is_required && ' • Required'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Show unit if available */}
                      {field.field_options?.unit && (
                        <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                          {field.field_options.unit}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {field.field_type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Worker and Duration */}
          <div className="grid grid-cols-2 gap-2">
            {stepData.assignedWorker && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Assigned Worker</label>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs font-medium">{stepData.assignedWorker}</p>
                </div>
              </div>
            )}
            {stepData.estimatedDuration && stepData.estimatedDuration > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Duration</label>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs">{stepData.estimatedDuration}h</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StepDetailsDialog;
