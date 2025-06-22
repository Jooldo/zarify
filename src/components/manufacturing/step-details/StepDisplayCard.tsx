
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';
import { useWorkers } from '@/hooks/useWorkers';

interface StepDisplayCardProps {
  step: Tables<'manufacturing_order_steps'>;
  currentStepValues: Array<{
    label: string;
    value: string;
    unit?: string;
  }>;
}

export const StepDisplayCard: React.FC<StepDisplayCardProps> = ({
  step,
  currentStepValues,
}) => {
  const { workers } = useWorkers();

  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : 'Unknown Worker';
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Current Step Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <span className="text-sm text-muted-foreground">Progress:</span>
            <span className="ml-2 font-medium">{step.progress_percentage || 0}%</span>
          </div>
          
          {step.assigned_worker_id && (
            <div>
              <span className="text-sm text-muted-foreground">Assigned Worker:</span>
              <span className="ml-2 font-medium">{getWorkerName(step.assigned_worker_id)}</span>
            </div>
          )}

          {step.started_at && (
            <div>
              <span className="text-sm text-muted-foreground">Started:</span>
              <span className="ml-2 font-medium">{format(new Date(step.started_at), 'MMM dd, yyyy HH:mm')}</span>
            </div>
          )}

          {step.completed_at && (
            <div>
              <span className="text-sm text-muted-foreground">Completed:</span>
              <span className="ml-2 font-medium">{format(new Date(step.completed_at), 'MMM dd, yyyy HH:mm')}</span>
            </div>
          )}
        </div>

        {currentStepValues.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Current Field Values</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentStepValues.map((value, index) => (
                <div key={index} className="bg-muted/50 p-3 rounded">
                  <span className="text-sm text-muted-foreground block">{value.label}:</span>
                  <span className="font-medium">
                    {value.value}
                    {value.unit && ` ${value.unit}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
