
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
      'Jhalai': { light: 'bg-amber-50 border-amber-200', dark: 'bg-amber-400', text: 'text-amber-900' },
      'Dhol': { light: 'bg-violet-50 border-violet-200', dark: 'bg-violet-400', text: 'text-violet-900' },
      'Casting': { light: 'bg-emerald-50 border-emerald-200', dark: 'bg-emerald-400', text: 'text-emerald-900' }
    };
    
    return colorMap[stepName as keyof typeof colorMap] || { 
      light: 'bg-slate-50 border-slate-200', 
      dark: 'bg-slate-400', 
      text: 'text-slate-900' 
    };
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
  const dayWidth = 32; // pixels per day

  if (ganttData.items.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Active Tasks</h3>
          <p className="text-slate-500 text-center text-sm max-w-md">
            No manufacturing steps with assigned workers and dates found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Worker Workload Timeline</h2>
          <p className="text-sm text-slate-600 mt-1">
            Visual timeline showing worker assignments and task progress
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-4 border-b border-slate-100">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-900 font-medium">
            <Calendar className="h-5 w-5 text-slate-600" />
            Manufacturing Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Header with months */}
              <div className="flex border-b border-slate-100 bg-slate-50/50">
                <div className="w-72 p-4 border-r border-slate-100 bg-white font-medium text-slate-700 text-sm">
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
                        className="border-r border-slate-100 bg-slate-50/50 p-3 text-center font-medium text-sm text-slate-700"
                        style={{ width: monthDays * dayWidth }}
                      >
                        {format(month, 'MMM yyyy')}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Day headers */}
              <div className="flex border-b border-slate-100 bg-slate-25">
                <div className="w-72 border-r border-slate-100 bg-white"></div>
                <div className="flex">
                  {timelineDays.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="border-r border-slate-50 text-center py-2 text-xs text-slate-500"
                      style={{ width: dayWidth }}
                    >
                      {format(day, 'd')}
                    </div>
                  ))}
                </div>
              </div>

              {/* Task rows */}
              <div className="relative">
                {ganttData.items.map((item, index) => {
                  const startOffset = differenceInDays(item.startDate, ganttData.timelineStart);
                  const duration = differenceInDays(item.endDate, item.startDate) + 1;
                  const barWidth = duration * dayWidth;
                  const barLeft = startOffset * dayWidth;
                  const colors = getStepColors(item.stepName);

                  return (
                    <div key={item.id} className={`flex border-b border-slate-50 hover:bg-slate-25 min-h-[64px] ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25/30'}`}>
                      {/* Left panel - Worker and task info */}
                      <div className="w-72 p-4 border-r border-slate-100 flex items-center">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-slate-900 truncate">
                            {item.workerName}
                          </div>
                          <div className="text-xs text-slate-600 mt-0.5 truncate">
                            {item.stepName}
                          </div>
                        </div>
                      </div>

                      {/* Timeline area */}
                      <div className="relative flex-1" style={{ width: totalDays * dayWidth }}>
                        {/* Grid background */}
                        <div className="absolute inset-0 flex">
                          {timelineDays.map((day, dayIndex) => (
                            <div
                              key={dayIndex}
                              className="border-r border-slate-50"
                              style={{ width: dayWidth }}
                            />
                          ))}
                        </div>

                        {/* Task bar container */}
                        <div className="relative h-full flex flex-col justify-center py-3">
                          {/* Progress bar */}
                          <div
                            className={`relative h-7 rounded-lg border ${colors.light} shadow-sm`}
                            style={{
                              left: barLeft,
                              width: Math.max(barWidth, 100) // Minimum width for readability
                            }}
                          >
                            {/* Completed portion */}
                            <div
                              className={`h-full ${colors.dark} rounded-lg transition-all duration-300`}
                              style={{ width: `${item.completionPercentage}%` }}
                            />
                            
                            {/* Date range text */}
                            <div className={`absolute inset-0 flex items-center justify-center text-xs font-medium ${colors.text} px-2`}>
                              <span className="truncate">
                                {format(item.startDate, 'dd MMM')} - {format(item.endDate, 'dd MMM')}
                              </span>
                            </div>
                            
                            {/* Assigned weight at the end */}
                            {item.assignedWeight > 0 && (
                              <div className="absolute left-full top-0 ml-3 flex items-center h-full">
                                <span className="text-xs font-medium text-slate-600 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-200">
                                  {item.assignedWeight.toFixed(1)}kg
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Received weight below the bar */}
                          {item.receivedWeight > 0 && (
                            <div
                              className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1"
                              style={{ marginLeft: barLeft + 4 }}
                            >
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                              {item.receivedWeight.toFixed(1)}kg received
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
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-8">
            <span className="text-sm font-medium text-slate-700">Step Types:</span>
            {['Jhalai', 'Dhol', 'Casting'].map(step => {
              const colors = getStepColors(step);
              return (
                <div key={step} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${colors.dark} shadow-sm`} />
                  <span className="text-sm text-slate-600">{step}</span>
                </div>
              );
            })}
            <div className="ml-4 flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-100 border border-slate-200" />
              <span className="text-sm text-slate-600">Pending Progress</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GanttChartView;
