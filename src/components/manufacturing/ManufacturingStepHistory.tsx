
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface StepHistoryEntry {
  step: string;
  status: string;
  weight?: number;
  quantity?: number;
}

interface ManufacturingStepHistoryProps {
  task: {
    id: string;
    receivedWeight?: number;
    receivedQuantity?: number;
    completedWeight?: number;
    completedQuantity?: number;
    status?: string;
  };
  currentStep: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Progress': return 'bg-blue-100 text-blue-800';
    case 'Completed': return 'bg-emerald-100 text-emerald-800';
    case 'Partially Completed': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const calculateLossPercentage = (previous: number, current: number) => {
  if (!previous || !current) return null;
  const loss = ((previous - current) / previous) * 100;
  return loss.toFixed(1);
};

const ManufacturingStepHistory = ({ task, currentStep }: ManufacturingStepHistoryProps) => {
  // Build step history based on available data
  const stepHistory: StepHistoryEntry[] = [];

  // Add Jhalai step if we have received data
  if (task.receivedWeight || task.receivedQuantity) {
    stepHistory.push({
      step: 'Jhalai',
      status: 'Completed',
      weight: task.receivedWeight,
      quantity: task.receivedQuantity
    });
  }

  // Add current step data if available
  if (task.completedWeight || task.completedQuantity) {
    stepHistory.push({
      step: currentStep === 'jhalai' ? 'Jhalai' : 'Quellai',
      status: task.status || 'Progress',
      weight: task.completedWeight,
      quantity: task.completedQuantity
    });
  } else if (currentStep && task.status) {
    // Show current step in progress
    stepHistory.push({
      step: currentStep === 'jhalai' ? 'Jhalai' : 'Quellai',
      status: task.status,
      weight: undefined,
      quantity: undefined
    });
  }

  if (stepHistory.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
      <h4 className="font-semibold text-lg mb-3 text-gray-800">Manufacturing Step History</h4>
      <p className="text-sm text-gray-600 mb-4">Weight and quantity trail from previous production steps</p>
      
      <div className="bg-white rounded border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Step</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Weight (kg)</TableHead>
              <TableHead className="font-semibold text-right">Quantity</TableHead>
              <TableHead className="font-semibold text-right">Loss %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stepHistory.map((entry, index) => {
              const previousEntry = index > 0 ? stepHistory[index - 1] : null;
              const weightLoss = previousEntry && entry.weight && previousEntry.weight 
                ? calculateLossPercentage(previousEntry.weight, entry.weight)
                : null;

              return (
                <TableRow key={`${entry.step}-${index}`} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{entry.step}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(entry.status)} text-xs`}>
                      {entry.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {entry.weight ? `${entry.weight.toFixed(2)}` : '–'}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {entry.quantity ? entry.quantity.toString() : '–'}
                  </TableCell>
                  <TableCell className="text-right">
                    {weightLoss ? (
                      <div className="flex items-center justify-end gap-1">
                        {parseFloat(weightLoss) > 0 ? (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        ) : parseFloat(weightLoss) < 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <Minus className="h-3 w-3 text-gray-400" />
                        )}
                        <span className={`text-xs font-medium ${
                          parseFloat(weightLoss) > 0 ? 'text-red-600' : 
                          parseFloat(weightLoss) < 0 ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {weightLoss}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">–</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {stepHistory.length > 1 && (
        <div className="mt-3 text-xs text-gray-500">
          * Loss percentage calculated based on weight difference between consecutive steps
        </div>
      )}
    </div>
  );
};

export default ManufacturingStepHistory;
