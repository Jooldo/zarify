
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tables } from '@/integrations/supabase/types';
import { useStepDetailsData } from '@/hooks/useStepDetailsData';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useUpdateManufacturingStep } from '@/hooks/useUpdateManufacturingStep';
import { useCreateManufacturingStep } from '@/hooks/useCreateManufacturingStep';
import { StepDebugLogger } from './debug/StepDebugLogger';
import { PreviousStepsDisplay } from './PreviousStepsDisplay';
import { StepEditForm } from './step-details/StepEditForm';
import { StepDisplayCard } from './step-details/StepDisplayCard';

interface StepDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: Tables<'manufacturing_order_steps'> | null;
  openInEditMode?: boolean; // New prop to control initial mode
}

type StepStatus = 'pending' | 'in_progress' | 'completed' | 'partially_completed';

const StepDetailsDialog: React.FC<StepDetailsDialogProps> = ({ 
  open, 
  onOpenChange, 
  step, 
  openInEditMode = true // Default to edit mode
}) => {
  const {
    order,
    currentStepDefinition,
    currentStepValues,
    previousStepsData,
    isLoading
  } = useStepDetailsData(step);

  const { orderSteps, stepFields, manufacturingSteps } = useManufacturingSteps();
  const { getStepValue } = useManufacturingStepValues();
  const { updateStep, isUpdating } = useUpdateManufacturingStep();
  const { createStep } = useCreateManufacturingStep();

  // Edit mode states - now defaults to edit mode if openInEditMode is true
  const [isEditMode, setIsEditMode] = useState(openInEditMode);
  const [editFormData, setEditFormData] = useState({
    status: 'pending' as StepStatus,
    fieldValues: {} as Record<string, any>
  });

  // Enhanced debug logging
  console.log('=== STEP DETAILS DIALOG DEBUG ===');
  console.log('Dialog open:', open);
  console.log('Open in edit mode:', openInEditMode);
  console.log('Step passed:', !!step);
  console.log('Step ID:', step?.id);
  console.log('Step status:', step?.status);
  console.log('Order found:', !!order);
  console.log('Order number:', order?.order_number);
  console.log('Current step definition:', !!currentStepDefinition);
  console.log('Step name:', currentStepDefinition?.step_name);
  console.log('IsEditMode:', isEditMode);
  console.log('Step fields count:', stepFields.filter(field => field.manufacturing_step_id === step?.manufacturing_step_id).length);
  console.log('==================================');

  // Get current step fields for this step
  const currentStepFields = step ? stepFields.filter(field => 
    field.manufacturing_step_id === step.manufacturing_step_id
  ) : [];

  // Initialize edit form data when dialog opens or step changes
  useEffect(() => {
    if (open && step) {
      console.log('🔄 Initializing edit form data for step:', step.id);
      const initialFieldValues: Record<string, any> = {};
      if (currentStepFields.length > 0) {
        currentStepFields.forEach(field => {
          const savedValue = getStepValue(step.id, field.field_id);
          initialFieldValues[field.field_id] = savedValue || '';
        });
        console.log('📝 Field values loaded:', initialFieldValues);
      }

      setEditFormData({
        status: step.status as StepStatus,
        fieldValues: initialFieldValues
      });
      
      // Set edit mode based on openInEditMode prop
      setIsEditMode(openInEditMode);
      console.log('✅ Edit form data initialized, edit mode set to:', openInEditMode);
    }
  }, [open, step?.id, currentStepFields, getStepValue, openInEditMode]);

  // Reset edit mode when dialog closes
  useEffect(() => {
    if (!open) {
      console.log('🔄 Dialog closed, resetting edit mode');
      setIsEditMode(openInEditMode); // Reset to default
    }
  }, [open, openInEditMode]);

  const handleToggleEditMode = () => {
    console.log('🔄 Toggling edit mode from:', isEditMode, 'to:', !isEditMode);
    setIsEditMode(!isEditMode);
  };

  const handleFieldValueChange = (fieldId: string, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      fieldValues: {
        ...prev.fieldValues,
        [fieldId]: value
      }
    }));
  };

  const handleStatusChange = (value: string) => {
    setEditFormData(prev => ({
      ...prev,
      status: value as StepStatus
    }));
  };

  const handleSaveChanges = async () => {
    if (!step) return;

    const getProgressValue = (status: StepStatus): number => {
      switch (status) {
        case 'completed': return 100;
        case 'in_progress': return 50;
        case 'partially_completed': return 75;
        case 'pending':
        default: return 0;
      }
    };

    const progressValue = getProgressValue(editFormData.status);

    await updateStep({
      stepId: step.id,
      fieldValues: editFormData.fieldValues,
      status: editFormData.status,
      progress: progressValue,
      stepName: currentStepDefinition?.step_name,
      orderNumber: order?.order_number
    });

    setIsEditMode(false);
  };

  const handleStartNextStep = async () => {
    if (!step || !order) return;

    const currentStepOrder = step.step_order;
    const nextStep = manufacturingSteps.find(ms => 
      ms.step_order === currentStepOrder + 1 && ms.is_active
    );

    if (!nextStep) {
      console.log('No next step found');
      return;
    }

    const existingNextStep = orderSteps.find(os => 
      os.manufacturing_order_id === order.id && 
      os.manufacturing_step_id === nextStep.id
    );

    if (existingNextStep) {
      console.log('Next step already exists');
      return;
    }

    await createStep({
      manufacturingOrderId: order.id,
      stepId: nextStep.id,
      fieldValues: {}
    });
  };

  const getStepStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'skipped': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // If no step is provided, don't render the dialog
  if (!step || !order) {
    console.log('❌ No step or order found, not rendering dialog');
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                {isEditMode ? 'Edit Step' : 'Step Details'}: {currentStepDefinition?.step_name || 'Unknown Step'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                Order #{order.order_number} - {order.product_name}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getStepStatusColor(step.status)}`}>
                {step.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleEditMode}
                className="ml-2"
              >
                {isEditMode ? 'View Details' : 'Edit Step'}
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Enhanced Debug Info */}
          <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded border">
            <div className="font-bold text-gray-700 mb-1">🐛 Debug Information:</div>
            <div><strong>Edit Mode:</strong> {isEditMode ? '✅ ENABLED' : '❌ DISABLED'}</div>
            <div><strong>Open in Edit Mode:</strong> {openInEditMode ? '✅ YES' : '❌ NO'}</div>
            <div><strong>Step ID:</strong> {step.id}</div>
            <div><strong>Step Name:</strong> {currentStepDefinition?.step_name}</div>
            <div><strong>Fields Count:</strong> {currentStepFields.length}</div>
            <div><strong>Order:</strong> {order.order_number}</div>
          </div>

          {/* STEP CONTENT - Toggle between edit and display */}
          {isEditMode ? (
            <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <span className="text-green-800 font-medium">✏️ EDIT MODE ACTIVE</span>
                <span className="ml-2 text-xs bg-green-200 px-2 py-1 rounded">Form should be here</span>
              </div>
              <StepEditForm
                editFormData={editFormData}
                currentStepFields={currentStepFields}
                isUpdating={isUpdating}
                onFieldValueChange={handleFieldValueChange}
                onStatusChange={handleStatusChange}
                onSave={handleSaveChanges}
                onCancel={() => setIsEditMode(false)}
              />
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <span className="text-gray-800 font-medium">👁️ DISPLAY MODE ACTIVE</span>
                <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">Read-only view</span>
              </div>
              <StepDisplayCard
                step={step}
                currentStepValues={currentStepValues}
              />
            </div>
          )}

          {/* Previous Steps Data - Only show when not in edit mode */}
          {!isEditMode && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <PreviousStepsDisplay
                previousStepsData={previousStepsData}
                orderNumber={order.order_number}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Action Buttons for starting next step */}
          {!isEditMode && (
            <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-3 flex items-center">
                🎯 Step Actions
              </h3>
              <Button
                onClick={handleStartNextStep}
                className="flex items-center gap-2"
                variant="outline"
                size="sm"
              >
                Start Next Step
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} size="sm">Close</Button>
        </DialogFooter>

        <StepDebugLogger open={open} order={order} step={step} />
      </DialogContent>
    </Dialog>
  );
};

export default StepDetailsDialog;
