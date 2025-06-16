
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface StepData {
  stepName: string;
  stepOrder: number;
  values: Array<{
    label: string;
    value: string;
    unit?: string;
  }>;
  missing: boolean;
  status?: string;
  startedAt?: string | null;
  completedAt?: string | null;
  workerName?: string;
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

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusConfig = {
      completed: { icon: CheckCircle2, color: 'bg-green-100 text-green-800' },
      in_progress: { icon: Clock, color: 'bg-blue-100 text-blue-800' },
      pending: { icon: AlertCircle, color: 'bg-gray-100 text-gray-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div>
      <h4 className="font-semibold text-lg mb-3">Previous Steps Data</h4>
      
      {orderNumber && (
        <div className="text-xs mb-2 text-muted-foreground">
          Showing data for Order <strong>{orderNumber}</strong>
        </div>
      )}
      
      {previousStepsData.length === 0 ? (
        <div className="py-6 border rounded text-center bg-muted/30 text-muted-foreground">
          <p className="text-sm">No previous steps found for this order.</p>
          <p className="text-xs mt-1">This might be the first step in the manufacturing process.</p>
        </div>
      ) : (
        <div className="space-y-4">
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
                    <TableHead className="min-w-[120px] font-semibold">Step Details</TableHead>
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
                        <div className="space-y-1">
                          <div className="font-medium">{step.stepName}</div>
                          <div className="text-xs text-muted-foreground">
                            Step {step.stepOrder}
                          </div>
                          {step.status && (
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusBadge(step.status)}
                            </div>
                          )}
                          {step.workerName && step.workerName !== 'Not assigned' && (
                            <div className="text-xs text-muted-foreground">
                              Worker: {step.workerName}
                            </div>
                          )}
                          {step.startedAt && (
                            <div className="text-xs text-muted-foreground">
                              Started: {format(new Date(step.startedAt), 'MMM dd, HH:mm')}
                            </div>
                          )}
                          {step.completedAt && (
                            <div className="text-xs text-muted-foreground">
                              Completed: {format(new Date(step.completedAt), 'MMM dd, HH:mm')}
                            </div>
                          )}
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
