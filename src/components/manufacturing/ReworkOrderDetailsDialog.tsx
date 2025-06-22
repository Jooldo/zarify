
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package2, Calendar, User, FileText, Calculator, Play, CheckCircle2, Workflow, ArrowUp, GitBranch } from 'lucide-react';
import { format } from 'date-fns';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useWorkers } from '@/hooks/useWorkers';
import StartStepDialog from './StartStepDialog';
import ManufacturingTagInDialog from './ManufacturingTagInDialog';

interface ReworkOrderDetailsDialogProps {
  order: ManufacturingOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
}

const ReworkOrderDetailsDialog: React.FC<ReworkOrderDetailsDialogProps> = ({
  order,
  open,
  onOpenChange,
  getPriorityColor,
  getStatusColor
}) => {
  const { manufacturingSteps, orderSteps, stepFields } = useManufacturingSteps();
  const { stepValues } = useManufacturingStepValues();
  const { workers } = useWorkers();
  const [startStepDialogOpen, setStartStepDialogOpen] = useState(false);
  const [tagInDialogOpen, setTagInDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<any>(null);

  if (!order || !order.parent_order_id) return null;

  // Extract origin information from special instructions
  const originOrderNumber = order.special_instructions?.split(' - ')[0]?.replace('Rework from ', '');
  const originStepName = order.special_instructions?.split(' - Step ')[1]?.split(' ')[0];

  const getNextStep = () => {
    const currentOrderSteps = orderSteps.filter(step => step.manufacturing_order_id === order.id);
    
    if (currentOrderSteps.length === 0) {
      // No steps exist, get the first manufacturing step
      return manufacturingSteps
        .filter(step => step.is_active)
        .sort((a, b) => a.step_order - b.step_order)[0];
    }
    
    // Find the next pending step
    const nextPendingStep = currentOrderSteps
      .filter(step => step.status === 'pending')
      .sort((a, b) => (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0))[0];
    
    return nextPendingStep?.manufacturing_steps;
  };

  const nextStep = getNextStep();
  const hasStarted = orderSteps.some(step => step.manufacturing_order_id === order.id && step.status !== 'pending');
  const isCompleted = order.status === 'completed';
  const isTaggedIn = order.status === 'tagged_in';

  const handleStartStep = () => {
    if (nextStep) {
      setSelectedStep(nextStep);
      setStartStepDialogOpen(true);
    }
  };

  const handleTagInComplete = () => {
    onOpenChange(false);
  };

  // Get only the rework order's own steps (not parent order steps)
  const getReworkOrderStepsWithFieldData = () => {
    const reworkOrderSteps = orderSteps
      .filter(step => step.manufacturing_order_id === order.id)
      .sort((a, b) => (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0));

    return reworkOrderSteps.map(orderStep => {
      const stepStepFields = stepFields.filter(field => 
        field.manufacturing_step_id === orderStep.manufacturing_step_id
      );
      
      const stepStepValues = stepValues.filter(value => 
        value.manufacturing_order_step_id === orderStep.id
      );

      return {
        ...orderStep,
        fields: stepStepFields,
        values: stepStepValues
      };
    });
  };

  const reworkOrderStepsWithData = getReworkOrderStepsWithFieldData();

  const getStepStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'skipped': return 'bg-yellow-100 text-yellow-800';
      case 'tagged_in': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFieldValue = (fieldId: string, values: any[]) => {
    const value = values.find(v => v.field_id === fieldId);
    return value?.field_value || '-';
  };

  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : 'Unknown Worker';
  };

  const getDisplayValue = (field: any, fieldValue: string) => {
    if (field.field_type === 'worker' && fieldValue && fieldValue !== '-') {
      return getWorkerName(fieldValue);
    }
    return fieldValue;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-orange-600" />
                  <span className="text-lg font-semibold text-orange-700">Rework Order</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-semibold">{order.product_name}</span>
                  <p className="text-sm text-muted-foreground font-mono">{order.order_number}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className={`text-xs ${getPriorityColor(order.priority)}`}>
                  {order.priority}
                </Badge>
                <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                  {order.status.replace('_', ' ')}
                </Badge>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Origin Information */}
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-orange-800">
                  <GitBranch className="h-4 w-4" />
                  Rework Origin
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs text-orange-600 font-medium">Original Order:</span>
                    </div>
                    <span className="font-semibold text-orange-900">{originOrderNumber || 'Unknown'}</span>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs text-orange-600 font-medium">Origin Step:</span>
                    </div>
                    <span className="font-semibold text-orange-900">{originStepName || 'Unknown'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Package2 className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Quantity</span>
                    </div>
                    <span className="font-semibold">{order.quantity_required}</span>
                  </div>
                  
                  {order.due_date && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Due Date</span>
                      </div>
                      <span className="font-semibold text-xs">{format(new Date(order.due_date), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Created</span>
                    </div>
                    <span className="font-semibold text-xs">{format(new Date(order.created_at), 'MMM dd, yyyy')}</span>
                  </div>

                  {order.product_configs && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Calculator className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Product Code</span>
                      </div>
                      <span className="font-semibold font-mono text-xs">{order.product_configs.product_code}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Rework Order Manufacturing Steps Progress (only this rework order's steps) */}
            {reworkOrderStepsWithData.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Workflow className="h-4 w-4" />
                    Rework Manufacturing Steps Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {reworkOrderStepsWithData.map((orderStep, index) => (
                    <div key={orderStep.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                            {orderStep.manufacturing_steps?.step_order}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{orderStep.manufacturing_steps?.step_name}</h4>
                            {orderStep.manufacturing_steps?.description && (
                              <p className="text-xs text-muted-foreground">{orderStep.manufacturing_steps.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getStepStatusColor(orderStep.status)}`}>
                            {orderStep.status.replace('_', ' ')}
                          </Badge>
                          {orderStep.progress_percentage !== null && (
                            <span className="text-xs font-medium">{orderStep.progress_percentage}%</span>
                          )}
                        </div>
                      </div>

                      {/* Step timing info */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-2 text-xs">
                        {orderStep.started_at && (
                          <div>
                            <span className="text-muted-foreground">Started:</span>
                            <p className="font-medium">{format(new Date(orderStep.started_at), 'MMM dd, HH:mm')}</p>
                          </div>
                        )}
                        {orderStep.completed_at && (
                          <div>
                            <span className="text-muted-foreground">Completed:</span>
                            <p className="font-medium">{format(new Date(orderStep.completed_at), 'MMM dd, HH:mm')}</p>
                          </div>
                        )}
                        {orderStep.workers?.name && (
                          <div>
                            <span className="text-muted-foreground">Assigned Worker:</span>
                            <p className="font-medium">{orderStep.workers.name}</p>
                          </div>
                        )}
                      </div>

                      {/* Step field data */}
                      {orderStep.fields.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-1 text-xs">Step Data:</h5>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {orderStep.fields.map((field) => {
                              const fieldValue = getFieldValue(field.id, orderStep.values);
                              const displayValue = getDisplayValue(field, fieldValue);
                              
                              return (
                                <div key={field.id} className="bg-muted/50 p-2 rounded text-xs">
                                  <span className="text-muted-foreground block">{field.field_label}:</span>
                                  <span className="font-medium">
                                    {displayValue}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {orderStep.notes && (
                        <div className="mt-2 pt-2 border-t">
                          <span className="text-xs text-muted-foreground">Notes:</span>
                          <p className="text-xs">{orderStep.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Special Instructions */}
            {order.special_instructions && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Special Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm">{order.special_instructions}</p>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center pt-3 border-t">
              {nextStep && !hasStarted && (
                <Button 
                  onClick={handleStartStep}
                  className="bg-primary hover:bg-primary/90"
                  size="default"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start {nextStep.step_name}
                </Button>
              )}

              {isCompleted && !isTaggedIn && (
                <Button 
                  onClick={() => setTagInDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="default"
                >
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Tag In to Inventory
                </Button>
              )}

              {hasStarted && !isCompleted && !isTaggedIn && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Workflow className="h-4 w-4" />
                  <span className="font-medium text-sm">Production In Progress</span>
                </div>
              )}

              {isTaggedIn && (
                <div className="flex items-center gap-2 text-purple-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium text-sm">Tagged In to Inventory</span>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <StartStepDialog
        isOpen={startStepDialogOpen}
        onClose={() => setStartStepDialogOpen(false)}
        order={order}
        step={selectedStep}
      />

      <ManufacturingTagInDialog
        order={order}
        open={tagInDialogOpen}
        onOpenChange={setTagInDialogOpen}
        onTagInComplete={handleTagInComplete}
      />
    </>
  );
};

export default ReworkOrderDetailsDialog;
