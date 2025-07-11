
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Calendar, Package, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ManufacturingOrder } from '@/hooks/useManufacturingOrders';
import { ManufacturingOrderStep } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useWorkers } from '@/hooks/useWorkers';

interface StepProgressDialogProps {
  order: ManufacturingOrder | null;
  orderSteps: ManufacturingOrderStep[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StepProgressDialog: React.FC<StepProgressDialogProps> = ({
  order,
  orderSteps,
  open,
  onOpenChange
}) => {
  const { stepValues } = useManufacturingStepValues();
  const { workers } = useWorkers();

  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  // Sort steps by created_at since step_order doesn't exist in manufacturing_order_step_data
  const sortedSteps = [...orderSteps].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <span className="text-xl font-semibold">Manufacturing Progress</span>
              <p className="text-sm text-muted-foreground font-mono">{order.order_number} - {order.product_name}</p>
            </div>
            <Badge className="bg-blue-100 text-blue-800">
              {sortedSteps.filter(s => s.status === 'completed').length} / {sortedSteps.length} Steps
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {sortedSteps.map((step, index) => {
            const assignedWorker = step.workers?.name || 
              (step.assigned_worker ? workers.find(w => w.id === step.assigned_worker)?.name : null);

            return (
              <Card key={step.id} className="relative">
                {/* Progress Line */}
                {index < sortedSteps.length - 1 && (
                  <div className="absolute left-6 top-16 w-px h-8 bg-gray-200 z-0" />
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-3">
                      <div className="relative z-10 bg-white">
                        {getStatusIcon(step.status)}
                      </div>
                      <span>{step.step_name || 'Unknown Step'}</span>
                      <Badge variant="outline" className="text-xs">
                        Step {index + 1}
                      </Badge>
                    </CardTitle>
                    <Badge className={`${getStatusColor(step.status)}`}>
                      {step.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Basic Step Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {assignedWorker && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Assigned Worker</span>
                        </div>
                        <span className="font-medium">{assignedWorker}</span>
                      </div>
                    )}

                    {step.started_at && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Started</span>
                        </div>
                        <span className="font-medium">{format(new Date(step.started_at), 'MMM dd, HH:mm')}</span>
                      </div>
                    )}

                    {step.completed_at && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Completed</span>
                        </div>
                        <span className="font-medium">{format(new Date(step.completed_at), 'MMM dd, HH:mm')}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {step.notes && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Notes</h4>
                        <p className="text-sm text-muted-foreground">{step.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {sortedSteps.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No manufacturing steps have been started yet.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StepProgressDialog;
