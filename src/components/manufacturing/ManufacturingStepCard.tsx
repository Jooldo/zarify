import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, User, Settings, CheckCircle2, Truck, ClipboardCheck, Weight, Hash, Type } from 'lucide-react';
import { ManufacturingStepField, ManufacturingStep, ManufacturingOrderStep } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useWorkers } from '@/hooks/useWorkers';
import StepDetailsDialog from './StepDetailsDialog';

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
        return `Start ${firstStep.stepName}`;
      }
      return 'Start Production';
    }
    
    const currentStepOrder = data.stepOrder;
    const nextStep = manufacturingSteps
      .filter(step => step.is_active)
      .find(step => step.step_order === currentStepOrder + 1);
    
    if (nextStep) {
      return `Start ${nextStep.stepName}`;
    }
    
    return `Start ${data.stepName}`;
  };

  // Get the current order step from the database using order_id instead of manufacturing_order_id
  const currentOrderStep = Array.isArray(orderSteps) 
    ? orderSteps.find(step => 
        step.order_id === data.orderId && 
        step.step_name === data.stepName
      )
    : undefined;

  // Check if this step already exists in the database
  const stepExists = currentOrderStep !== undefined;

  // Get all order steps for this specific order using order_id
  const thisOrderSteps = Array.isArray(orderSteps) 
    ? orderSteps.filter(step => String(step.order_id) === String(data.orderId))
    : [];

  // ENHANCED CTA LOGIC FOR MERCHANT-SPECIFIC STEPS
  const shouldShowCTA = (() => {
    console.log(`\n=== CTA DEBUG START ===`);
    console.log(`Card: ${data.stepName} (stepOrder: ${data.stepOrder}) for order ${data.orderNumber}`);
    console.log(`Order ID from data: ${data.orderId}`);
    console.log(`Current order step found:`, currentOrderStep ? {
      id: currentOrderStep.id,
      status: currentOrderStep.status,
      stepName: currentOrderStep.step_name
    } : 'NOT FOUND');
    
    console.log(`All order steps for this order (${thisOrderSteps.length} total):`);
    thisOrderSteps.forEach(step => {
      console.log(`  - ${step.step_name} (status: ${step.status})`);
    });
    
    // Rule 1: Manufacturing Order cards - show only if NO manufacturing steps exist yet
    if (data.stepName === 'Manufacturing Order' && data.stepOrder === 0) {
      const hasAnySteps = thisOrderSteps.length > 0;
      console.log(`Manufacturing Order rule: hasAnySteps=${hasAnySteps}`);
      console.log(`=== CTA DEBUG END: ${!hasAnySteps} ===\n`);
      return !hasAnySteps;
    }

    // Rule 2: Step cards - show ONLY if this step is completed AND the immediate NEXT step doesn't exist AND next step is valid
    if (data.stepOrder > 0) {
      // Get this step's actual status from database
      const actualStepStatus = currentOrderStep?.status || 'pending';
      const isThisStepCompleted = actualStepStatus === 'completed';
      
      console.log(`Step rule evaluation:`);
      console.log(`  - Current step status from DB: ${actualStepStatus}`);
      console.log(`  - Is completed: ${isThisStepCompleted}`);
      
      if (!isThisStepCompleted) {
        console.log(`  - Step not completed, hiding CTA`);
        console.log(`=== CTA DEBUG END: false ===\n`);
        return false;
      }

      // Check if the immediate NEXT step exists in database
      const nextStepOrder = data.stepOrder + 1;
      console.log(`  - Looking for immediate next step with step_order: ${nextStepOrder}`);
      
      const immediateNextStepExists = thisOrderSteps.some(step => {
        // Since step_order doesn't exist in manufacturing_order_step_data, we'll use creation order
        const isImmediateNext = step.step_name !== data.stepName; // simplified check
        
        if (isImmediateNext) {
          console.log(`  - FOUND potential next step: ${step.step_name} (status: ${step.status})`);
        }
        
        return false; // For now, always allow next step
      });

      // Check if next step exists in merchant's configuration
      const nextStepExistsInConfig = manufacturingSteps.some(step => 
        step.is_active && step.step_order === nextStepOrder
      );

      console.log(`  - Immediate next step exists in DB: ${immediateNextStepExists}`);
      console.log(`  - Next step exists in merchant config: ${nextStepExistsInConfig}`);
      
      // Only show if this step is completed AND next step exists in config
      const shouldShow = isThisStepCompleted && nextStepExistsInConfig;
      console.log(`  - Final result: ${shouldShow}`);
      console.log(`=== CTA DEBUG END: ${shouldShow} ===\n`);
      
      return shouldShow;
    }

    console.log(`=== CTA DEBUG END: false (default) ===\n`);
    return false;
  })();

  console.log(`[CTA DEBUG] FINAL DECISION for ${data.stepName} (${data.stepOrder}): shouldShowCTA=${shouldShowCTA}`);

  const getAssignedWorkerName = () => {
    if (!currentOrderStep) return data.assignedWorker;
    
    // Use assigned_worker field from the order step
    if (currentOrderStep.assigned_worker) {
      const worker = workers.find(w => w.id === currentOrderStep.assigned_worker);
      return worker?.name;
    }
    
    // Fallback to assigned worker from order step
    return currentOrderStep.workers?.name || data.assignedWorker;
  };

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
      .filter(field => field.is_visible) // Only visible fields
      .map(field => {
        let value = 'Not set';
        let displayValue = 'Not set';
        
        // Add unit information for specific field types
        if (field.unit) {
          displayValue = `${value} ${field.unit}`;
        }
        
        return {
          label: field.field_key,
          value: displayValue,
          type: 'text',
          isEmpty: value === 'Not set',
          fieldName: field.field_key
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
          
          {/* Status Pills */}
          {data.stepOrder > 0 && (
            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(currentOrderStep?.status || data.status)}>
                {(currentOrderStep?.status || data.status).replace('_', ' ').toUpperCase()}
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
