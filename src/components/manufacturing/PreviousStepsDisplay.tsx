
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
};
