import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import { Tables } from '@/integrations/supabase/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StepDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: Tables<'manufacturing_order_steps'> | null;
}

const StepDetailsDialog: React.FC<StepDetailsDialogProps> = ({ open, onOpenChange, step }) => {
  const { manufacturingSteps, orderSteps, getStepFields, isLoading: isLoadingStepsData } = useManufacturingSteps();
  const { getStepValue, isLoading: isLoadingValues } = useManufacturingStepValues();
  const { manufacturingOrders } = useManufacturingOrders();

  const order = useMemo(() => {
    if (!step) return null;
    return manufacturingOrders.find(o => o.id === step.manufacturing_order_id) || null;
  }, [step, manufacturingOrders]);

  // Debug: Log all related order steps and step IDs for this order
  React.useEffect(() => {
    if (order) {
      // Show all orderSteps for this order in the console for debug
      const orderStepsForOrder = orderSteps.filter(os => os.manufacturing_order_id === order.id);
      console.log('[DEBUG] Order:', order);
      console.log('[DEBUG] All orderSteps for order:', orderStepsForOrder);
      console.log('[DEBUG] All manufacturingSteps:', manufacturingSteps);
    }
  }, [order, orderSteps, manufacturingSteps]);

  const previousStepsData = useMemo(() => {
    if (!step || !order || !manufacturingSteps.length || !orderSteps.length) {
      return [];
    }

    const currentStepDefinition = manufacturingSteps.find(s => s.id === step.manufacturing_step_id);
    if (!currentStepDefinition) return [];

    // Find all previous steps with lower step_order for current merchant/order
    const previousStepDefinitions = manufacturingSteps
      .filter(s => s.step_order < currentStepDefinition.step_order)
      .sort((a, b) => a.step_order - b.step_order);

    // Debug: Log the previous step definitions
    console.log('[DEBUG] Previous step definitions:', previousStepDefinitions);

    return previousStepDefinitions.map(prevStepDef => {
      const prevOrderStep = orderSteps.find(os =>
        os.manufacturing_order_id === order.id && os.manufacturing_step_id === prevStepDef.id
      );

      if (!prevOrderStep) {
        // Debug: No prevOrderStep found
        console.log(`[DEBUG] No prevOrderStep found for step_id=${prevStepDef.id} in order_id=${order.id}`);
        return null;
      }

      const fields = getStepFields(prevStepDef.id);

      // Debug: Log which fields are found
      console.log(`[DEBUG] Fields for prev step ${prevStepDef.step_name}:`, fields);

      const values = fields.map(field => {
        const value = getStepValue(prevOrderStep.id, field.field_id);
        return {
          label: field.field_label,
          value: value || '-',
        };
      });

      // Debug: Log the values for these fields in this previous order step
      console.log(`[DEBUG] Prev step ${prevStepDef.step_name} values:`, values);

      return {
        stepName: prevStepDef.step_name,
        stepOrder: prevStepDef.step_order,
        values,
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);

  }, [step, order, manufacturingSteps, orderSteps, getStepFields, getStepValue]);

  const currentStepDefinition = useMemo(() => {
    if (!step || !manufacturingSteps.length) return null;
    return manufacturingSteps.find(s => s.id === step.manufacturing_step_id);
  }, [step, manufacturingSteps]);

  const currentStepFields = useMemo(() => {
    if (!currentStepDefinition) return [];
    return getStepFields(currentStepDefinition.id);
  }, [currentStepDefinition, getStepFields]);

  const currentStepValues = useMemo(() => {
    if (!step || currentStepFields.length === 0) return [];
    return currentStepFields.map(field => {
      const value = getStepValue(step.id, field.field_id);
      return {
        label: field.field_label,
        value: value || '-',
        unit: field.field_options?.unit,
      };
    });
  }, [step, currentStepFields, getStepValue]);


  const renderPreviousSteps = () => {
    if (isLoadingStepsData || isLoadingValues) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading previous step data...</span>
        </div>
      );
    }

    // Debug: Display order number for clarity
    if (order && order.order_number) {
      return (
        <div>
          <div className="text-xs mb-2 text-muted-foreground">
            Showing data for Order <strong>{order.order_number}</strong>
          </div>
          {previousStepsData.length === 0 ? (
            <div className="py-4 border rounded text-center bg-muted/30 text-muted-foreground">
              No previous step data found for this order.
            </div>
          ) : (
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              <h4 className="font-semibold text-lg">Previous Steps Data</h4>
              {previousStepsData.map((prevStep, index) => (
                  <div key={index}>
                    <h5 className="font-semibold mb-2">{`Step ${prevStep.stepOrder}: ${prevStep.stepName}`}</h5>
                    {prevStep.values.length > 0 ? (
                      <div className="overflow-x-auto border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {prevStep.values.map((item, idx) => (
                                <TableHead key={idx}>{item.label}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              {prevStep.values.map((item, idx) => (
                                <TableCell key={idx}>{item.value}</TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <Alert>
                        <AlertDescription>No fields or data recorded for this step.</AlertDescription>
                      </Alert>
                    )}
                  </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const renderCurrentStepData = () => {
    if (isLoadingStepsData || isLoadingValues) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading current step data...</span>
        </div>
      );
    }

    if (currentStepValues.length === 0) {
      return (
        <Alert>
          <AlertDescription>No fields configured for this step.</AlertDescription>
        </Alert>
      );
    }
    
    return (
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentStepValues.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{item.label}</TableCell>
                <TableCell>{item.value}{item.unit ? ` ${item.unit}` : ''}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  if (!step || !order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Step Details: {currentStepDefinition?.step_name}</DialogTitle>
          <DialogDescription>
            Order #{order.order_number} - {order.product_name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {renderPreviousSteps()}
          
          <div className="pt-4 border-t">
            <h4 className="font-semibold text-lg my-2">Current Step Inputs</h4>
            {renderCurrentStepData()}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StepDetailsDialog;
