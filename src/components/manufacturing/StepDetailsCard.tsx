import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Clock, CheckCircle2, Weight, Hash, Type, Play, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useWorkers } from '@/hooks/useWorkers';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
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
  const { getStepValue, stepFields: allStepFields } = useManufacturingStepValues();
  const { workers } = useWorkers();
  const { manufacturingSteps, orderSteps } = useManufacturingSteps();
  const { manufacturingOrders } = useManufacturingOrders();
  const { toast } = useToast();
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [startStepDialogOpen, setStartStepDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'blocked': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Get configured field values for display - only visible fields
  const getConfiguredFieldValues = () => {
    // Get the visible fields for this step from allStepFields
    const visibleFields = allStepFields.filter(field => 
      field.step_name === orderStep.step_name && field.is_visible
    );
    
    if (!visibleFields || visibleFields.length === 0) {
      return [];
    }
    
    const fieldValues = visibleFields.map(field => {
      let value = 'Not set';
      let displayValue = 'Not set';
      
      const savedValue = getStepValue(orderStep.id, field.field_key);
      
      if (savedValue !== null && savedValue !== undefined && savedValue !== '') {
        value = savedValue;
        displayValue = savedValue;
        
        if (field.unit) {
          displayValue = `${value} ${field.unit}`;
        }
      }
      
      return {
        label: field.field_key,
        value: displayValue,
        type: 'text',
        isEmpty: value === 'Not set',
        fieldName: field.field_key,
        unit: field.unit || ''
      };
    });
    
    return fieldValues;
  };

  // Get icon for field type
  const getFieldIcon = (fieldName: string, fieldType: string) => {
    if (fieldName.toLowerCase().includes('weight')) {
      return <Weight className="h-3 w-3 text-slate-400" />;
    }
    if (fieldName.toLowerCase().includes('quantity')) {
      return <Hash className="h-3 w-3 text-slate-400" />;
    }
    if (fieldType === 'date') {
      return <Calendar className="h-3 w-3 text-slate-400" />;
    }
    if (fieldType === 'number') {
      return <Hash className="h-3 w-3 text-slate-400" />;
    }
    return <Type className="h-3 w-3 text-slate-400" />;
  };

  // Get assigned worker name
  const getAssignedWorkerName = () => {
    if (orderStep.assigned_worker) {
      const worker = workers.find(w => w.id === orderStep.assigned_worker);
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
    // Find next step based on created order of steps for this merchant
    const nextStep = manufacturingSteps.find(step => 
      step.is_active && 
      step.merchant_id === orderStep.merchant_id &&
      step.step_name !== orderStep.step_name
    );
    
    return nextStep;
  };

  // Get the manufacturing order data
  const getManufacturingOrder = () => {
    const order = manufacturingOrders.find(order => 
      order.id === orderStep.order_id
    );
    
    return order || null;
  };

  // Handle starting the next step - now opens dialog instead of direct creation
  const handleStartNextStep = () => {
    const nextStep = getNextStepInfo();
    const order = getManufacturingOrder();
    console.log('Starting next step:', nextStep);
    console.log('Manufacturing order for dialog:', order);
    setStartStepDialogOpen(true);
  };

  const configuredFieldValues = getConfiguredFieldValues();
  const assignedWorkerName = getAssignedWorkerName();
  const nextStep = getNextStepInfo();
  const manufacturingOrder = getManufacturingOrder();
  const isCompleted = orderStep.status === 'completed';
  const isInProgress = orderStep.status === 'in_progress';

  const handleCardClick = () => {
    setUpdateDialogOpen(true);
  };

  // Group weight and quantity fields for compact display
  const weightAssigned = configuredFieldValues.find(f => f.fieldName === 'weight_assigned');
  const weightReceived = configuredFieldValues.find(f => f.fieldName === 'weight_received');
  const quantityAssigned = configuredFieldValues.find(f => f.fieldName === 'quantity_assigned');
  const quantityReceived = configuredFieldValues.find(f => f.fieldName === 'quantity_received');
  const otherFields = configuredFieldValues.filter(f => 
    !['weight_assigned', 'weight_received', 'quantity_assigned', 'quantity_received'].includes(f.fieldName)
  );

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        id="step-details-input"
        style={{ background: isCompleted ? '#10b981' : '#3b82f6', border: 'none', width: 8, height: 8 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="step-details-output"
        style={{ background: isCompleted ? '#10b981' : '#3b82f6', border: 'none', width: 8, height: 8 }}
      />
      <Card 
        className={`w-80 border-l-2 ${
          isCompleted 
            ? 'border-l-emerald-400 bg-gradient-to-r from-emerald-50/30 to-white border-emerald-100' 
            : 'border-l-blue-400 bg-gradient-to-r from-blue-50/30 to-white border-blue-100'
        } hover:shadow-md transition-shadow cursor-pointer shadow-sm`} 
        onClick={handleCardClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className={`text-sm font-medium text-slate-700 flex items-center gap-2`}>
                {orderStep.step_name}
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Step Order: {orderStep.created_at ? format(new Date(orderStep.created_at), 'MMM dd') : 'N/A'}
              </p>
            </div>
            <Badge className={`text-xs border ${getStatusColor(orderStep.status)}`}>
              {orderStep.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          
          {/* Worker Assignment */}
          {assignedWorkerName && (
            <div className={`flex items-center gap-2 text-xs p-2 rounded-md border ${
              isCompleted ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'
            }`}>
              <User className={`h-3 w-3 ${isCompleted ? 'text-emerald-500' : 'text-blue-500'}`} />
              <span className="text-slate-600">Assigned to:</span>
              <span className={`font-medium ${isCompleted ? 'text-emerald-700' : 'text-blue-700'}`}>
                {assignedWorkerName}
              </span>
            </div>
          )}

          {/* Configured Field Values - Compact Display */}
          {configuredFieldValues.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-600">Field Values:</div>
              
              {/* Weight fields side by side */}
              {(weightAssigned || weightReceived) && (
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {weightAssigned && (
                    <div className={`bg-white p-2 rounded-md border ${
                      isCompleted ? 'border-emerald-100' : 'border-blue-100'
                    }`}>
                      <div className="flex items-center gap-1">
                        {getFieldIcon(weightAssigned.fieldName, weightAssigned.type)}
                        <span className="font-medium text-slate-600 text-xs">Wt Assigned:</span>
                      </div>
                      <span className={`font-medium ${
                        weightAssigned.isEmpty ? 'text-slate-400 italic' : 'text-slate-700'
                      }`}>
                        {weightAssigned.value}
                      </span>
                    </div>
                  )}
                  
                  {weightReceived && (
                    <div className={`bg-white p-2 rounded-md border ${
                      isCompleted ? 'border-emerald-100' : 'border-blue-100'
                    }`}>
                      <div className="flex items-center gap-1">
                        {getFieldIcon(weightReceived.fieldName, weightReceived.type)}
                        <span className="font-medium text-slate-600 text-xs">Wt Received:</span>
                      </div>
                      <span className={`font-medium ${
                        weightReceived.isEmpty ? 'text-slate-400 italic' : 'text-slate-700'
                      }`}>
                        {weightReceived.value}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Quantity fields side by side */}
              {(quantityAssigned || quantityReceived) && (
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {quantityAssigned && (
                    <div className={`bg-white p-2 rounded-md border ${
                      isCompleted ? 'border-emerald-100' : 'border-blue-100'
                    }`}>
                      <div className="flex items-center gap-1">
                        {getFieldIcon(quantityAssigned.fieldName, quantityAssigned.type)}
                        <span className="font-medium text-slate-600 text-xs">Qty Assigned:</span>
                      </div>
                      <span className={`font-medium ${
                        quantityAssigned.isEmpty ? 'text-slate-400 italic' : 'text-slate-700'
                      }`}>
                        {quantityAssigned.value}
                      </span>
                    </div>
                  )}
                  
                  {quantityReceived && (
                    <div className={`bg-white p-2 rounded-md border ${
                      isCompleted ? 'border-emerald-100' : 'border-blue-100'
                    }`}>
                      <div className="flex items-center gap-1">
                        {getFieldIcon(quantityReceived.fieldName, quantityReceived.type)}
                        <span className="font-medium text-slate-600 text-xs">Qty Received:</span>
                      </div>
                      <span className={`font-medium ${
                        quantityReceived.isEmpty ? 'text-slate-400 italic' : 'text-slate-700'
                      }`}>
                        {quantityReceived.value}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Other fields */}
              {otherFields.map((field, index) => (
                <div key={index} className={`flex items-center gap-2 text-xs bg-white p-2 rounded-md border ${
                  isCompleted ? 'border-emerald-100' : 'border-blue-100'
                }`}>
                  {getFieldIcon(field.fieldName, field.type)}
                  <span className="font-medium text-slate-600">{field.label}:</span>
                  <span className={`font-medium flex-1 ${
                    field.isEmpty ? 'text-slate-400 italic' : 'text-slate-700'
                  }`}>
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons for Completed and In Progress Steps */}
          {(isCompleted || isInProgress) && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {/* Next Step Button */}
              {nextStep && (
                <Button
                  size="sm"
                  className={`w-full shadow-sm ${
                    isCompleted 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartNextStep();
                  }}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Start {nextStep.step_name}
                </Button>
              )}
            </div>
          )}

          {/* Timestamps */}
          <div className={`space-y-1 text-xs border-t pt-2 text-slate-500 ${
            isCompleted ? 'border-emerald-100' : 'border-blue-100'
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
        step={orderStep}
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        onStepUpdate={() => {}}
      />

      {/* Start Step Dialog for Next Step - Always render when dialog is open */}
      <StartStepDialog
        isOpen={startStepDialogOpen}
        onClose={() => setStartStepDialogOpen(false)}
        order={manufacturingOrder}
        step={nextStep}
      />
    </>
  );
};

export default StepDetailsCard;
