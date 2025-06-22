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
      return `Start ${nextStep.step_name}`;
    }
    
    return `Start ${data.stepName}`;
  };

  // Get the current order step from the database
  const currentOrderStep = orderSteps.find(step => 
    step.manufacturing_order_id === data.orderId && 
    step.manufacturing_steps?.step_order === data.stepOrder
  );

  console.log('=== STEP CARD DEBUG ===');
  console.log('Step Name:', data.stepName);
  console.log('Step Order:', data.stepOrder);
  console.log('Order ID:', data.orderId);
  console.log('Current Order Step Found:', !!currentOrderStep);
  console.log('Current Order Step ID:', currentOrderStep?.id);
  console.log('Is Manufacturing Order Card:', data.stepName === 'Manufacturing Order');
  console.log('=======================');

  // Check if this step already exists in the database
  const stepExists = currentOrderStep !== undefined;

  // Get all order steps for this specific order
  const thisOrderSteps = orderSteps.filter(step => 
    String(step.manufacturing_order_id) === String(data.orderId)
  );

  // ENHANCED CTA LOGIC FOR MERCHANT-SPECIFIC STEPS
  const shouldShowCTA = (() => {
    console.log(`\n=== CTA DEBUG START ===`);
    console.log(`Card: ${data.stepName} (stepOrder: ${data.stepOrder}) for order ${data.orderNumber}`);
    console.log(`Order ID from data: ${data.orderId}`);
    console.log(`Current order step found:`, currentOrderStep ? {
      id: currentOrderStep.id,
      stepOrder: currentOrderStep.step_order,
      status: currentOrderStep.status,
      stepName: currentOrderStep.manufacturing_steps?.step_name
    } : 'NOT FOUND');
    
    console.log(`All order steps for this order (${thisOrderSteps.length} total):`);
    thisOrderSteps.forEach(step => {
      console.log(`  - ${step.manufacturing_steps?.step_name} (step_order: ${step.step_order}, status: ${step.status})`);
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

      // Check if the immediate NEXT step exists in database (step_order = current + 1)
      const nextStepOrder = data.stepOrder + 1;
      console.log(`  - Looking for immediate next step with step_order: ${nextStepOrder}`);
      
      const immediateNextStepExists = thisOrderSteps.some(step => {
        const stepOrder = step.step_order;
        const isImmediateNext = stepOrder === nextStepOrder;
        
        if (isImmediateNext) {
          console.log(`  - FOUND immediate next step: ${step.manufacturing_steps?.step_name} (step_order: ${stepOrder}, status: ${step.status})`);
        }
        
        return isImmediateNext;
      });

      // Check if next step exists in merchant's configuration
      const nextStepExistsInConfig = manufacturingSteps.some(step => 
        step.is_active && step.step_order === nextStepOrder
      );

      console.log(`  - Immediate next step exists in DB: ${immediateNextStepExists}`);
      console.log(`  - Next step exists in merchant config: ${nextStepExistsInConfig}`);
      
      // Only show if this step is completed AND the immediate next step doesn't exist in DB AND next step exists in config
      const shouldShow = isThisStepCompleted && !immediateNextStepExists && nextStepExistsInConfig;
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

  // CRITICAL FIX: Enhanced handleCardClick with event stopping
  const handleCardClick = (e: React.MouseEvent) => {
    console.log('🚨 CARD CLICK EVENT TRIGGERED');
    console.log('🚨 Target element:', (e.target as HTMLElement).tagName);
    console.log('🚨 Step Name:', data.stepName);
    console.log('🚨 Step Order:', data.stepOrder);
    console.log('🚨 Current Order Step Exists:', !!currentOrderStep);
    
    // Don't open dialog if clicking on the Add Step button
    if ((e.target as HTMLElement).closest('button')) {
      console.log('🚨 Button clicked - preventing card action');
      return;
    }
    
    // FOR MANUFACTURING STEPS: Stop all propagation and handle locally
    if (data.stepOrder > 0 && currentOrderStep) {
      console.log('🚨 MANUFACTURING STEP - STOPPING PROPAGATION');
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      console.log('🚨 Opening StepDetailsDialog for manufacturing step:', currentOrderStep.id);
      setDetailsDialogOpen(true);
      return;
    }
    
    // FOR MANUFACTURING ORDER CARDS: Allow parent handling
    if (data.stepName === 'Manufacturing Order') {
      console.log('🚨 MANUFACTURING ORDER CARD - CALLING PARENT');
      onStepClick?.(data);
      return;
    }
    
    console.log('🚨 NO ACTION TAKEN - step does not exist in database');
  };

  const handleAddStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddStep?.(data);
  };

  const assignedWorkerName = getAssignedWorkerName();
  const configuredFieldValues = getConfiguredFieldValues();

  const cardClassName = data.isJhalaiStep 
    ? "border-blue-500 bg-blue-50 shadow-lg min-w-[280px] cursor-pointer hover:shadow-xl transition-shadow" 
    : "border-border bg-card shadow-md min-w-[280px] cursor-pointer hover:shadow-lg transition-shadow";

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

          {/* Enhanced Debug info for troubleshooting */}
          {data.stepOrder > 0 && (
            <div className="text-xs text-gray-500 bg-gray-100 p-1 rounded">
              <div>OrderStep: {currentOrderStep ? '✅ Found' : '❌ Missing'}</div>
              <div>StepOrder: {data.stepOrder} | OrderID: {data.orderId.slice(-6)}</div>
              <div>Will Open: {currentOrderStep ? 'StepDetailsDialog' : 'Nothing'}</div>
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

      {/* StepDetailsDialog - Only render for manufacturing steps that exist in database */}
      {data.stepOrder > 0 && currentOrderStep && (
        <StepDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={(open) => {
            console.log('🚨 StepDetailsDialog open change:', open, 'for step:', currentOrderStep?.id);
            setDetailsDialogOpen(open);
          }}
          step={currentOrderStep}
          openInEditMode={true} // Always open in edit mode when clicked from card
        />    
      )}
    </>
  );
};

export default ManufacturingStepCard;
