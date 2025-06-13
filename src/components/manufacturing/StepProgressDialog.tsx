
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Calendar, Package, CheckCircle2, Clock, AlertCircle, Edit3, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { ManufacturingOrderStep } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useUpdateManufacturingStep } from '@/hooks/useUpdateManufacturingStep';
import { useWorkers } from '@/hooks/useWorkers';

interface StepProgressDialogProps {
  order: ManufacturingOrder | null;
  orderSteps: ManufacturingOrderStep[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StepProgressDialog: React.FC<StepProgressDialogProps> = ({
  order,
  orderSteps,
  open,
  onOpenChange
}) => {
  const { getStepValues } = useManufacturingStepValues();
  const { updateStep, isUpdating } = useUpdateManufacturingStep();
  const { workers } = useWorkers();
  
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const [editStatus, setEditStatus] = useState<string>('');
  const [editProgress, setEditProgress] = useState<number>(0);

  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'partially_completed': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'partially_completed': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'blocked': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  // Sort steps by step order
  const sortedSteps = [...orderSteps].sort((a, b) => 
    (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0)
  );

  const handleEditStart = (step: ManufacturingOrderStep) => {
    const stepValues = getStepValues(step.id);
    const initialValues: Record<string, any> = {};
    
    stepValues.forEach(value => {
      initialValues[value.field_id] = value.field_value;
    });

    setEditingStep(step.id);
    setEditValues(initialValues);
    setEditStatus(step.status);
    setEditProgress(step.progress_percentage || 0);
  };

  const handleEditCancel = () => {
    setEditingStep(null);
    setEditValues({});
    setEditStatus('');
    setEditProgress(0);
  };

  const handleEditSave = () => {
    if (!editingStep) return;

    updateStep({
      stepId: editingStep,
      fieldValues: editValues,
      status: editStatus,
      progress: editProgress
    });

    setEditingStep(null);
    setEditValues({});
    setEditStatus('');
    setEditProgress(0);
  };

  const handleFieldValueChange = (fieldId: string, value: string) => {
    setEditValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <span className="text-xl font-semibold">Manufacturing Progress</span>
              <p className="text-sm text-muted-foreground font-mono">{order.order_number} - {order.product_name}</p>
            </div>
            <Badge className="bg-blue-100 text-blue-800">
              {sortedSteps.filter(s => s.status === 'completed').length} / {sortedSteps.length} Steps
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {sortedSteps.map((step, index) => {
            const stepValues = getStepValues(step.id);
            const assignedWorker = step.workers?.name || 
              (step.assigned_worker_id ? workers.find(w => w.id === step.assigned_worker_id)?.name : null);
            
            const isEditing = editingStep === step.id;

            return (
              <Card key={step.id} className="relative">
                {/* Progress Line */}
                {index < sortedSteps.length - 1 && (
                  <div className="absolute left-6 top-16 w-px h-8 bg-gray-200 z-0" />
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-3">
                      <div className="relative z-10 bg-white">
                        {getStatusIcon(step.status)}
                      </div>
                      <span>{step.manufacturing_steps?.step_name || 'Unknown Step'}</span>
                      <Badge variant="outline" className="text-xs">
                        Step {step.manufacturing_steps?.step_order || index + 1}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(step.status)}`}>
                        {step.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {step.status === 'in_progress' && !isEditing && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditStart(step)}
                          className="h-7 px-2"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-blue-900">Editing Step</h4>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleEditSave} disabled={isUpdating}>
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleEditCancel}>
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Status</Label>
                          <Select value={editStatus} onValueChange={setEditStatus}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="partially_completed">Partially Completed</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="blocked">Blocked</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Progress (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={editProgress}
                            onChange={(e) => setEditProgress(Number(e.target.value))}
                          />
                        </div>

                        <div>
                          <Label>Weight Assigned (kg)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={editValues.weight_assigned || ''}
                            onChange={(e) => handleFieldValueChange('weight_assigned', e.target.value)}
                            placeholder="Enter weight assigned"
                          />
                        </div>

                        <div>
                          <Label>Weight Received (kg)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={editValues.weight_received || ''}
                            onChange={(e) => handleFieldValueChange('weight_received', e.target.value)}
                            placeholder="Enter weight received"
                          />
                        </div>

                        <div>
                          <Label>Quantity Assigned</Label>
                          <Input
                            type="number"
                            value={editValues.quantity_assigned || ''}
                            onChange={(e) => handleFieldValueChange('quantity_assigned', e.target.value)}
                            placeholder="Enter quantity assigned"
                          />
                        </div>

                        <div>
                          <Label>Quantity Received</Label>
                          <Input
                            type="number"
                            value={editValues.quantity_received || ''}
                            onChange={(e) => handleFieldValueChange('quantity_received', e.target.value)}
                            placeholder="Enter quantity received"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Basic Step Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {assignedWorker && (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Assigned Worker</span>
                            </div>
                            <span className="font-medium">{assignedWorker}</span>
                          </div>
                        )}
                        
                        {step.progress_percentage > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Progress</span>
                            </div>
                            <span className="font-medium">{step.progress_percentage}%</span>
                          </div>
                        )}

                        {step.started_at && (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Started</span>
                            </div>
                            <span className="font-medium">{format(new Date(step.started_at), 'MMM dd, HH:mm')}</span>
                          </div>
                        )}

                        {step.completed_at && (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Completed</span>
                            </div>
                            <span className="font-medium">{format(new Date(step.completed_at), 'MMM dd, HH:mm')}</span>
                          </div>
                        )}
                      </div>

                      {/* Step Field Values */}
                      {stepValues.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-medium mb-2">Step Details</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {stepValues.map((value) => (
                                <div key={value.id} className="space-y-1">
                                  <span className="text-sm text-muted-foreground capitalize">
                                    {value.field_id.replace('_', ' ')}:
                                  </span>
                                  <div className="font-medium text-sm">{value.field_value}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Notes */}
                      {step.notes && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-medium mb-2">Notes</h4>
                            <p className="text-sm text-muted-foreground">{step.notes}</p>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {sortedSteps.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No manufacturing steps have been started yet.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StepProgressDialog;
