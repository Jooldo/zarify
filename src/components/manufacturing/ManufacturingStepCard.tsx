
import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, User, Package, Settings, CheckCircle2, Truck, ClipboardCheck, Weight, Hash, Type } from 'lucide-react';
import { ManufacturingStepField, ManufacturingStep, ManufacturingOrderStep } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useWorkers } from '@/hooks/useWorkers';
import StepDetailsDialog from './StepDetailsDialog';
import { Tables } from '@/integrations/supabase/types';

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
  manufacturingStepId?: string;
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
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

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

  // Get all order steps for this specific order
  const thisOrderSteps = orderSteps.filter(step => 
    String(step.manufacturing_order_id) === String(data.orderId)
  );

  // FIXED CTA LOGIC - Clear and precise rules:
  const shouldShowCTA = (() => {
    console.log(`[CTA DEBUG] Evaluating ${data.stepName} (order ${data.stepOrder}) for order ${data.orderNumber}`);
    
    // Rule 1: Manufacturing Order cards - show only if NO manufacturing steps exist yet
    if (data.stepName === 'Manufacturing Order' && data.stepOrder === 0) {
      const hasAnySteps = thisOrderSteps.length > 0;
      console.log(`[CTA DEBUG] Manufacturing Order: hasAnySteps=${hasAnySteps}`);
      return !hasAnySteps;
    }

    // Rule 2: Step cards - show ONLY if ALL conditions are met:
    if (data.stepOrder > 0) {
      // 2a. This step must be completed
      const isThisStepCompleted = data.status === 'completed';
      
      // 2b. NO subsequent steps should be in progress or completed
      const hasSubsequentStepsStarted = thisOrderSteps.some(step => {
        const stepOrder = step.manufacturing_steps?.step_order || 0;
        const stepStatus = step.status;
        const isSubsequent = stepOrder > data.stepOrder;
        const isStarted = stepStatus === 'in_progress' || stepStatus === 'completed';
        
        console.log(`[CTA DEBUG]   Checking step ${step.manufacturing_steps?.step_name} (order ${stepOrder}): isSubsequent=${isSubsequent}, isStarted=${isStarted}`);
        
        return isSubsequent && isStarted;
      });

      // 2c. The immediate next step should not exist yet
      const nextStepOrder = data.stepOrder + 1;
      const nextStepExists = thisOrderSteps.some(step => 
        step.manufacturing_steps?.step_order === nextStepOrder
      );

      console.log(`[CTA DEBUG] Step evaluation: isCompleted=${isThisStepCompleted}, hasSubsequentStarted=${hasSubsequentStepsStarted}, nextStepExists=${nextStepExists}`);
      
      return isThisStepCompleted && !hasSubsequentStepsStarted && !nextStepExists;
    }

    return false;
  })();

  console.log(`[CTA DEBUG] FINAL DECISION for ${data.stepName} (${data.stepOrder}): shouldShowCTA=${shouldShowCTA}`);

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

  // Get step fields - use the fields passed in data
  const getStepFields = () => {
    if (data.stepFields && data.stepFields.length > 0) {
      return data.stepFields;
    }
    return [];
  };

  // Get configured field values for display - only required fields, show all non-worker fields
  const getConfiguredFieldValues = () => {
    const stepFields = getStepFields();
    
    if (!stepFields || stepFields.length === 0) {
      return [];
    }
    
    const fieldValues = stepFields
      .filter(field => field.field_type !== 'worker' && field.is_required) // Only required fields, exclude worker
      .map(field => {
        let value = 'Not set';
        let displayValue = 'Not set';
        
        // Get value from database if step exists
        if (currentOrderStep) {
          const savedValue = getStepValue(currentOrderStep.id, field.field_id);
          if (savedValue !== null && savedValue !== undefined && savedValue !== '') {
            value = savedValue;
            displayValue = savedValue;
            
            // Add unit information for specific field types
            if (field.field_options?.unit) {
              displayValue = `${value} ${field.field_options.unit}`;
            }
          }
        }
        
        return {
          label: field.field_label,
          value: displayValue,
          type: field.field_type,
          isEmpty: value === 'Not set',
          fieldName: field.field_name
        };
      });
    
    return fieldValues;
  };

  // Get icon for field type
  const getFieldIcon = (fieldName: string, fieldType: string) => {
    if (fieldName.toLowerCase().includes('weight')) {
      return <Weight className="h-3 w-3 text-muted-foreground" />;
    }
    if (fieldName.toLowerCase().includes('quantity')) {
      return <Hash className="h-3 w-3 text-muted-foreground" />;
    }
    if (fieldType === 'date') {
      return <Calendar className="h-3 w-3 text-muted-foreground" />;
    }
    if (fieldType === 'number') {
      return <Hash className="h-3 w-3 text-muted-foreground" />;
    }
    return <Type className="h-3 w-3 text-muted-foreground" />;
  };

  const cardClassName = data.isJhalaiStep 
    ? "border-blue-500 bg-blue-50 shadow-lg min-w-[280px] cursor-pointer hover:shadow-xl transition-shadow" 
    : "border-border bg-card shadow-md min-w-[280px] cursor-pointer hover:shadow-lg transition-shadow";

  const handleAddStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddStep?.(data);
  };

  const handleCardClick = () => {
    // Open details dialog instead of calling onStepClick
    setDetailsDialogOpen(true);
  };

  const assignedWorkerName = getAssignedWorkerName();
  const configuredFieldValues = getConfiguredFieldValues();

  return (
    <>
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

          {/* Status Pills */}
          {data.stepOrder > 0 && (
            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(data.status)}>
                {data.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          )}

          {/* Due Date */}
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

          {/* Configured Field Values - Only Required Fields */}
          {configuredFieldValues.length > 0 && (
            <div className="space-y-1">
              {configuredFieldValues.map((field, index) => (
                <div key={index} className="flex items-center gap-2 text-xs bg-gray-50 p-2 rounded">
                  {getFieldIcon(field.fieldName, field.type)}
                  <span className="text-muted-foreground font-medium">{field.label}:</span>
                  <span className={`font-semibold flex-1 ${field.isEmpty ? 'text-muted-foreground italic' : 'text-gray-900'}`}>
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Material Status */}
          {data.stepOrder > 0 && (data.materialAssigned !== undefined || data.materialReceived !== undefined) && (
            <div className="space-y-1">
              {data.materialAssigned !== undefined && (
                <div className="flex items-center gap-2 text-xs">
                  <Truck className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Material Assigned:</span>
                  <span className={`font-medium ${data.materialAssigned ? 'text-green-600' : 'text-red-600'}`}>
                    {data.materialAssigned ? 'Yes' : 'No'}
                  </span>
                </div>
              )}
              {data.materialReceived !== undefined && (
                <div className="flex items-center gap-2 text-xs">
                  <ClipboardCheck className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Material Received:</span>
                  <span className={`font-medium ${data.materialReceived ? 'text-green-600' : 'text-red-600'}`}>
                    {data.materialReceived ? 'Yes' : 'No'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Add Step Button - Only show when appropriate */}
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

      <StepDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        step={currentOrderStep || null}
      />
    </>
  );
};

export default ManufacturingStepCard;
