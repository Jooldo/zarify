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
import { StepActionButtons } from './step-details/StepActionButtons';

interface StepDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: Tables<'manufacturing_order_steps'> | null;
}

type StepStatus = 'pending' | 'in_progress' | 'completed' | 'partially_completed';

const StepDetailsDialog: React.FC<StepDetailsDialogProps> = ({ open, onOpenChange, step }) => {
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

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    status: 'pending' as StepStatus,
    fieldValues: {} as Record<string, any>
  });

  // Enhanced debug logging
  console.log('=== StepDetailsDialog Debug ===');
  console.log('Dialog open:', open);
  console.log('Step:', step);
  console.log('Order:', order);
  console.log('IsEditMode:', isEditMode);
  console.log('CurrentStepFields:', step ? stepFields.filter(field => field.manufacturing_step_id === step.manufacturing_step_id) : []);
  console.log('================');

  // Get current step fields for this step
  const currentStepFields = step ? stepFields.filter(field => 
    field.manufacturing_step_id === step.manufacturing_step_id
  ) : [];

  // Initialize edit form data when dialog opens or step changes
  useEffect(() => {
    if (open && step) {
      console.log('Initializing edit form data for step:', step.id);
      const initialFieldValues: Record<string, any> = {};
      if (currentStepFields.length > 0) {
        currentStepFields.forEach(field => {
          const savedValue = getStepValue(step.id, field.field_id);
          initialFieldValues[field.field_id] = savedValue || '';
        });
      }

      setEditFormData({
        status: step.status as StepStatus,
        fieldValues: initialFieldValues
      });
      console.log('Edit form data initialized:', {
        status: step.status,
        fieldValues: initialFieldValues
      });
    }
  }, [open, step?.id, currentStepFields, getStepValue]);

  // Reset edit mode when dialog closes
  useEffect(() => {
    if (!open) {
      console.log('Dialog closed, resetting edit mode');
      setIsEditMode(false);
    }
  }, [open]);

  const handleEditClick = () => {
    console.log('Edit button clicked - setting edit mode to true');
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    console.log('Cancel edit clicked - setting edit mode to false');
    setIsEditMode(false);
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

  if (!step || !order) {
    console.log('No step or order found, not rendering dialog');
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                Step Details: {currentStepDefinition?.step_name || 'Unknown Step'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                Order #{order.order_number} - {order.product_name}
              </DialogDescription>
            </div>
            <Badge className={`${getStepStatusColor(step.status)}`}>
              {step.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Debug Info */}
          <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
            Debug: Edit Mode = {isEditMode ? 'TRUE' : 'FALSE'} | Step ID = {step.id} | Has Fields = {currentStepFields.length}
          </div>

          {/* ALWAYS show Action Buttons when NOT in edit mode */}
          {!isEditMode && (
            <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">Step Actions</h3>
              <StepActionButtons
                isEditMode={isEditMode}
                onEditClick={handleEditClick}
                onStartNextStep={handleStartNextStep}
              />
            </div>
          )}

          {/* Current Step Configuration - Toggle between edit and display */}
          {isEditMode ? (
            <div className="bg-blue-100 border border-blue-300 p-2 rounded">
              <p className="text-blue-800 font-medium mb-2">EDIT MODE ACTIVE</p>
              <StepEditForm
                editFormData={editFormData}
                currentStepFields={currentStepFields}
                isUpdating={isUpdating}
                onFieldValueChange={handleFieldValueChange}
                onStatusChange={handleStatusChange}
                onSave={handleSaveChanges}
                onCancel={handleCancelEdit}
              />
            </div>
          ) : (
            <div className="bg-green-100 border border-green-300 p-2 rounded">
              <p className="text-green-800 font-medium mb-2">DISPLAY MODE ACTIVE</p>
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
