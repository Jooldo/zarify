import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package2, Calendar, User, FileText, Calculator, Play, Truck, CheckCircle2, Workflow, ArrowUp } from 'lucide-react';
import { format } from 'date-fns';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import StartStepDialog from './StartStepDialog';
import ManufacturingTagInDialog from './ManufacturingTagInDialog';

interface ManufacturingOrderDetailsDialogProps {
  order: ManufacturingOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  onStatusUpdate?: (orderId: string, status: 'pending' | 'in_progress' | 'completed' | 'qc_failed' | 'cancelled') => void;
}

const ManufacturingOrderDetailsDialog: React.FC<ManufacturingOrderDetailsDialogProps> = ({
  order,
  open,
  onOpenChange,
  getPriorityColor,
  getStatusColor
}) => {
  const { manufacturingSteps, orderSteps, stepFields } = useManufacturingSteps();
  const { stepValues } = useManufacturingStepValues();
  const [startStepDialogOpen, setStartStepDialogOpen] = useState(false);
  const [tagInDialogOpen, setTagInDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<any>(null);

  if (!order) return null;

  // Get the first step that should be started
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
    // Close the dialog to trigger a refresh in the parent component
    onOpenChange(false);
  };

  // Get all order steps for this order with their field data
  const getOrderStepsWithFieldData = () => {
    const currentOrderSteps = orderSteps
      .filter(step => step.manufacturing_order_id === order.id)
      .sort((a, b) => (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0));

    return currentOrderSteps.map(orderStep => {
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

  const orderStepsWithData = getOrderStepsWithFieldData();

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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div>
                <span className="text-xl font-semibold">{order.product_name}</span>
                <p className="text-sm text-muted-foreground font-mono">{order.order_number}</p>
              </div>
              <div className="flex gap-2">
                <Badge className={`${getPriorityColor(order.priority)}`}>
                  {order.priority}
                </Badge>
                <Badge className={`${getStatusColor(order.status)}`}>
                  {order.status.replace('_', ' ')}
                </Badge>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Package2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Quantity</span>
                  </div>
                  <span className="font-semibold">{order.quantity_required}</span>
                </div>
                
                {order.due_date && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Due Date</span>
                    </div>
                    <span className="font-semibold">{format(new Date(order.due_date), 'MMM dd, yyyy')}</span>
                  </div>
                )}
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Created</span>
                  </div>
                  <span className="font-semibold">{format(new Date(order.created_at), 'MMM dd, yyyy')}</span>
                </div>

                {order.product_configs && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calculator className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Product Code</span>
                    </div>
                    <span className="font-semibold font-mono">{order.product_configs.product_code}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Manufacturing Steps Progress */}
            {orderStepsWithData.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Workflow className="h-5 w-5" />
                    Manufacturing Steps Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orderStepsWithData.map((orderStep, index) => (
                    <div key={orderStep.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                            {orderStep.manufacturing_steps?.step_order}
                          </div>
                          <div>
                            <h4 className="font-semibold">{orderStep.manufacturing_steps?.step_name}</h4>
                            {orderStep.manufacturing_steps?.description && (
                              <p className="text-sm text-muted-foreground">{orderStep.manufacturing_steps.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getStepStatusColor(orderStep.status)}`}>
                            {orderStep.status.replace('_', ' ')}
                          </Badge>
                          {orderStep.progress_percentage !== null && (
                            <span className="text-sm font-medium">{orderStep.progress_percentage}%</span>
                          )}
                        </div>
                      </div>

                      {/* Step timing info */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3 text-sm">
                        {orderStep.started_at && (
                          <div>
                            <span className="text-muted-foreground">Started:</span>
                            <p className="font-medium">{format(new Date(orderStep.started_at), 'MMM dd, yyyy HH:mm')}</p>
                          </div>
                        )}
                        {orderStep.completed_at && (
                          <div>
                            <span className="text-muted-foreground">Completed:</span>
                            <p className="font-medium">{format(new Date(orderStep.completed_at), 'MMM dd, yyyy HH:mm')}</p>
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
                          <h5 className="font-medium mb-2 text-sm">Step Data:</h5>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {orderStep.fields.map((field) => (
                              <div key={field.id} className="bg-muted/50 p-2 rounded">
                                <span className="text-xs text-muted-foreground block">{field.field_label}:</span>
                                <span className="text-sm font-medium">
                                  {getFieldValue(field.field_id, orderStep.values)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {orderStep.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <span className="text-xs text-muted-foreground">Notes:</span>
                          <p className="text-sm">{orderStep.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Raw Material Requirements */}
            {order.product_configs?.product_config_materials && order.product_configs.product_config_materials.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Raw Material Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Material</TableHead>
                        <TableHead>Per Unit</TableHead>
                        <TableHead>Total Required</TableHead>
                        <TableHead>Unit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.product_configs.product_config_materials.map((material, index) => {
                        const totalRequired = material.quantity_required * order.quantity_required;
                        
                        return (
                          <TableRow key={material.id || index}>
                            <TableCell className="font-medium">
                              {material.raw_materials?.name || `Material #${material.raw_material_id.slice(-6)}`}
                            </TableCell>
                            <TableCell>{material.quantity_required}</TableCell>
                            <TableCell className="font-semibold">{totalRequired.toFixed(1)}</TableCell>
                            <TableCell>{material.unit}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Special Instructions */}
            {order.special_instructions && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Special Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{order.special_instructions}</p>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center pt-4 border-t">
              {nextStep && !hasStarted && (
                <Button 
                  onClick={handleStartStep}
                  className="bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start {nextStep.step_name}
                </Button>
              )}

              {isCompleted && !isTaggedIn && (
                <Button 
                  onClick={() => setTagInDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Tag In to Inventory
                </Button>
              )}

              {hasStarted && !isCompleted && !isTaggedIn && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Workflow className="h-5 w-5" />
                  <span className="font-medium">Production In Progress</span>
                </div>
              )}

              {isTaggedIn && (
                <div className="flex items-center gap-2 text-purple-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Tagged In to Inventory</span>
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

export default ManufacturingOrderDetailsDialog;
