
import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Clock, CheckCircle2, Weight, Hash, Type } from 'lucide-react';
import { format } from 'date-fns';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useWorkers } from '@/hooks/useWorkers';
import UpdateStepDialog from './UpdateStepDialog';

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
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

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

  const configuredFieldValues = getConfiguredFieldValues();
  const assignedWorkerName = getAssignedWorkerName();

  const handleCardClick = () => {
    setUpdateDialogOpen(true);
  };

  // Create stepData object for UpdateStepDialog
  const stepData = {
    stepName: orderStep.manufacturing_steps?.step_name || 'Unknown Step',
    orderNumber: orderStep.manufacturing_orders?.order_number || 'Unknown Order',
    stepFields: stepFields
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        id="step-details-input"
        style={{ background: '#3b82f6' }}
      />
      <Card 
        className="w-80 border-l-4 border-l-blue-500 bg-blue-50/30 hover:shadow-lg transition-shadow cursor-pointer" 
        onClick={handleCardClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-blue-800">
                Step Details: {orderStep.manufacturing_steps?.step_name}
                {orderStep.manufacturing_steps?.qc_required && (
                  <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-700 border-yellow-300">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    QC
                  </Badge>
                )}
              </CardTitle>
              <p className="text-xs text-blue-600">Step {orderStep.manufacturing_steps?.step_order}</p>
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
                <span className="text-blue-700 font-medium">Progress</span>
                <span className="text-blue-800 font-semibold">{orderStep.progress_percentage}%</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${orderStep.progress_percentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Worker Assignment */}
          {assignedWorkerName && (
            <div className="flex items-center gap-2 text-xs bg-blue-100 p-2 rounded">
              <User className="h-3 w-3 text-blue-600" />
              <span className="text-blue-600">Assigned to:</span>
              <span className="font-medium text-blue-800">{assignedWorkerName}</span>
            </div>
          )}

          {/* Configured Field Values */}
          {configuredFieldValues.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-blue-700 mb-1">Field Values:</div>
              {configuredFieldValues.map((field, index) => (
                <div key={index} className="flex items-center gap-2 text-xs bg-white p-2 rounded border border-blue-200">
                  {getFieldIcon(field.fieldName, field.type)}
                  <span className="text-blue-600 font-medium">{field.label}:</span>
                  <span className={`font-semibold flex-1 ${field.isEmpty ? 'text-gray-400 italic' : 'text-blue-800'}`}>
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Timestamps */}
          <div className="space-y-1 text-xs text-blue-600 border-t border-blue-200 pt-2">
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
    </>
  );
};

export default StepDetailsCard;
