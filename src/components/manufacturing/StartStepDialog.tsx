
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Package2, User, Truck, Calculator } from 'lucide-react';
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

  // Get fields configured for this step - use step?.id with proper null checking
  const currentStepFields = stepFields.filter(field => 
    step?.id && field.manufacturing_step_id === step.id
  );

  // Debug logging
  useEffect(() => {
    if (step && stepFields.length > 0) {
      console.log('Step Object:', step);
      console.log('Step ID:', step.id);
      console.log('Step Name:', step.step_name);
      console.log('All Step Fields:', stepFields);
      console.log('Filtered Step Fields:', currentStepFields);
      console.log('Filter condition:', step.id, stepFields.map(f => f.manufacturing_step_id));
    }
  }, [step, stepFields, currentStepFields]);

  // Get previous step data for this order
  const previousSteps = orderSteps.filter(orderStep => 
    orderStep.manufacturing_order_id === order?.id && 
    orderStep.status === 'completed'
  ).sort((a, b) => (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0));

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
      console.log('Initial field values:', initialValues);
    }
  }, [isOpen, step, currentStepFields]);

  if (!order || !step) return null;

  const handleFieldChange = (fieldId: string, value: any) => {
    console.log('Field changed:', fieldId, value);
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
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

    console.log('Starting step with field values:', fieldValues);
    setIsSubmitting(true);

    try {
      // Check if this order step already exists
      let orderStep = orderSteps.find(os => 
        os.manufacturing_order_id === order.id && 
        os.manufacturing_step_id === step.id
      );

      let stepId = orderStep?.id;

      // If no order step exists, create it
      if (!orderStep) {
        const { data: newOrderStep, error: createError } = await supabase
          .from('manufacturing_order_steps')
          .insert({
            manufacturing_order_id: order.id,
            manufacturing_step_id: step.id,
            status: 'in_progress',
            merchant_id: merchant.id,
            started_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        stepId = newOrderStep.id;
        console.log('Created new order step:', newOrderStep);
      }

      if (stepId) {
        // Update the step with field values
        await updateStep({
          stepId,
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
  const isFormValid = requiredFields.every(field => 
    fieldValues[field.field_id] && fieldValues[field.field_id] !== ''
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
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
          {/* Debug Information - Remove this in production */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-yellow-800">Debug Info (Dev Only)</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-yellow-700">
                <p>Step ID: {step.id}</p>
                <p>Step Name: {step.step_name}</p>
                <p>Total Step Fields: {stepFields.length}</p>
                <p>Current Step Fields: {currentStepFields.length}</p>
                <p>Required Fields: {requiredFields.length}</p>
                <p>Form Valid: {isFormValid ? 'Yes' : 'No'}</p>
                <p>Fields for this step: {stepFields.filter(f => f.manufacturing_step_id === step.id).length}</p>
              </CardContent>
            </Card>
          )}

          {/* Order Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package2 className="h-5 w-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Product</TableCell>
                    <TableCell>{order.product_name}</TableCell>
                    <TableCell className="font-medium">Quantity</TableCell>
                    <TableCell>{order.quantity_required}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Priority</TableCell>
                    <TableCell>
                      <Badge variant={order.priority === 'high' || order.priority === 'urgent' ? 'destructive' : 'default'}>
                        {order.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">Product Code</TableCell>
                    <TableCell className="font-mono">
                      {order.product_configs?.product_code || 'N/A'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

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

          {/* Previous Steps Data */}
          {previousSteps.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Previous Steps Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Step</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Worker</TableHead>
                      <TableHead>Completed At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previousSteps.map(prevStep => (
                      <TableRow key={prevStep.id}>
                        <TableCell className="font-medium">
                          {prevStep.manufacturing_steps?.step_name || 'Unknown Step'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            {prevStep.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{prevStep.workers?.name || 'N/A'}</TableCell>
                        <TableCell>
                          {prevStep.completed_at ? new Date(prevStep.completed_at).toLocaleDateString() : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Step Configuration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                {step.step_name} Configuration
                <Badge variant="secondary" className="ml-2">
                  {currentStepFields.length} fields configured
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentStepFields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No fields configured for this step</p>
                  <p className="text-sm">Configure fields in Manufacturing Settings to collect data for this step.</p>
                  <div className="mt-4 p-4 bg-gray-50 rounded text-xs">
                    <p><strong>Debug:</strong> Step ID = {step.id}</p>
                    <p>Total fields in system: {stepFields.length}</p>
                    <p>Matching fields: {stepFields.filter(f => f.manufacturing_step_id === step.id).length}</p>
                  </div>
                </div>
              ) : (
                currentStepFields.map(field => (
                  <div key={field.field_id} className="space-y-2">
                    <Label htmlFor={field.field_id} className="flex items-center gap-2">
                      {field.field_label}
                      {field.is_required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                      <Badge variant="outline" className="text-xs capitalize">
                        {field.field_type}
                      </Badge>
                    </Label>
                    {renderField(field)}
                  </div>
                ))
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
