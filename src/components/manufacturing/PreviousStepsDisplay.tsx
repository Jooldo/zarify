
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

interface StepData {
  stepName: string;
  stepOrder: number;
  values: Array<{
    label: string;
    value: string;
    unit?: string;
  }>;
  missing: boolean;
}

interface PreviousStepsDisplayProps {
  previousStepsData: StepData[];
  orderNumber?: string;
  isLoading: boolean;
}

export const PreviousStepsDisplay: React.FC<PreviousStepsDisplayProps> = ({
  previousStepsData,
  orderNumber,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading previous step data...</span>
      </div>
    );
  }

  // Get all unique field labels from all previous steps to create dynamic headers
  const getAllUniqueFieldLabels = () => {
    const fieldLabelsSet = new Set<string>();
    
    previousStepsData.forEach(step => {
      if (!step.missing) {
        step.values.forEach(value => {
          fieldLabelsSet.add(value.label);
        });
      }
    });
    
    return Array.from(fieldLabelsSet).sort();
  };

  const uniqueFieldLabels = getAllUniqueFieldLabels();

  // Helper function to get value for a specific field in a step
  const getValueForField = (step: StepData, fieldLabel: string) => {
    if (step.missing) return '-';
    
    const fieldValue = step.values.find(v => v.label === fieldLabel);
    if (!fieldValue) return '-';
    
    return fieldValue.unit ? `${fieldValue.value} ${fieldValue.unit}` : fieldValue.value;
  };

  return (
    <div>
      {orderNumber && (
        <div className="text-xs mb-2 text-muted-foreground">
          Showing data for Order <strong>{orderNumber}</strong>
        </div>
      )}
      
      {previousStepsData.length === 0 ? (
        <div className="py-4 border rounded text-center bg-muted/30 text-muted-foreground">
          No previous step data found for this order.<br />
          <span>No previous steps have been started for this order.</span>
        </div>
      ) : (
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Previous Steps Data</h4>
          
          {uniqueFieldLabels.length === 0 ? (
            <Alert>
              <AlertDescription>
                Previous steps exist but no field data has been configured or recorded yet.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px] font-semibold">Step Name</TableHead>
                    {uniqueFieldLabels.map((fieldLabel, index) => (
                      <TableHead key={index} className="min-w-[120px] font-semibold">
                        {fieldLabel}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previousStepsData.map((step, stepIndex) => (
                    <TableRow key={stepIndex}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{step.stepName}</span>
                          <span className="text-xs text-muted-foreground">
                            Step {step.stepOrder}
                          </span>
                        </div>
                      </TableCell>
                      {uniqueFieldLabels.map((fieldLabel, fieldIndex) => (
                        <TableCell key={fieldIndex}>
                          {step.missing ? (
                            <span className="italic text-muted-foreground text-sm">Not started</span>
                          ) : (
                            <span className="text-sm">
                              {getValueForField(step, fieldLabel)}
                            </span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {previousStepsData.some(step => step.missing) && (
            <div className="text-xs text-muted-foreground mt-2">
              <span className="italic">Note: Steps marked as "Not started" have not been initiated for this order yet.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
