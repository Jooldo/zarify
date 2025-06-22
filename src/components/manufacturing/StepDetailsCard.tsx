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
import CreateChildOrderDialog from './CreateChildOrderDialog';

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
  const { manufacturingOrders } = useManufacturingOrders();
  const { toast } = useToast();
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [startStepDialogOpen, setStartStepDialogOpen] = useState(false);
  const [showReworkDialog, setShowReworkDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'blocked': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
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

  // Get the manufacturing order data
  const getManufacturingOrder = () => {
    if (orderStep.manufacturing_orders) {
      return orderStep.manufacturing_orders;
    }
    
    // If not available in orderStep, find it from manufacturingOrders
    const order = manufacturingOrders.find(order => 
      order.id === orderStep.manufacturing_order_id
    );
    
    console.log('Found manufacturing order:', order);
    console.log('Order step manufacturing_order_id:', orderStep.manufacturing_order_id);
    console.log('Available manufacturing orders:', manufacturingOrders);
    
    return order || null;
  };

  // Handle starting the next step - pass sourceStepId for batch creation from specific steps
  const handleStartNextStep = () => {
    const nextStep = getNextStepInfo();
    const order = getManufacturingOrder();
    console.log('Starting next step:', nextStep);
    console.log('Manufacturing order for dialog:', order);
    
    // For certain step transitions (like Jhalai to Dhol), we want to create a new batch
    // instead of updating an existing step
    const shouldCreateBatch = orderStep.manufacturing_steps?.step_name === 'Jhalai' && 
                              nextStep?.step_name === 'Dhol';
    
    if (shouldCreateBatch) {
      console.log('Creating new batch from Jhalai to Dhol');
      // Pass the current order step ID as sourceStepId for batch creation
      setStartStepDialogOpen(true);
    } else {
      setStartStepDialogOpen(true);
    }
  };

  // Handle setup rework
  const handleSetupRework = () => {
    setShowReworkDialog(true);
  };

  // Handle rework success
  const handleReworkSuccess = () => {
    setShowReworkDialog(false);
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

  // Create stepData object for UpdateStepDialog with all required properties and correct order number
  const stepData = {
    stepName: orderStep.manufacturing_steps?.step_name || 'Unknown Step',
    orderNumber: manufacturingOrder?.order_number || 'Loading...',
    stepFields: stepFields,
    stepOrder: orderStep.manufacturing_steps?.step_order || 0,
    orderId: orderStep.manufacturing_order_id || '',
    productName: manufacturingOrder?.product_name || 'Unknown Product',
    status: orderStep.status || 'pending',
    progress: orderStep.progress_percentage || 0
  };

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
                {orderStep.manufacturing_steps?.step_name}
                {orderStep.manufacturing_steps?.qc_required && (
                  <Badge variant="secondary" className="bg-yellow-50 text-yellow-600 border-yellow-200 text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    QC
                  </Badge>
                )}
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Step {orderStep.manufacturing_steps?.step_order}
              </p>
            </div>
            <Badge className={`text-xs border ${getStatusColor(orderStep.status)}`}>
              {orderStep.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          
          {/* Progress */}
          {orderStep.progress_percentage > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="font-medium text-slate-600">Progress</span>
                <span className={`font-semibold ${isCompleted ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {orderStep.progress_percentage}%
                </span>
              </div>
              <div className={`w-full rounded-full h-2 ${isCompleted ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-emerald-400' : 'bg-blue-400'
                  }`}
                  style={{ width: `${orderStep.progress_percentage}%` }}
                ></div>
              </div>
            </div>
          )}

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

          {/* Configured Field Values */}
          {configuredFieldValues.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-600">Field Values:</div>
              {configuredFieldValues.map((field, index) => (
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
              {/* Rework Button - now always available for completed/in-progress steps */}
              <Button
                size="sm"
                variant="outline"
                className={`w-full ${
                  isCompleted 
                    ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50' 
                    : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSetupRework();
                }}
              >
                <Wrench className="h-3 w-3 mr-1" />
                Setup Rework
              </Button>
              
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
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        stepData={stepData}
        currentOrderStep={orderStep}
        stepFields={stepFields}
        previousSteps={[]} // You may need to pass previous steps if required
      />
      
      {/* Start Step Dialog for Next Step - Pass sourceStepId for batch creation */}
      <StartStepDialog
        isOpen={startStepDialogOpen}
        onClose={() => setStartStepDialogOpen(false)}
        order={manufacturingOrder}
        step={nextStep}
        sourceStepId={
          orderStep.manufacturing_steps?.step_name === 'Jhalai' && 
          nextStep?.step_name === 'Dhol' 
            ? orderStep.id 
            : undefined
        }
      />

      {/* Rework Dialog */}
      {showReworkDialog && orderStep.manufacturing_steps && manufacturingOrder && (
        <CreateChildOrderDialog
          isOpen={showReworkDialog}
          onClose={() => setShowReworkDialog(false)}
          parentOrder={manufacturingOrder}
          currentStep={orderStep.manufacturing_steps}
          parentOrderStep={orderStep}
          onSuccess={handleReworkSuccess}
        />
      )}
    </>
  );
};

export default StepDetailsCard;
