
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Package2, User, Truck } from 'lucide-react';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { ManufacturingStep } from '@/hooks/useManufacturingSteps';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useUpdateManufacturingStep } from '@/hooks/useUpdateManufacturingStep';
import { useWorkers } from '@/hooks/useWorkers';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMerchant } from '@/hooks/useMerchant';

interface StartStepDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: ManufacturingOrder | null;
  step: ManufacturingStep | null;
}

const StartStepDialog: React.FC<StartStepDialogProps> = ({
  isOpen,
  onClose,
  order,
  step
}) => {
  const { stepFields, orderSteps } = useManufacturingSteps();
  const { updateStep } = useUpdateManufacturingStep();
  const { workers } = useWorkers();
  const { merchant } = useMerchant();
  const { toast } = useToast();
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get step ID and ensure it's a string
  const stepId = step?.id ? String(step.id) : null;
  
  const currentStepFields = stepFields.filter(field => {
    const fieldStepId = String(field.manufacturing_step_id);
    return stepId && fieldStepId === stepId;
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen && step && currentStepFields.length > 0) {
      const initialValues: Record<string, any> = {};
      currentStepFields.forEach(field => {
        if (field.field_type === 'status' && field.field_options) {
          initialValues[field.field_id] = field.field_options[0] || '';
        } else {
          initialValues[field.field_id] = '';
        }
      });
      setFieldValues(initialValues);
    } else {
      setFieldValues({});
    }
  }, [isOpen, step, currentStepFields]);

  if (!order || !step) {
    return null;
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    console.log('Field change:', fieldId, value);
    setFieldValues(prev => {
      const updated = {
        ...prev,
        [fieldId]: value
      };
      console.log('Updated field values:', updated);
      return updated;
    });
  };

  const handleStartStep = async () => {
    if (!merchant?.id) {
      toast({
        title: 'Error',
        description: 'Merchant information not available',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if this order step already exists
      let orderStep = orderSteps.find(os => 
        os.manufacturing_order_id === order.id && 
        os.manufacturing_step_id === stepId
      );

      let stepIdForUpdate = orderStep?.id;

      // If no order step exists, create it
      if (!orderStep) {
        const { data: newOrderStep, error: createError } = await supabase
          .from('manufacturing_order_steps')
          .insert({
            manufacturing_order_id: order.id,
            manufacturing_step_id: stepId,
            status: 'in_progress',
            merchant_id: merchant.id,
            started_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        stepIdForUpdate = newOrderStep.id;
      }

      if (stepIdForUpdate) {
        // Update the step with field values
        await updateStep({
          stepId: stepIdForUpdate,
          fieldValues,
          status: 'in_progress',
          progress: 0
        });

        toast({
          title: 'Success',
          description: `${step.step_name} started successfully`,
        });

        onClose();
      }
    } catch (error) {
      console.error('Error starting step:', error);
      toast({
        title: 'Error',
        description: 'Failed to start manufacturing step',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    const value = fieldValues[field.field_id] || '';

    switch (field.field_type) {
      case 'worker':
        return (
          <Select
            value={value}
            onValueChange={(val) => handleFieldChange(field.field_id, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select worker" />
            </SelectTrigger>
            <SelectContent>
              {workers.map(worker => (
                <SelectItem key={worker.id} value={worker.id}>
                  {worker.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.field_id, e.target.value)}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.field_id, e.target.value)}
            placeholder="Enter number"
          />
        );

      case 'status':
        return (
          <Select
            value={value}
            onValueChange={(val) => handleFieldChange(field.field_id, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {field.field_options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'text':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.field_id, e.target.value)}
            placeholder="Enter text"
            rows={3}
          />
        );

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.field_id, e.target.value)}
            placeholder={`Enter ${field.field_label}`}
          />
        );
    }
  };

  // Check if all required fields are filled
  const requiredFields = currentStepFields.filter(field => field.is_required);
  const isFormValid = requiredFields.every(field => {
    const value = fieldValues[field.field_id];
    return value !== undefined && value !== null && value !== '';
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Start {step.step_name}
            <Badge variant="outline" className="ml-2">
              {order.order_number}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package2 className="h-4 w-4" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Product:</span>
                  <div className="font-medium">{order.product_name}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Quantity:</span>
                  <div className="font-medium">{order.quantity_required}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Priority:</span>
                  <Badge variant={order.priority === 'high' || order.priority === 'urgent' ? 'destructive' : 'default'} className="text-xs">
                    {order.priority}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Product Code:</span>
                  <div className="font-mono text-xs">{order.product_configs?.product_code || 'N/A'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Materials Required */}
          {order.product_configs?.product_config_materials && order.product_configs.product_config_materials.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Materials Required
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {order.product_configs.product_config_materials.slice(0, 3).map((material, index) => {
                    const totalRequired = material.quantity_required * order.quantity_required;
                    return (
                      <div key={material.id || index} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {material.raw_materials?.name || `Material #${material.raw_material_id.slice(-6)}`}
                        </span>
                        <span className="font-medium">
                          {totalRequired.toFixed(1)} {material.unit}
                        </span>
                      </div>
                    );
                  })}
                  {order.product_configs.product_config_materials.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center pt-1">
                      +{order.product_configs.product_config_materials.length - 3} more materials
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step Configuration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                {step.step_name} Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {currentStepFields.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No fields configured for this step</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentStepFields.map(field => (
                    <div key={field.field_id} className="space-y-2">
                      <Label htmlFor={field.field_id} className="text-sm flex items-center gap-2">
                        {field.field_label}
                        {field.is_required && (
                          <Badge variant="outline" className="text-xs h-4 px-1">Required</Badge>
                        )}
                      </Label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleStartStep} 
              disabled={!isFormValid || isSubmitting || currentStepFields.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? 'Starting...' : `Start ${step.step_name}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StartStepDialog;
