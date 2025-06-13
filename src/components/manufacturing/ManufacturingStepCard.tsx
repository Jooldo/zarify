
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, User, Package, Settings, CheckCircle2, Truck, ClipboardCheck } from 'lucide-react';
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
  dueDate?: string;
  materialAssigned?: boolean;
  materialReceived?: boolean;
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
        return `Start ${firstStep.step_name}`;
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

  // Check if there are subsequent steps that have been started
  const hasSubsequentSteps = orderSteps.some(step => 
    step.manufacturing_order_id === data.orderId && 
    step.manufacturing_steps?.step_order && 
    step.manufacturing_steps.step_order > data.stepOrder
  );

  // Get user-defined status from step values
  const getUserDefinedStatus = () => {
    if (!currentOrderStep || !data.stepFields) return null;
    
    const statusField = data.stepFields.find(field => field.field_type === 'status' && field.field_name.toLowerCase().includes('status'));
    if (statusField) {
      const value = getStepValue(currentOrderStep.id, statusField.field_id);
      return value;
    }
    return null;
  };

  // Get assigned worker name from step values or order step
  const getAssignedWorkerName = () => {
    if (!currentOrderStep) return data.assignedWorker;
    
    // First check if there's a worker field in step configuration
    if (data.stepFields) {
      const workerField = data.stepFields.find(field => field.field_type === 'worker');
      if (workerField) {
        const workerId = getStepValue(currentOrderStep.id, workerField.field_id);
        if (workerId) {
          const worker = workers.find(w => w.id === workerId);
          return worker?.name;
        }
      }
    }
    
    // Fallback to assigned worker from order step
    return currentOrderStep.workers?.name || data.assignedWorker;
  };

  // Get configured field values for display
  const getConfiguredFieldValues = () => {
    if (!data.stepFields) return [];
    
    const fieldValues = data.stepFields
      .filter(field => !['worker', 'status'].includes(field.field_type)) // Exclude worker and status as they're shown separately
      .map(field => {
        let value = 'Not set';
        
        // Get value from database if step exists
        if (currentOrderStep) {
          const savedValue = getStepValue(currentOrderStep.id, field.field_id);
          if (savedValue) {
            value = savedValue;
          }
        }
        
        return {
          label: field.field_label,
          value: value,
          type: field.field_type,
          isEmpty: value === 'Not set'
        };
      });
    
    return fieldValues;
  };

  const cardClassName = data.isJhalaiStep 
    ? "border-blue-500 bg-blue-50 shadow-lg min-w-[280px] cursor-pointer hover:shadow-xl transition-shadow" 
    : "border-border bg-card shadow-md min-w-[280px] cursor-pointer hover:shadow-lg transition-shadow";

  const handleAddStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddStep?.(data);
  };

  const handleCardClick = () => {
    onStepClick?.(data);
  };

  // Show CTA for Manufacturing Order if no steps exist yet, or for completed steps that don't have subsequent steps
  const shouldShowCTA = (data.stepName === 'Manufacturing Order' && 
    data.status === 'pending' && 
    !orderSteps.some(step => step.manufacturing_order_id === data.orderId)) ||
    (data.stepOrder > 0 && data.status === 'completed' && !hasSubsequentSteps);

  const userDefinedStatus = getUserDefinedStatus();
  const assignedWorkerName = getAssignedWorkerName();
  const configuredFieldValues = getConfiguredFieldValues();

  return (
    <Card className={cardClassName} onClick={handleCardClick}>
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      
      <CardHeader className="pb-2 p-4">
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

      <CardContent className="space-y-2 p-4 pt-0">
        {/* Order Information */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Package className="h-3 w-3" />
          <span>{data.orderNumber} - {data.productName}</span>
        </div>

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

        {/* Status Pills - Show user-defined status instead of default status */}
        {data.stepOrder > 0 && (
          <div className="flex items-center justify-between">
            {userDefinedStatus ? (
              <Badge className="bg-purple-100 text-purple-800 capitalize">
                {userDefinedStatus}
              </Badge>
            ) : (
              <Badge className={getStatusColor(data.status)}>
                {data.status.replace('_', ' ').toUpperCase()}
              </Badge>
            )}
          </div>
        )}

        {/* Due Date instead of hours estimated */}
        {data.dueDate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Due: {new Date(data.dueDate).toLocaleDateString()}</span>
          </div>
        )}

        {/* Worker Assignment */}
        {assignedWorkerName && (
          <div className="flex items-center gap-2 text-xs">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Assigned to:</span>
            <span className="font-medium">{assignedWorkerName}</span>
          </div>
        )}

        {/* Configured Field Values */}
        {configuredFieldValues.length > 0 && (
          <div className="space-y-1">
            {configuredFieldValues.map((field, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <Settings className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{field.label}:</span>
                <span className={`font-medium ${field.isEmpty ? 'text-muted-foreground italic' : ''}`}>
                  {field.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Material Assigned */}
        {data.stepOrder > 0 && data.materialAssigned !== undefined && (
          <div className="flex items-center gap-2 text-xs">
            <Truck className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Material Assigned:</span>
            <span className={`font-medium ${data.materialAssigned ? 'text-green-600' : 'text-red-600'}`}>
              {data.materialAssigned ? 'Yes' : 'No'}
            </span>
          </div>
        )}

        {/* Material Received */}
        {data.stepOrder > 0 && data.materialReceived !== undefined && (
          <div className="flex items-center gap-2 text-xs">
            <ClipboardCheck className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Material Received:</span>
            <span className={`font-medium ${data.materialReceived ? 'text-green-600' : 'text-red-600'}`}>
              {data.materialReceived ? 'Yes' : 'No'}
            </span>
          </div>
        )}

        {/* Add Step Button - Only show when appropriate and no subsequent steps exist */}
        {shouldShowCTA && (
          <Button 
            variant="outline" 
            size="sm" 
            className={`w-full mt-2 ${data.isJhalaiStep ? 'border-blue-300 hover:bg-blue-100' : ''}`}
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
