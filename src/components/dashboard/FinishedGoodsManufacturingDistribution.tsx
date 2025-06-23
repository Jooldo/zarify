
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Package, User, Clock } from 'lucide-react';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';

interface FinishedGoodsManufacturingDistributionProps {
  manufacturingOrders: ManufacturingOrder[];
}

const FinishedGoodsManufacturingDistribution = ({ manufacturingOrders }: FinishedGoodsManufacturingDistributionProps) => {
  const { manufacturingSteps, orderSteps } = useManufacturingSteps();

  // Calculate step distribution
  const stepDistribution = React.useMemo(() => {
    const distribution: Record<string, {
      stepName: string;
      stepOrder: number;
      orderCount: number;
      totalQuantity: number;
      inProgress: number;
      completed: number;
      pending: number;
    }> = {};

    // Initialize all manufacturing steps
    manufacturingSteps.forEach(step => {
      distribution[step.step_name] = {
        stepName: step.step_name,
        stepOrder: step.step_order,
        orderCount: 0,
        totalQuantity: 0,
        inProgress: 0,
        completed: 0,
        pending: 0,
      };
    });

    // Process order steps
    orderSteps.forEach(orderStep => {
      const stepName = orderStep.step_name;
      if (distribution[stepName]) {
        distribution[stepName].orderCount += 1;
        distribution[stepName].totalQuantity += orderStep.quantity_assigned || 0;
        
        if (orderStep.status === 'in_progress') {
          distribution[stepName].inProgress += 1;
        } else if (orderStep.status === 'completed') {
          distribution[stepName].completed += 1;
        } else {
          distribution[stepName].pending += 1;
        }
      }
    });

    return Object.values(distribution).sort((a, b) => a.stepOrder - b.stepOrder);
  }, [manufacturingSteps, orderSteps]);

  const getProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getStepStatusColor = (pending: number, inProgress: number, completed: number) => {
    const total = pending + inProgress + completed;
    if (total === 0) return 'bg-gray-500';
    if (completed === total) return 'bg-green-500';
    if (inProgress > 0) return 'bg-blue-500';
    return 'bg-amber-500';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stepDistribution.map((step) => {
          const total = step.pending + step.inProgress + step.completed;
          const progressPercentage = getProgressPercentage(step.completed, total);
          
          return (
            <Card key={step.stepName} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStepStatusColor(step.pending, step.inProgress, step.completed)}`} />
                    <span className="truncate">{step.stepName}</span>
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    Step {step.stepOrder}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Orders</p>
                      <p className="font-semibold">{step.orderCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Quantity</p>
                      <p className="font-semibold">{step.totalQuantity}</p>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                {/* Status Breakdown */}
                <div className="flex justify-between text-xs">
                  <div className="text-center">
                    <div className="font-semibold text-amber-600">{step.pending}</div>
                    <div className="text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{step.inProgress}</div>
                    <div className="text-muted-foreground">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{step.completed}</div>
                    <div className="text-muted-foreground">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {stepDistribution.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Manufacturing Steps</h3>
            <p className="text-sm text-muted-foreground">
              Configure manufacturing steps to see production distribution
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinishedGoodsManufacturingDistribution;
