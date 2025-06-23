
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Factory } from 'lucide-react';
import { ManufacturingOrder } from '@/types/manufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';

interface StepSummaryTableProps {
  order: ManufacturingOrder;
}

interface StepSummary {
  stepName: string;
  stepOrder: number;
  totalActiveInstances: number;
  weightAssigned: number;
  weightReceived: number;
  completionPercentage: number;
}

const StepSummaryTable: React.FC<StepSummaryTableProps> = ({ order }) => {
  const { manufacturingSteps, orderSteps } = useManufacturingSteps();

  console.log('StepSummaryTable - Order ID:', order.id);
  console.log('StepSummaryTable - Manufacturing Steps:', manufacturingSteps);
  console.log('StepSummaryTable - Order Steps:', orderSteps);

  // Get order steps for this specific order
  const thisOrderSteps = Array.isArray(orderSteps) 
    ? orderSteps.filter(step => step.order_id === order.id)
    : [];

  console.log('StepSummaryTable - This Order Steps:', thisOrderSteps);

  // Calculate step summaries
  const stepSummaries: StepSummary[] = React.useMemo(() => {
    // Get active manufacturing steps in order
    const activeSteps = manufacturingSteps
      .filter(step => step.is_active)
      .sort((a, b) => a.step_order - b.step_order);

    console.log('StepSummaryTable - Active Steps:', activeSteps);

    return activeSteps.map(step => {
      // Find all instances of this step for this order
      const stepInstances = thisOrderSteps.filter(orderStep => 
        orderStep.step_name === step.step_name
      );

      console.log(`StepSummaryTable - Step ${step.step_name} instances:`, stepInstances);

      // Calculate metrics
      const totalActiveInstances = stepInstances.filter(instance => 
        instance.status === 'in_progress' || instance.status === 'pending'
      ).length;

      const weightAssigned = stepInstances.reduce((sum, instance) => 
        sum + (instance.weight_assigned || 0), 0
      );

      const weightReceived = stepInstances.reduce((sum, instance) => 
        sum + (instance.weight_received || 0), 0
      );

      // Calculate completion percentage
      let completionPercentage = 0;
      if (weightAssigned > 0) {
        completionPercentage = Math.round((weightReceived / weightAssigned) * 100 * 100) / 100; // Round to 2 decimal places
      }

      const summary = {
        stepName: step.step_name,
        stepOrder: step.step_order,
        totalActiveInstances,
        weightAssigned,
        weightReceived,
        completionPercentage
      };

      console.log(`StepSummaryTable - Step ${step.step_name} summary:`, summary);

      return summary;
    });
  }, [manufacturingSteps, thisOrderSteps]);

  const formatWeight = (weight: number) => {
    return weight > 0 ? `${weight.toFixed(2)} kg` : '—';
  };

  const formatPercentage = (percentage: number) => {
    return percentage > 0 ? `${percentage.toFixed(2)}%` : '—';
  };

  console.log('StepSummaryTable - Final Step Summaries:', stepSummaries);

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Factory className="h-4 w-4 text-blue-600" />
          Manufacturing Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {stepSummaries.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            No manufacturing steps configured
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium">Step Name</TableHead>
                <TableHead className="text-xs font-medium text-center">Active Instances</TableHead>
                <TableHead className="text-xs font-medium text-right">Weight Assigned</TableHead>
                <TableHead className="text-xs font-medium text-right">Weight Received</TableHead>
                <TableHead className="text-xs font-medium text-right">% Completion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stepSummaries.map((summary) => (
                <TableRow key={summary.stepName} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-sm">
                    {summary.stepName}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {summary.totalActiveInstances || '—'}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatWeight(summary.weightAssigned)}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatWeight(summary.weightReceived)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {formatPercentage(summary.completionPercentage)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default StepSummaryTable;
