
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Package, Play, CheckCircle2, Weight, Hash, Type } from 'lucide-react';
import { format } from 'date-fns';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useWorkers } from '@/hooks/useWorkers';

interface ManufacturingStepProgressCardProps {
  orderStep: any;
  stepFields: any[]; // Add stepFields prop
  onClick?: () => void;
  onNextStepClick?: () => void;
}

const ManufacturingStepProgressCard: React.FC<ManufacturingStepProgressCardProps> = ({
  orderStep,
  stepFields = [], // Default to empty array
  onClick,
  onNextStepClick
}) => {
  const { getStepValue } = useManufacturingStepValues();
  const { workers } = useWorkers();

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

  // Get configured field values for display - exclude text fields and show units
  const getConfiguredFieldValues = () => {
    console.log('Getting configured field values for step:', orderStep.id);
    console.log('Available stepFields:', stepFields);
    
    if (!stepFields || stepFields.length === 0) {
      console.log('No stepFields available');
      return [];
    }
    
    const fieldValues = stepFields
      .filter(field => 
        field.field_type !== 'worker' && 
        field.field_type !== 'text' && 
        field.field_type !== 'textarea'
      ) // Exclude worker and text fields
      .map(field => {
        let value = 'Not set';
        let displayValue = 'Not set';
        
        // Get value from database
        const savedValue = getStepValue(orderStep.id, field.field_id);
        console.log(`Field ${field.field_id} value:`, savedValue);
        
        if (savedValue !== null && savedValue !== undefined && savedValue !== '') {
          value = savedValue;
          // Add unit to display value if available
          if (field.field_options?.unit) {
            displayValue = `${savedValue} ${field.field_options.unit}`;
          } else {
            displayValue = savedValue;
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
    // First check if there's a worker field in step configuration
    if (stepFields) {
      const workerField = stepFields.find(field => field.field_type === 'worker');
      if (workerField) {
        const workerId = getStepValue(orderStep.id, workerField.field_id);
        if (workerId) {
          const worker = workers.find(w => w.id === workerId);
          return worker?.name;
        }
      }
    }
    
    // Fallback to assigned worker from order step
    return orderStep.workers?.name;
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
    <Card className="w-72 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCardClick}>
      <CardHeader className="pb-1 p-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xs font-semibold">
              {orderStep.manufacturing_steps?.step_name}
              {orderStep.manufacturing_steps?.qc_required && (
                <Badge variant="secondary" className="ml-1 bg-yellow-100 text-yellow-700 border-yellow-300 text-xs">
                  <CheckCircle2 className="w-2 h-2 mr-1" />
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

      <CardContent className="space-y-1 p-2 pt-0">
        {/* Worker Assignment */}
        {assignedWorkerName && (
          <div className="flex items-center gap-1 text-xs">
            <User className="h-3 w-3 text-gray-500" />
            <span className="text-gray-600">Assigned to:</span>
            <span className="font-medium truncate">{assignedWorkerName}</span>
          </div>
        )}

        {/* Configured Field Values - Show units */}
        {configuredFieldValues.length > 0 && (
          <div className="space-y-1">
            {configuredFieldValues.slice(0, 3).map((field, index) => (
              <div key={index} className="flex items-center gap-1 text-xs bg-gray-50 p-1 rounded">
                {getFieldIcon(field.fieldName, field.type)}
                <span className="text-muted-foreground font-medium">{field.label}:</span>
                <span className={`font-semibold flex-1 truncate ${field.isEmpty ? 'text-muted-foreground italic' : 'text-gray-900'}`}>
                  {field.value}
                </span>
              </div>
            ))}
            {configuredFieldValues.length > 3 && (
              <div className="text-xs text-muted-foreground text-center">
                +{configuredFieldValues.length - 3} more fields
              </div>
            )}
          </div>
        )}

        {/* Timestamps */}
        <div className="space-y-1 text-xs text-gray-600">
          {orderStep.started_at && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Started: {format(new Date(orderStep.started_at), 'MMM dd, HH:mm')}</span>
            </div>
          )}
          {orderStep.completed_at && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Completed: {format(new Date(orderStep.completed_at), 'MMM dd, HH:mm')}</span>
            </div>
          )}
        </div>

        {/* Next Step Button for completed steps */}
        {orderStep.status === 'completed' && (
          <div className="pt-1 border-t">
            <Button 
              onClick={handleNextStepClick}
              className="w-full text-xs h-6 bg-primary hover:bg-primary/90"
            >
              <Play className="h-3 w-3 mr-1" />
              Start Next Step
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManufacturingStepProgressCard;
