import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Clock, CheckCircle2, Weight, Hash, Type, Play } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useWorkers } from '@/hooks/useWorkers';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import UpdateStepDialog from './UpdateStepDialog';
import StartStepDialog from './StartStepDialog';

interface StepDetailsCardProps {
  orderStep: any;
  stepFields: any[];
  onViewDetails?: () => void;
}

const StepDetailsCard: React.FC<StepDetailsCardProps> = ({
  orderStep,
  stepFields = [],
  onViewDetails
}) => {
  const { getStepValue } = useManufacturingStepValues();
  const { workers } = useWorkers();
  const { manufacturingSteps, orderSteps } = useManufacturingSteps();
  const { toast } = useToast();
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [startStepDialogOpen, setStartStepDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get configured field values for display - only required fields
  const getConfiguredFieldValues = () => {
    if (!stepFields || stepFields.length === 0) {
      return [];
    }
    
    const fieldValues = stepFields
      .filter(field => field.field_type !== 'worker' && field.is_required)
      .map(field => {
        let value = 'Not set';
        let displayValue = 'Not set';
        
        const savedValue = getStepValue(orderStep.id, field.field_id);
        
        if (savedValue !== null && savedValue !== undefined && savedValue !== '') {
          value = savedValue;
          displayValue = savedValue;
          
          if (field.field_options?.unit) {
            displayValue = `${value} ${field.field_options.unit}`;
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

  // Get assigned worker name
  const getAssignedWorkerName = () => {
    if (stepFields) {
      const workerField = stepFields.find(field => field.field_type === 'worker');
      if (workerField) {
        const workerId = getStepValue(orderStep.id, workerField.field_id);
        if (workerId) {
          const worker = workers.find(w => w.id === workerId);
          if (worker) {
            return worker.name;
          }
        }
      }
    }
    
    if (orderStep.assigned_worker_id) {
      const worker = workers.find(w => w.id === orderStep.assigned_worker_id);
      if (worker) {
        return worker.name;
      }
    }
    
    if (orderStep.workers?.name) {
      return orderStep.workers.name;
    }
    
    return null;
  };

  // Check if there's a next step available - improved logic
  const getNextStepInfo = () => {
    if (!orderStep.manufacturing_steps || !manufacturingSteps.length) return null;
    
    const currentStepOrder = orderStep.manufacturing_steps.step_order;
    
    // Find the next step in the configured manufacturing steps
    const nextStep = manufacturingSteps.find(step => 
      step.step_order === currentStepOrder + 1 && 
      step.is_active && 
      step.merchant_id === orderStep.merchant_id
    );
    
    console.log('Current step order:', currentStepOrder);
    console.log('Looking for next step with order:', currentStepOrder + 1);
    console.log('Available manufacturing steps:', manufacturingSteps);
    console.log('Found next step:', nextStep);
    
    return nextStep;
  };

  // Handle starting the next step - now opens dialog instead of direct creation
  const handleStartNextStep = () => {
    const nextStep = getNextStepInfo();
    console.log('Starting next step:', nextStep);
    console.log('Order step manufacturing_orders:', orderStep.manufacturing_orders);
    setStartStepDialogOpen(true);
  };

  const configuredFieldValues = getConfiguredFieldValues();
  const assignedWorkerName = getAssignedWorkerName();
  const nextStep = getNextStepInfo();
  const isCompleted = orderStep.status === 'completed';

  const handleCardClick = () => {
    setUpdateDialogOpen(true);
  };

  // Create stepData object for UpdateStepDialog with all required properties
  const stepData = {
    stepName: orderStep.manufacturing_steps?.step_name || 'Unknown Step',
    orderNumber: orderStep.manufacturing_orders?.order_number || 'Unknown Order',
    stepFields: stepFields,
    stepOrder: orderStep.manufacturing_steps?.step_order || 0,
    orderId: orderStep.manufacturing_order_id || '',
    productName: orderStep.manufacturing_orders?.product_name || 'Unknown Product',
    status: orderStep.status || 'pending',
    progress: orderStep.progress_percentage || 0
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        id="step-details-input"
        style={{ background: isCompleted ? '#10b981' : '#3b82f6' }}
      />
      <Card 
        className={`w-80 border-l-4 ${
          isCompleted 
            ? 'border-l-green-500 bg-green-50/30' 
            : 'border-l-blue-500 bg-blue-50/30'
        } hover:shadow-lg transition-shadow cursor-pointer`} 
        onClick={handleCardClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className={`text-sm font-semibold ${
                isCompleted ? 'text-green-800' : 'text-blue-800'
              }`}>
                {isCompleted ? 'Completed: ' : 'Step Details: '}{orderStep.manufacturing_steps?.step_name}
                {orderStep.manufacturing_steps?.qc_required && (
                  <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-700 border-yellow-300">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    QC
                  </Badge>
                )}
              </CardTitle>
              <p className={`text-xs ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                Step {orderStep.manufacturing_steps?.step_order}
              </p>
            </div>
            <Badge className={`text-xs ${getStatusColor(orderStep.status)}`}>
              {orderStep.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {/* Progress */}
          {orderStep.progress_percentage > 0 && (
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className={`font-medium ${isCompleted ? 'text-green-700' : 'text-blue-700'}`}>
                  Progress
                </span>
                <span className={`font-semibold ${isCompleted ? 'text-green-800' : 'text-blue-800'}`}>
                  {orderStep.progress_percentage}%
                </span>
              </div>
              <div className={`w-full rounded-full h-2 ${isCompleted ? 'bg-green-100' : 'bg-blue-100'}`}>
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${orderStep.progress_percentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Worker Assignment */}
          {assignedWorkerName && (
            <div className={`flex items-center gap-2 text-xs p-2 rounded ${
              isCompleted ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              <User className={`h-3 w-3 ${isCompleted ? 'text-green-600' : 'text-blue-600'}`} />
              <span className={isCompleted ? 'text-green-600' : 'text-blue-600'}>Assigned to:</span>
              <span className={`font-medium ${isCompleted ? 'text-green-800' : 'text-blue-800'}`}>
                {assignedWorkerName}
              </span>
            </div>
          )}

          {/* Configured Field Values */}
          {configuredFieldValues.length > 0 && (
            <div className="space-y-1">
              <div className={`text-xs font-medium mb-1 ${
                isCompleted ? 'text-green-700' : 'text-blue-700'
              }`}>
                Field Values:
              </div>
              {configuredFieldValues.map((field, index) => (
                <div key={index} className={`flex items-center gap-2 text-xs bg-white p-2 rounded border ${
                  isCompleted ? 'border-green-200' : 'border-blue-200'
                }`}>
                  {getFieldIcon(field.fieldName, field.type)}
                  <span className={`font-medium ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                    {field.label}:
                  </span>
                  <span className={`font-semibold flex-1 ${
                    field.isEmpty 
                      ? 'text-gray-400 italic' 
                      : isCompleted ? 'text-green-800' : 'text-blue-800'
                  }`}>
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Next Step Action for Completed Steps */}
          {isCompleted && nextStep && (
            <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
              <div className="text-xs text-green-700 mb-2">
                Next Step Available: <span className="font-medium">{nextStep.step_name}</span>
              </div>
              <Button
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartNextStep();
                }}
              >
                <Play className="h-3 w-3 mr-1" />
                Start {nextStep.step_name}
              </Button>
            </div>
          )}

          {/* Timestamps */}
          <div className={`space-y-1 text-xs border-t pt-2 ${
            isCompleted 
              ? 'text-green-600 border-green-200' 
              : 'text-blue-600 border-blue-200'
          }`}>
            {orderStep.started_at && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Started: {format(new Date(orderStep.started_at), 'MMM dd, HH:mm')}</span>
              </div>
            )}
            {orderStep.completed_at && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>Completed: {format(new Date(orderStep.completed_at), 'MMM dd, HH:mm')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Update Step Dialog */}
      <UpdateStepDialog
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        stepData={stepData}
        currentOrderStep={orderStep}
        stepFields={stepFields}
        previousSteps={[]} // You may need to pass previous steps if required
      />

      {/* Start Step Dialog for Next Step - Always render when dialog is open */}
      <StartStepDialog
        isOpen={startStepDialogOpen}
        onClose={() => setStartStepDialogOpen(false)}
        order={orderStep.manufacturing_orders}
        step={nextStep}
      />
    </>
  );
};

export default StepDetailsCard;
