
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useWorkers } from '@/hooks/useWorkers';
import { format, addDays, differenceInDays, startOfWeek, endOfWeek, addHours, parseISO } from 'date-fns';

interface GanttTask {
  id: string;
  workerId: string;
  workerName: string;
  orderNumber: string;
  stepName: string;
  startDate: Date;
  endDate: Date;
  status: string;
  priority: string;
  productName: string;
  estimatedHours: number;
}

const ProductionGanttView = () => {
  const { manufacturingOrders } = useManufacturingOrders();
  const { orderSteps, manufacturingSteps } = useManufacturingSteps();
  const { workers } = useWorkers();

  // Generate timeline dates (current week + next 2 weeks)
  const timelineDates = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const dates = [];
    
    for (let i = 0; i < 21; i++) { // 3 weeks
      dates.push(addDays(weekStart, i));
    }
    
    return dates;
  }, []);

  // Process data into Gantt tasks
  const ganttTasks = useMemo(() => {
    const tasks: GanttTask[] = [];

    orderSteps.forEach(orderStep => {
      if (!orderStep.assigned_worker_id) return;
      
      // Include pending, in_progress, and recently completed tasks
      if (!['pending', 'in_progress', 'completed'].includes(orderStep.status)) return;

      const order = manufacturingOrders.find(o => o.id === orderStep.manufacturing_order_id);
      const stepDefinition = manufacturingSteps.find(s => s.id === orderStep.manufacturing_step_id);
      const worker = workers.find(w => w.id === orderStep.assigned_worker_id);

      if (!order || !stepDefinition || !worker) return;

      // Calculate task start and end dates more accurately
      let taskStartDate: Date;
      let taskEndDate: Date;
      
      const estimatedHours = stepDefinition.estimated_duration_hours || 8;
      
      if (orderStep.started_at) {
        // If already started, use the actual start date
        taskStartDate = parseISO(orderStep.started_at);
        
        if (orderStep.completed_at) {
          // If completed, use actual completion date
          taskEndDate = parseISO(orderStep.completed_at);
        } else {
          // If in progress, estimate end date based on estimated duration
          taskEndDate = addHours(taskStartDate, estimatedHours);
        }
      } else {
        // If not started yet, estimate start date based on current time or order due date
        const now = new Date();
        const orderDueDate = order.due_date ? parseISO(order.due_date) : addDays(now, 7);
        
        // For pending tasks, start from now or a reasonable time
        taskStartDate = now;
        taskEndDate = addHours(taskStartDate, estimatedHours);
        
        // If this would go past the order due date, adjust backwards
        if (taskEndDate > orderDueDate) {
          taskEndDate = orderDueDate;
          taskStartDate = addHours(taskEndDate, -estimatedHours);
        }
      }

      tasks.push({
        id: orderStep.id,
        workerId: worker.id,
        workerName: worker.name,
        orderNumber: order.order_number,
        stepName: stepDefinition.step_name,
        startDate: taskStartDate,
        endDate: taskEndDate,
        status: orderStep.status,
        priority: order.priority,
        productName: order.product_name,
        estimatedHours: estimatedHours,
      });
    });

    return tasks.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [orderSteps, manufacturingOrders, manufacturingSteps, workers]);

  // Group tasks by worker and handle overlaps
  const tasksByWorker = useMemo(() => {
    const grouped: Record<string, GanttTask[]> = {};
    
    workers.forEach(worker => {
      const workerTasks = ganttTasks.filter(task => task.workerId === worker.id);
      
      // Sort tasks by start date and handle overlaps by creating lanes
      const sortedTasks = workerTasks.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      
      grouped[worker.id] = sortedTasks;
    });
    
    return grouped;
  }, [ganttTasks, workers]);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'border-gray-300 bg-gray-100';
      case 'in_progress': return 'border-blue-300 bg-blue-100';
      case 'completed': return 'border-green-300 bg-green-100';
      default: return 'border-gray-300 bg-gray-100';
    }
  };

  const getTaskPosition = (task: GanttTask) => {
    const timelineStart = timelineDates[0];
    const timelineEnd = timelineDates[timelineDates.length - 1];
    
    // Calculate position based on actual dates within the timeline
    const totalTimelineDays = differenceInDays(timelineEnd, timelineStart);
    const taskStartDays = Math.max(0, differenceInDays(task.startDate, timelineStart));
    const taskEndDays = Math.min(totalTimelineDays, differenceInDays(task.endDate, timelineStart));
    
    const startPercentage = (taskStartDays / totalTimelineDays) * 100;
    const widthPercentage = Math.max(1, ((taskEndDays - taskStartDays) / totalTimelineDays) * 100);
    
    return { 
      left: `${startPercentage}%`, 
      width: `${widthPercentage}%`
    };
  };

  const formatTaskTooltip = (task: GanttTask) => {
    const duration = differenceInDays(task.endDate, task.startDate);
    const durationText = duration === 0 ? 'Same day' : `${duration} day(s)`;
    
    return `${task.orderNumber} - ${task.stepName}
Product: ${task.productName}
Priority: ${task.priority}
Status: ${task.status}
Duration: ${durationText}
Start: ${format(task.startDate, 'MMM dd, HH:mm')}
End: ${format(task.endDate, 'MMM dd, HH:mm')}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Production Gantt Chart
            <Badge variant="outline" className="text-xs">
              {workers.length} Workers • {ganttTasks.length} Active Tasks
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full">
            <div className="min-w-[1200px]">
              {/* Timeline Header */}
              <div className="grid grid-cols-[200px_1fr] gap-0 border-b">
                <div className="p-3 bg-gray-50 font-semibold text-sm border-r">
                  Worker
                </div>
                <div className="grid grid-cols-21 bg-gray-50">
                  {timelineDates.map((date, index) => (
                    <div
                      key={index}
                      className="p-2 text-xs font-medium text-center border-r border-gray-200 min-w-[40px]"
                    >
                      <div>{format(date, 'dd')}</div>
                      <div className="text-gray-500">{format(date, 'MMM')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Worker Rows */}
              {workers.map((worker) => {
                const workerTasks = tasksByWorker[worker.id] || [];
                const rowHeight = Math.max(60, workerTasks.length * 35 + 20); // Dynamic height based on task count
                
                return (
                  <div key={worker.id} className="grid grid-cols-[200px_1fr] gap-0 border-b" style={{ minHeight: `${rowHeight}px` }}>
                    {/* Worker Info */}
                    <div className="p-3 border-r bg-white flex flex-col justify-center">
                      <div className="font-medium text-sm">{worker.name}</div>
                      <div className="text-xs text-gray-500">
                        {workerTasks.length} task{workerTasks.length !== 1 ? 's' : ''}
                      </div>
                      {workerTasks.length > 0 && (
                        <div className="text-xs text-blue-600 mt-1">
                          {workerTasks.filter(t => t.status === 'in_progress').length} in progress
                        </div>
                      )}
                    </div>

                    {/* Timeline Grid */}
                    <div className="relative grid grid-cols-21 bg-white">
                      {timelineDates.map((_, index) => (
                        <div
                          key={index}
                          className="border-r border-gray-100"
                          style={{ minHeight: `${rowHeight}px` }}
                        />
                      ))}
                      
                      {/* Task Bars */}
                      {workerTasks.map((task, taskIndex) => {
                        const position = getTaskPosition(task);
                        
                        return (
                          <div
                            key={task.id}
                            className={`absolute h-7 rounded border-2 ${getStatusColor(task.status)} ${getPriorityColor(task.priority)} shadow-sm cursor-pointer hover:shadow-md transition-shadow z-10 overflow-hidden`}
                            style={{
                              left: position.left,
                              width: position.width,
                              top: `${10 + taskIndex * 32}px`,
                            }}
                            title={formatTaskTooltip(task)}
                          >
                            <div className="px-2 py-1 text-xs truncate text-white font-medium">
                              {task.orderNumber} - {task.stepName}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Legend */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-3">Legend</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium mb-2">Priority:</div>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span>Urgent</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-500 rounded"></div>
                        <span>High</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span>Medium</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span>Low</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium mb-2">Status:</div>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 bg-gray-100 rounded"></div>
                        <span>Pending</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-300 bg-blue-100 rounded"></div>
                        <span>In Progress</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-green-300 bg-green-100 rounded"></div>
                        <span>Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionGanttView;
