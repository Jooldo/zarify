
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Clock, User, Package, Settings, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ManufacturingStepField, ManufacturingStep, ManufacturingOrderStep } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useWorkers } from '@/hooks/useWorkers';

export interface RawMaterial {
  name: string;
  quantity: number;
  unit: string;
}

export interface StepCardData extends Record<string, unknown> {
  stepName: string;
  stepOrder: number;
  orderId: string;
  orderNumber: string;
  productName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  progress: number;
  assignedWorker?: string;
  estimatedDuration?: number;
  isJhalaiStep?: boolean;
  productCode?: string;
  category?: string;
  quantityRequired?: number;
  priority?: string;
  rawMaterials?: RawMaterial[];
  stepFields?: ManufacturingStepField[];
  qcRequired?: boolean;
}

interface ManufacturingStepCardProps {
  data: StepCardData;
  manufacturingSteps?: ManufacturingStep[];
  orderSteps?: ManufacturingOrderStep[];
  onAddStep?: (stepData: StepCardData) => void;
  onStepClick?: (stepData: StepCardData) => void;
}

const ManufacturingStepCard: React.FC<ManufacturingStepCardProps> = ({ 
  data, 
  manufacturingSteps = [],
  orderSteps = [],
  onAddStep,
  onStepClick 
}) => {
  const { getStepValue } = useManufacturingStepValues();
  const { workers } = useWorkers();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStepName = () => {
    if (data.stepName === 'Manufacturing Order' && data.status === 'pending') {
      const firstStep = manufacturingSteps
        .filter(step => step.is_active)
        .sort((a, b) => a.step_order - b.step_order)[0];
      
      if (firstStep) {
        return `Move to ${firstStep.step_name}`;
      }
      return 'Start Production';
    }
    
    const currentStepOrder = data.stepOrder;
    const nextStep = manufacturingSteps
      .filter(step => step.is_active)
      .find(step => step.step_order === currentStepOrder + 1);
    
    if (nextStep) {
      return `Move to ${nextStep.step_name}`;
    }
    
    return `Start ${data.stepName}`;
  };

  // Get the current order step from the database
  const currentOrderStep = orderSteps.find(step => 
    step.manufacturing_order_id === data.orderId && 
    step.manufacturing_steps?.step_order === data.stepOrder
  );

  // Check if this step already exists in the database
  const stepExists = currentOrderStep !== undefined;

  // Get field values for display
  const getDisplayFieldValues = () => {
    if (!currentOrderStep || !data.stepFields) return [];
    
    return data.stepFields.map(field => {
      const value = getStepValue(currentOrderStep.id, field.field_id);
      let displayValue = value || 'Not set';
      
      // Format worker field to show worker name
      if (field.field_type === 'worker' && value) {
        const worker = workers.find(w => w.id === value);
        displayValue = worker?.name || value;
      }
      
      return {
        label: field.field_label,
        value: displayValue,
        type: field.field_type
      };
    });
  };

  const requiredFields = data.stepFields?.filter(field => field.is_required) || [];
  const workerFields = data.stepFields?.filter(field => field.field_type === 'worker') || [];
  const displayFieldValues = getDisplayFieldValues();

  const cardClassName = data.isJhalaiStep 
    ? "border-blue-500 bg-blue-50 shadow-lg min-w-[320px] cursor-pointer hover:shadow-xl transition-shadow" 
    : "border-border bg-card shadow-md min-w-[320px] cursor-pointer hover:shadow-lg transition-shadow";

  const handleAddStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddStep?.(data);
  };

  const handleCardClick = () => {
    onStepClick?.(data);
  };

  // Only show CTA for Manufacturing Order OR if step doesn't exist yet
  const shouldShowCTA = (data.stepName === 'Manufacturing Order' && data.status === 'pending') ||
    (data.stepOrder > 0 && !stepExists);

  return (
    <Card className={cardClassName} onClick={handleCardClick}>
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-sm font-semibold ${data.isJhalaiStep ? 'text-blue-700' : 'text-foreground'}`}>
            {data.stepName}
            {data.isJhalaiStep && (
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 border-blue-300">
                Jhalai
              </Badge>
            )}
            {data.stepName === 'Manufacturing Order' && (
              <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700">
                Order
              </Badge>
            )}
            {data.qcRequired && (
              <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-700 border-yellow-300">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                QC
              </Badge>
            )}
          </CardTitle>
          {data.stepOrder > 0 && (
            <Badge variant="secondary" className="text-xs">
              Step {data.stepOrder}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Order Information */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Package className="h-3 w-3" />
          <span>{data.orderNumber} - {data.productName}</span>
        </div>

        {/* Product Code */}
        {data.productCode && (
          <div className="flex items-center gap-2 text-xs">
            <Settings className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Code:</span>
            <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
              {data.productCode}
            </span>
          </div>
        )}

        {/* Quantity and Priority for Manufacturing Orders */}
        {data.stepName === 'Manufacturing Order' && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {data.quantityRequired && (
              <div>
                <span className="text-muted-foreground">Qty:</span>
                <span className="font-medium ml-1">{data.quantityRequired}</span>
              </div>
            )}
            {data.priority && (
              <div>
                <span className="text-muted-foreground">Priority:</span>
                <span className={`font-medium ml-1 capitalize ${
                  data.priority === 'high' || data.priority === 'urgent' ? 'text-red-600' : 
                  data.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {data.priority}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Display Field Values */}
        {displayFieldValues.length > 0 && (
          <div className="text-xs">
            <span className="text-muted-foreground font-medium">Step Details:</span>
            <div className="mt-1 space-y-1">
              {displayFieldValues.slice(0, 3).map((field, index) => (
                <div key={index} className="flex justify-between bg-green-50 px-2 py-1 rounded text-xs border border-green-200">
                  <span className="font-medium text-green-700">{field.label}:</span>
                  <span className="text-green-600">{field.value}</span>
                </div>
              ))}
              {displayFieldValues.length > 3 && (
                <div className="text-muted-foreground text-xs">
                  +{displayFieldValues.length - 3} more fields
                </div>
              )}
            </div>
          </div>
        )}

        {/* Raw Materials Summary */}
        {data.rawMaterials && data.rawMaterials.length > 0 && (
          <div className="text-xs">
            <span className="text-muted-foreground">Materials:</span>
            <div className="mt-1 space-y-1">
              {data.rawMaterials.slice(0, 2).map((material, index) => (
                <div key={index} className="flex justify-between bg-gray-50 px-2 py-1 rounded text-xs">
                  <span className="truncate">{material.name}</span>
                  <span>{material.quantity}{material.unit}</span>
                </div>
              ))}
              {data.rawMaterials.length > 2 && (
                <div className="text-muted-foreground text-xs">
                  +{data.rawMaterials.length - 2} more materials
                </div>
              )}
            </div>
          </div>
        )}

        {/* Required Fields Display - only show if step doesn't exist yet */}
        {!stepExists && requiredFields.length > 0 && (
          <div className="text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Required Fields:
            </span>
            <div className="mt-1 space-y-1">
              {requiredFields.slice(0, 3).map((field, index) => (
                <div key={index} className="bg-yellow-50 px-2 py-1 rounded text-xs border border-yellow-200">
                  <span className="font-medium">{field.field_label}</span>
                  <span className="text-muted-foreground ml-1">({field.field_type})</span>
                </div>
              ))}
              {requiredFields.length > 3 && (
                <div className="text-muted-foreground text-xs">
                  +{requiredFields.length - 3} more required fields
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status and Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(data.status)}>
              {data.status.replace('_', ' ').toUpperCase()}
            </Badge>
            {data.progress > 0 && (
              <span className="text-xs text-muted-foreground">{data.progress}%</span>
            )}
          </div>
          {data.progress > 0 && (
            <Progress value={data.progress} className="h-2" />
          )}
        </div>

        {/* Worker Assignment */}
        {data.assignedWorker && (
          <div className="flex items-center gap-2 text-xs">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Assigned to:</span>
            <span className="font-medium">{data.assignedWorker}</span>
          </div>
        )}

        {/* Worker Field Requirements - only show if step doesn't exist yet */}
        {!stepExists && workerFields.length > 0 && data.status === 'pending' && !data.assignedWorker && (
          <div className="text-xs bg-blue-50 p-2 rounded border border-blue-200">
            <span className="text-blue-700 font-medium">Worker Assignment Required</span>
            <div className="text-blue-600 mt-1">
              {workerFields.length} worker field(s) need to be assigned
            </div>
          </div>
        )}

        {/* Duration */}
        {data.estimatedDuration && data.estimatedDuration > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{data.estimatedDuration}h estimated</span>
          </div>
        )}

        {/* Add Step Button - Only show if shouldShowCTA is true */}
        {shouldShowCTA && (
          <Button 
            variant="outline" 
            size="sm" 
            className={`w-full mt-3 ${data.isJhalaiStep ? 'border-blue-300 hover:bg-blue-100' : ''}`}
            onClick={handleAddStep}
          >
            <Plus className="h-3 w-3 mr-1" />
            {getNextStepName()}
          </Button>
        )}
      </CardContent>

      <Handle type="source" position={Position.Right} className="!bg-gray-400" />
    </Card>
  );
};

export default ManufacturingStepCard;
