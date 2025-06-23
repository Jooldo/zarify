
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

interface StepValue {
  label: string;
  value: string;
  unit?: string;
}

interface CurrentStepDisplayProps {
  currentStepValues: StepValue[];
  isLoading: boolean;
}

export const CurrentStepDisplay: React.FC<CurrentStepDisplayProps> = ({
  currentStepValues,
  isLoading
}) => {
  if (isLoading) {
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
