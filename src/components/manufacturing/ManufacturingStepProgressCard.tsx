
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Package, CheckCircle2, Clock, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { ManufacturingOrderStep } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useWorkers } from '@/hooks/useWorkers';

interface ManufacturingStepProgressCardProps {
  orderStep: ManufacturingOrderStep;
  onClick: () => void;
}

const ManufacturingStepProgressCard: React.FC<ManufacturingStepProgressCardProps> = ({
  orderStep,
  onClick
}) => {
  const { getStepValue } = useManufacturingStepValues();
  const { workers } = useWorkers();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get assigned worker
  const assignedWorker = orderStep.workers?.name || 
    (orderStep.assigned_worker_id ? workers.find(w => w.id === orderStep.assigned_worker_id)?.name : null);

  // Get step field values
  const weightAssigned = getStepValue(orderStep.id, 'weight_assigned');
  const weightReceived = getStepValue(orderStep.id, 'weight_received');
  const qtyAssigned = getStepValue(orderStep.id, 'quantity_assigned');
  const qtyReceived = getStepValue(orderStep.id, 'quantity_received');
  const userStatus = getStepValue(orderStep.id, 'status');

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500 min-w-[280px]"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            {orderStep.manufacturing_steps?.step_name || 'Step'}
          </CardTitle>
          <Badge className={`text-xs ${getStatusColor(orderStep.status)}`}>
            {userStatus || orderStep.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Assigned Worker */}
        {assignedWorker && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Worker:</span>
            <span className="font-medium">{assignedWorker}</span>
          </div>
        )}

        {/* Progress Percentage */}
        {orderStep.progress_percentage > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Progress:</span>
            <span className="font-medium">{orderStep.progress_percentage}%</span>
          </div>
        )}

        {/* Weight Tracking */}
        {(weightAssigned || weightReceived) && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Weight:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs ml-5">
              {weightAssigned && (
                <div>
                  <span className="text-muted-foreground">Assigned:</span>
                  <span className="font-medium ml-1">{weightAssigned} kg</span>
                </div>
              )}
              {weightReceived && (
                <div>
                  <span className="text-muted-foreground">Received:</span>
                  <span className="font-medium ml-1">{weightReceived} kg</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quantity Tracking */}
        {(qtyAssigned || qtyReceived) && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Quantity:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs ml-5">
              {qtyAssigned && (
                <div>
                  <span className="text-muted-foreground">Assigned:</span>
                  <span className="font-medium ml-1">{qtyAssigned}</span>
                </div>
              )}
              {qtyReceived && (
                <div>
                  <span className="text-muted-foreground">Received:</span>
                  <span className="font-medium ml-1">{qtyReceived}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="space-y-1 text-xs text-muted-foreground">
          {orderStep.started_at && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              Started: {format(new Date(orderStep.started_at), 'MMM dd, HH:mm')}
            </div>
          )}
          {orderStep.completed_at && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              Completed: {format(new Date(orderStep.completed_at), 'MMM dd, HH:mm')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ManufacturingStepProgressCard;
