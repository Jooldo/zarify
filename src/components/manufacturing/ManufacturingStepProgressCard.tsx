
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Package, Play, CheckCircle2, Weight, Hash, Type } from 'lucide-react';
import { format } from 'date-fns';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useWorkers } from '@/hooks/useWorkers';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';

interface ManufacturingStepProgressCardProps {
  orderStep: any;
  stepFields: any[];
  manufacturingSteps?: any[];
  onClick?: () => void;
  onNextStepClick?: () => void;
}

const ManufacturingStepProgressCard: React.FC<ManufacturingStepProgressCardProps> = ({
  orderStep,
  stepFields = [],
  manufacturingSteps = [],
  onClick,
  onNextStepClick
}) => {
  const { getStepValue } = useManufacturingStepValues();
  const { workers } = useWorkers();
  const { orderSteps } = useManufacturingSteps();

  console.log('ManufacturingStepProgressCard - orderStep:', orderStep);
  console.log('ManufacturingStepProgressCard - stepFields:', stepFields);

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
    console.log('Getting configured field values for step:', orderStep.id);
    console.log('Available stepFields:', stepFields);
    
    if (!stepFields || stepFields.length === 0) {
      console.log('No stepFields available');
      return [];
    }
    
    const fieldValues = stepFields
      .filter(field => field.field_type !== 'worker' && field.is_required) // Only required fields, exclude worker
      .map(field => {
        let value = 'Not set';
        let displayValue = 'Not set';
        
        // Get value from database
        const savedValue = getStepValue(orderStep.id, field.field_id);
        console.log(`Field ${field.field_id} value:`, savedValue);
        
        if (savedValue !== null && savedValue !== undefined && savedValue !== '') {
          value = savedValue;
          displayValue = savedValue;
          
          // Add unit information from field options
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
    
    console.log('Configured field values:', fieldValues);
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
    console.log('Getting assigned worker name for orderStep:', orderStep);
    console.log('Available workers:', workers);
    
    // First check if there's a worker field in step configuration
    if (stepFields) {
      const workerField = stepFields.find(field => field.field_type === 'worker');
      if (workerField) {
        const workerId = getStepValue(orderStep.id, workerField.field_id);
        console.log('Worker ID from step field:', workerId);
        if (workerId) {
          const worker = workers.find(w => w.id === workerId);
          console.log('Found worker from step field:', worker);
          if (worker) {
            return worker.name;
          }
        }
      }
    }
    
    // Check if there's an assigned_worker_id in the orderStep
    if (orderStep.assigned_worker_id) {
      console.log('Assigned worker ID from orderStep:', orderStep.assigned_worker_id);
      const worker = workers.find(w => w.id === orderStep.assigned_worker_id);
      console.log('Found worker from assigned_worker_id:', worker);
      if (worker) {
        return worker.name;
      }
    }
    
    // Fallback to workers relation if it exists and has name
    if (orderStep.workers?.name) {
      console.log('Using worker name from relation:', orderStep.workers.name);
      return orderStep.workers.name;
    }
    
    console.log('No worker name found');
    return null;
  };

  // Enhanced logic to determine if "Start Next Step" button should show
  const shouldShowNextStepButton = () => {
    // Only show if current step is completed
    if (orderStep.status !== 'completed') {
      return false;
    }

    const currentStepOrder = orderStep.manufacturing_steps?.step_order;
    if (!currentStepOrder) {
      return false;
    }

    // Check if this is the final step by comparing with merchant's configured steps
    const maxStepOrder = Math.max(...manufacturingSteps.filter(s => s.is_active).map(s => s.step_order));
    if (currentStepOrder >= maxStepOrder) {
      console.log('This is the final step, no next step button');
      return false;
    }

    // Find the next step from merchant's configuration
    const nextStep = manufacturingSteps
      .filter(step => step.is_active && step.step_order > currentStepOrder)
      .sort((a, b) => a.step_order - b.step_order)[0];

    if (!nextStep) {
      console.log('No next step found in merchant configuration');
      return false;
    }

    // Check if the next step has already been started for this order
    const nextStepExists = orderSteps.some(step => 
      step.manufacturing_order_id === orderStep.manufacturing_order_id &&
      step.manufacturing_step_id === nextStep.id
    );

    console.log(`Next step (${nextStep.step_name}) already exists:`, nextStepExists);
    
    // Show button only if next step hasn't been started yet
    return !nextStepExists;
  };

  // Get the next step name for button text
  const getNextStepName = () => {
    const currentStepOrder = orderStep.manufacturing_steps?.step_order;
    if (!currentStepOrder) return 'Next Step';

    const nextStep = manufacturingSteps
      .filter(step => step.is_active && step.step_order > currentStepOrder)
      .sort((a, b) => a.step_order - b.step_order)[0];

    return nextStep ? nextStep.step_name : 'Next Step';
  };

  const configuredFieldValues = getConfiguredFieldValues();
  const assignedWorkerName = getAssignedWorkerName();

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when button is clicked
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick?.();
  };

  const handleNextStepClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNextStepClick?.();
  };

  return (
    <Card className="w-80 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCardClick}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">
              {orderStep.manufacturing_steps?.step_name}
              {orderStep.manufacturing_steps?.qc_required && (
                <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-700 border-yellow-300">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  QC
                </Badge>
              )}
            </CardTitle>
            <p className="text-xs text-gray-600">Step {orderStep.manufacturing_steps?.step_order}</p>
          </div>
          <Badge className={`text-xs ${getStatusColor(orderStep.status)}`}>
            {orderStep.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Worker Assignment */}
        {assignedWorkerName && (
          <div className="flex items-center gap-2 text-xs">
            <User className="h-3 w-3 text-gray-500" />
            <span className="text-gray-600">Assigned to:</span>
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

        {/* Timestamps */}
        <div className="space-y-1 text-xs text-gray-600">
          {orderStep.started_at && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
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

        {/* Start Next Step Button */}
        {shouldShowNextStepButton() && (
          <div className="pt-2 border-t">
            <Button 
              onClick={handleNextStepClick}
              className="w-full text-xs h-7 bg-primary hover:bg-primary/90"
            >
              <Play className="h-3 w-3 mr-1" />
              Start {getNextStepName()}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManufacturingStepProgressCard;
