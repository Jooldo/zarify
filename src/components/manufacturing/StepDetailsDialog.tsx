
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

  const previousStepsData = useMemo(() => {
    if (!step || !order || !manufacturingSteps.length || !orderSteps.length) {
      return [];
    }
    
    const currentStepDefinition = manufacturingSteps.find(s => s.id === step.manufacturing_step_id);
    if (!currentStepDefinition) return [];

    const previousStepDefinitions = manufacturingSteps
      .filter(s => s.step_order < currentStepDefinition.step_order)
      .sort((a, b) => a.step_order - b.step_order);
      
    return previousStepDefinitions.map(prevStepDef => {
      const prevOrderStep = orderSteps.find(os => 
        os.manufacturing_order_id === order.id && os.manufacturing_step_id === prevStepDef.id
      );

      if (!prevOrderStep) return null;

      const fields = getStepFields(prevStepDef.id);
      
      const values = fields.map(field => {
        const value = getStepValue(prevOrderStep.id, field.field_id);
        return {
          label: field.field_label,
          value: value || '-',
        };
      });

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
    
    if (previousStepsData.length === 0) {
      return (
        <Alert>
          <AlertDescription>No previous step data available for this order.</AlertDescription>
        </Alert>
      );
    }

    return (
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
    );
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
