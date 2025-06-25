
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useWorkers } from '@/hooks/useWorkers';
import { format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';
import { Calendar } from 'lucide-react';

interface GanttItem {
  id: string;
  workerName: string;
  stepName: string;
  startDate: Date;
  endDate: Date;
  assignedWeight: number;
  receivedWeight: number;
  stepOrder: number;
  status: string;
  completionPercentage: number;
}

const GanttChartView: React.FC = () => {
  const { orderSteps, manufacturingSteps } = useManufacturingSteps();
  const { workers } = useWorkers();

  const ganttData = useMemo(() => {
    if (!orderSteps.length || !workers.length) return { items: [], timelineStart: new Date(), timelineEnd: new Date() };

    // Filter active steps with dates and workers
    const activeSteps = orderSteps.filter(step => 
      step.assigned_worker && 
      step.created_at && 
      step.status !== 'completed'
    );

    if (activeSteps.length === 0) return { items: [], timelineStart: new Date(), timelineEnd: new Date() };

    // Get worker names map
    const workerMap = workers.reduce((acc, worker) => {
      acc[worker.id] = worker.name;
      return acc;
    }, {} as Record<string, string>);

    // Get step orders map
    const stepOrderMap = manufacturingSteps.reduce((acc, step) => {
      acc[step.step_name] = step.step_order;
      return acc;
    }, {} as Record<string, number>);

    // Transform data to Gantt items
    const items: GanttItem[] = activeSteps.map(step => {
      const startDate = new Date(step.created_at);
      const endDate = step.due_date ? new Date(step.due_date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default to 1 week from now
      
      const assignedWeight = step.weight_assigned || 0;
      const receivedWeight = step.weight_received || 0;
      const completionPercentage = assignedWeight > 0 ? (receivedWeight / assignedWeight) * 100 : 0;
      
      return {
        id: step.id,
        workerName: workerMap[step.assigned_worker] || 'Unknown Worker',
        stepName: step.step_name,
        startDate,
        endDate,
        assignedWeight,
        receivedWeight,
        stepOrder: stepOrderMap[step.step_name] || 0,
        status: step.status,
        completionPercentage: Math.min(completionPercentage, 100)
      };
    });

    // Calculate timeline bounds
    const allDates = items.flatMap(item => [item.startDate, item.endDate]);
    const timelineStart = startOfMonth(new Date(Math.min(...allDates.map(d => d.getTime()))));
    const timelineEnd = endOfMonth(new Date(Math.max(...allDates.map(d => d.getTime()))));

    // Sort items by worker name, then step order
    items.sort((a, b) => {
      if (a.workerName !== b.workerName) {
        return a.workerName.localeCompare(b.workerName);
      }
      return a.stepOrder - b.stepOrder;
    });

    return { items, timelineStart, timelineEnd };
  }, [orderSteps, workers, manufacturingSteps]);

  const getStepColors = (stepName: string) => {
    const colorMap = {
      'Jhalai': { light: 'bg-orange-200', dark: 'bg-orange-500' },
      'Dhol': { light: 'bg-purple-200', dark: 'bg-purple-500' },
      'Casting': { light: 'bg-green-200', dark: 'bg-green-500' }
    };
    
    return colorMap[stepName as keyof typeof colorMap] || { light: 'bg-gray-200', dark: 'bg-gray-500' };
  };

  // Calculate timeline grid
  const timelineDays = useMemo(() => {
    if (!ganttData.items.length) return [];
    
    return eachDayOfInterval({
      start: ganttData.timelineStart,
      end: ganttData.timelineEnd
    });
  }, [ganttData.timelineStart, ganttData.timelineEnd]);

  const timelineMonths = useMemo(() => {
    if (!ganttData.items.length) return [];
    
    return eachMonthOfInterval({
      start: ganttData.timelineStart,
      end: ganttData.timelineEnd
    });
  }, [ganttData.timelineStart, ganttData.timelineEnd]);

  const totalDays = differenceInDays(ganttData.timelineEnd, ganttData.timelineStart) + 1;
  const dayWidth = 40; // pixels per day

  if (ganttData.items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Active Tasks</h3>
          <p className="text-gray-500 text-center">
            No manufacturing steps with assigned workers and dates found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Worker Workload - Gantt View</h2>
          <p className="text-sm text-muted-foreground">
            Timeline view showing worker assignments and task progress
          </p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Manufacturing Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Header with months */}
              <div className="flex border-b bg-gray-50">
                <div className="w-64 p-4 border-r bg-white font-semibold">
                  Worker & Task
                </div>
                <div className="flex">
                  {timelineMonths.map((month, index) => {
                    const monthDays = eachDayOfInterval({
                      start: month > ganttData.timelineStart ? month : ganttData.timelineStart,
                      end: endOfMonth(month) < ganttData.timelineEnd ? endOfMonth(month) : ganttData.timelineEnd
                    }).length;
                    
                    return (
                      <div 
                        key={index}
                        className="border-r border-gray-200 bg-gray-50 p-2 text-center font-medium text-sm"
                        style={{ width: monthDays * dayWidth }}
                      >
                        {format(month, 'MMM yyyy')}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Task rows */}
              <div className="relative">
                {ganttData.items.map((item, index) => {
                  const startOffset = differenceInDays(item.startDate, ganttData.timelineStart);
                  const duration = differenceInDays(item.endDate, item.startDate) + 1;
                  const barWidth = duration * dayWidth;
                  const barLeft = startOffset * dayWidth;
                  const progressWidth = (item.completionPercentage / 100) * barWidth;
                  const colors = getStepColors(item.stepName);

                  return (
                    <div key={item.id} className="flex border-b hover:bg-gray-50 min-h-[60px]">
                      {/* Left panel - Worker and task info */}
                      <div className="w-64 p-3 border-r flex flex-col justify-center">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {item.workerName}
                        </div>
                        <div className="text-xs text-gray-600">
                          {item.stepName}
                        </div>
                      </div>

                      {/* Timeline area */}
                      <div className="relative flex-1" style={{ width: totalDays * dayWidth }}>
                        {/* Grid background */}
                        <div className="absolute inset-0 flex">
                          {timelineDays.map((day, dayIndex) => (
                            <div
                              key={dayIndex}
                              className="border-r border-gray-100"
                              style={{ width: dayWidth }}
                            />
                          ))}
                        </div>

                        {/* Task bar container */}
                        <div className="relative h-full flex flex-col justify-center py-2">
                          {/* Progress bar */}
                          <div
                            className={`relative h-6 rounded-md border ${colors.light}`}
                            style={{
                              left: barLeft,
                              width: Math.max(barWidth, 80) // Minimum width for readability
                            }}
                          >
                            {/* Completed portion */}
                            <div
                              className={`h-full ${colors.dark} rounded-md`}
                              style={{ width: `${item.completionPercentage}%` }}
                            />
                            
                            {/* Date range text */}
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                              {format(item.startDate, 'MMM d')} - {format(item.endDate, 'MMM d')}
                            </div>
                            
                            {/* Assigned weight at the end */}
                            {item.assignedWeight > 0 && (
                              <div className="absolute -right-2 top-0 transform translate-x-full text-xs font-medium text-gray-600 bg-white px-1 rounded shadow-sm border">
                                {item.assignedWeight.toFixed(1)}kg
                              </div>
                            )}
                          </div>
                          
                          {/* Received weight below the bar */}
                          {item.receivedWeight > 0 && (
                            <div
                              className="text-xs text-green-600 font-medium mt-1"
                              style={{ marginLeft: barLeft + 4 }}
                            >
                              ✓ {item.receivedWeight.toFixed(1)}kg received
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium">Step Types:</span>
            {['Jhalai', 'Dhol', 'Casting'].map(step => {
              const colors = getStepColors(step);
              return (
                <div key={step} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${colors.dark}`} />
                  <span className="text-sm">{step}</span>
                </div>
              );
            })}
            <div className="ml-4 flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-200" />
              <span className="text-sm">Pending Progress</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GanttChartView;
