
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

  // NEW: Utility for better log details
  function logStepDebug(orderSteps, manufacturingSteps, forOrderId) {
    console.log("[STEP DETAILS DEBUG]:");
    console.log("Order ID:", forOrderId);
    console.log("orderSteps", orderSteps);
    console.log("manufacturingSteps", manufacturingSteps);
    if (orderSteps.length && manufacturingSteps.length && forOrderId) {
      const stepsForOrder = orderSteps.filter(s => s.manufacturing_order_id === forOrderId);
      console.log("Steps for this order:", stepsForOrder);
      const stepOrders = stepsForOrder.map(s => s.manufacturing_steps?.step_order);
      const uniqueStepOrders = [...new Set(stepOrders)];
      console.log("Step orders present:", uniqueStepOrders);
    }
  }

  React.useEffect(() => {
    if (order && step) {
      logStepDebug(orderSteps, manufacturingSteps, order.id);
    }
  }, [order, orderSteps, manufacturingSteps, step]);

  // Add extra debug for MO000004
  React.useEffect(() => {
    if (order && order.order_number === "MO000004") {
      const prevOrderStepIds = orderSteps.filter(os => os.manufacturing_order_id === order.id).map(os => os.manufacturing_step_id);
      const allStepIds = manufacturingSteps.map(ms => ms.id);
      console.log('[DEBUG][MO000004] manufacturing_order_id:', order.id);
      console.log('[DEBUG][MO000004] orderSteps (step_ids for order):', prevOrderStepIds);
      console.log('[DEBUG][MO000004] all manufacturingSteps ids:', allStepIds);
      // Showcase what is being matched
    }
  }, [order, manufacturingSteps, orderSteps]);

  // Add: When the dialog opens and order number matches, log all step data
  React.useEffect(() => {
    if (open && order && order.order_number === "MO000004") {
      // Fetch all manufacturing steps
      console.log("[DEBUG/MO000004] All manufacturing steps for merchant:", manufacturingSteps);
      // Fetch all order steps for order
      const relevantOrderSteps = orderSteps.filter(os => String(os.manufacturing_order_id) === String(order.id));
      console.log("[DEBUG/MO000004] All order steps for this order:", relevantOrderSteps);

      // Find "Dhol" manufacturing step definition
      const dholDef = manufacturingSteps.find(d => (d.step_name || '').toLowerCase() === 'dhol');
      if (!dholDef) {
        console.warn('[DEBUG/MO000004] No manufacturing step definition named "Dhol" found');
      } else {
        // Find order step for "Dhol"
        const dholOrderStep = relevantOrderSteps.find(os => String(os.manufacturing_step_id) === String(dholDef.id));
        if (!dholOrderStep) {
          console.warn('[DEBUG/MO000004] No order step found for "Dhol" for this order');
        } else {
          console.log('[DEBUG/MO000004] Found order step for "Dhol":', dholOrderStep);

          // Get the fields for "Dhol"
          const dholFields = getStepFields(dholDef.id);
          if (!dholFields.length) {
            console.warn('[DEBUG/MO000004] No fields configured for "Dhol" manufacturing step');
          } else {
            dholFields.forEach(field => {
              const value = getStepValue(dholOrderStep.id, field.field_id);
              console.log(`[DEBUG/MO000004] Dhol field "${field.field_label}":`, value ?? "(empty/null)");
            });
          }
        }
      }

      // Continue to debug ALL steps and ALL values as before
      relevantOrderSteps.forEach(os => {
        const def = manufacturingSteps.find(d => String(d.id) === String(os.manufacturing_step_id));
        let stepFields = [];
        if (def) stepFields = getStepFields(def.id);
        console.log(`[DEBUG/MO000004] Step: ${def?.step_name || os.manufacturing_step_id} (${os.id})`);
        stepFields.forEach(field => {
          const value = getStepValue(os.id, field.field_id);
          console.log(`   Field "${field.field_label}": ${value ?? "(empty/null)"}`);
        });
      });
    }
  }, [
    open,
    order,
    orderSteps,
    manufacturingSteps,
    getStepFields,
    getStepValue,
  ]);

  // NEW: Add debug logging for MO000005
  React.useEffect(() => {
    if (open && order && order.order_number === "MO000005") {
      console.log("[DEBUG/MO000005] === MANUFACTURING DATA FOR MO000005 ===");
      console.log("[DEBUG/MO000005] Order details:", order);
      console.log("[DEBUG/MO000005] All manufacturing steps for merchant:", manufacturingSteps);
      
      // Fetch all order steps for MO000005
      const relevantOrderSteps = orderSteps.filter(os => String(os.manufacturing_order_id) === String(order.id));
      console.log("[DEBUG/MO000005] All order steps for this order:", relevantOrderSteps);

      if (relevantOrderSteps.length === 0) {
        console.warn("[DEBUG/MO000005] No order steps found for MO000005");
        return;
      }

      // Log each manufacturing step and its data
      relevantOrderSteps.forEach(os => {
        const stepDefinition = manufacturingSteps.find(d => String(d.id) === String(os.manufacturing_step_id));
        console.log(`[DEBUG/MO000005] === STEP: ${stepDefinition?.step_name || 'Unknown'} ===`);
        console.log(`[DEBUG/MO000005] Order Step ID: ${os.id}`);
        console.log(`[DEBUG/MO000005] Manufacturing Step ID: ${os.manufacturing_step_id}`);
        console.log(`[DEBUG/MO000005] Status: ${os.status}`);
        console.log(`[DEBUG/MO000005] Progress: ${os.progress_percentage}%`);
        console.log(`[DEBUG/MO000005] Started At: ${os.started_at || 'Not started'}`);
        console.log(`[DEBUG/MO000005] Completed At: ${os.completed_at || 'Not completed'}`);
        console.log(`[DEBUG/MO000005] Notes: ${os.notes || 'No notes'}`);
        console.log(`[DEBUG/MO000005] Assigned Worker: ${os.assigned_worker_id || 'Not assigned'}`);

        // Get and log all field values for this step
        if (stepDefinition) {
          const stepFields = getStepFields(stepDefinition.id);
          console.log(`[DEBUG/MO000005] Fields configured for ${stepDefinition.step_name}:`, stepFields.length);
          
          if (stepFields.length > 0) {
            stepFields.forEach(field => {
              const value = getStepValue(os.id, field.field_id);
              console.log(`[DEBUG/MO000005]   "${field.field_label}" (${field.field_type}): ${value ?? "(empty/null)"}`);
              if (field.field_options) {
                console.log(`[DEBUG/MO000005]     Options:`, field.field_options);
              }
            });
          } else {
            console.log(`[DEBUG/MO000005] No fields configured for step: ${stepDefinition.step_name}`);
          }
        }
        console.log(`[DEBUG/MO000005] === END STEP ===`);
      });

      console.log("[DEBUG/MO000005] === END MANUFACTURING DATA ===");
    }
  }, [
    open,
    order,
    orderSteps,
    manufacturingSteps,
    getStepFields,
    getStepValue,
  ]);

  const previousStepsData = useMemo(() => {
    if (!step || !order || !manufacturingSteps.length || !orderSteps.length) {
      return [];
    }

    console.log('[PREVIOUS STEPS DEBUG] Starting calculation for order:', order.order_number);
    console.log('[PREVIOUS STEPS DEBUG] Current step:', step);

    // Find the current step definition
    const currentStepDefinition = manufacturingSteps.find(s => s.id === step.manufacturing_step_id);
    if (!currentStepDefinition) {
      console.log("[PREVIOUS STEPS DEBUG] No currentStepDefinition for step:", step);
      return [];
    }

    console.log('[PREVIOUS STEPS DEBUG] Current step definition:', currentStepDefinition);

    // Get all order steps for this order
    const allOrderStepsForOrder = orderSteps.filter(os => String(os.manufacturing_order_id) === String(order.id));
    console.log('[PREVIOUS STEPS DEBUG] All order steps for this order:', allOrderStepsForOrder);

    // Get all manufacturing step definitions and sort them by step_order
    const allStepDefinitions = manufacturingSteps
      .slice()
      .sort((a, b) => Number(a.step_order) - Number(b.step_order));

    console.log('[PREVIOUS STEPS DEBUG] All step definitions sorted:', allStepDefinitions);

    // Find current step position
    const currentStepOrder = Number(currentStepDefinition.step_order);
    console.log('[PREVIOUS STEPS DEBUG] Current step order:', currentStepOrder);

    // Get all previous step definitions
    const previousStepDefinitions = allStepDefinitions.filter(def => Number(def.step_order) < currentStepOrder);
    console.log('[PREVIOUS STEPS DEBUG] Previous step definitions:', previousStepDefinitions);

    // Map each previous step definition to data
    const result = previousStepDefinitions.map(prevStepDef => {
      console.log(`[PREVIOUS STEPS DEBUG] Processing step: ${prevStepDef.step_name} (ID: ${prevStepDef.id})`);

      // Find the corresponding order step
      const orderStep = allOrderStepsForOrder.find(os => String(os.manufacturing_step_id) === String(prevStepDef.id));
      console.log(`[PREVIOUS STEPS DEBUG] Found order step:`, orderStep);

      if (!orderStep) {
        console.log(`[PREVIOUS STEPS DEBUG] No order step found for ${prevStepDef.step_name}`);
        return {
          stepName: prevStepDef.step_name,
          stepOrder: prevStepDef.step_order,
          values: [],
          missing: true
        };
      }

      // Get fields for this step
      const fields = getStepFields(prevStepDef.id);
      console.log(`[PREVIOUS STEPS DEBUG] Fields for ${prevStepDef.step_name}:`, fields);

      // Get values for each field
      const values = fields.map(field => {
        const value = getStepValue(orderStep.id, field.field_id);
        console.log(`[PREVIOUS STEPS DEBUG] Field "${field.field_label}" value:`, value);
        return {
          label: field.field_label,
          value: value || '-',
          unit: field.field_options?.unit,
        };
      });

      console.log(`[PREVIOUS STEPS DEBUG] Final values for ${prevStepDef.step_name}:`, values);

      return {
        stepName: prevStepDef.step_name,
        stepOrder: prevStepDef.step_order,
        values,
        missing: false
      };
    });

    console.log('[PREVIOUS STEPS DEBUG] Final result:', result);
    return result;
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
              No previous step data found for this order.<br />
              <span>
                No previous steps have been started for this order.
              </span>
            </div>
          ) : (
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              <h4 className="font-semibold text-lg">Previous Steps Data</h4>
              {previousStepsData.map((prevStep, index) => (
                <div key={index}>
                  <h5 className="font-semibold mb-2">{`Step ${prevStep.stepOrder}: ${prevStep.stepName}`}</h5>
                  {prevStep.missing ? (
                    <Alert>
                      <AlertDescription>
                        <span className="italic text-muted-foreground">Not started yet for this order.</span>
                      </AlertDescription>
                    </Alert>
                  ) : prevStep.values.length > 0 ? (
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
                              <TableCell key={idx}>{item.value}{item.unit ? ` ${item.unit}` : ''}</TableCell>
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
