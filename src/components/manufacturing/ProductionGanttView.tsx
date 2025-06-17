
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useWorkers } from '@/hooks/useWorkers';
import { format, addDays, differenceInDays, startOfWeek, endOfWeek } from 'date-fns';

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
      if (!orderStep.assigned_worker_id || orderStep.status === 'completed') return;

      const order = manufacturingOrders.find(o => o.id === orderStep.manufacturing_order_id);
      const stepDefinition = manufacturingSteps.find(s => s.id === orderStep.manufacturing_step_id);
      const worker = workers.find(w => w.id === orderStep.assigned_worker_id);

      if (!order || !stepDefinition || !worker) return;

      // Calculate start and end dates
      const startDate = orderStep.started_at ? new Date(orderStep.started_at) : new Date();
      const estimatedDuration = stepDefinition.estimated_duration_hours || 24;
      const endDate = order.due_date ? new Date(order.due_date) : addDays(startDate, Math.ceil(estimatedDuration / 24));

      tasks.push({
        id: orderStep.id,
        workerId: worker.id,
        workerName: worker.name,
        orderNumber: order.order_number,
        stepName: stepDefinition.step_name,
        startDate,
        endDate,
        status: orderStep.status,
        priority: order.priority,
        productName: order.product_name,
      });
    });

    return tasks;
  }, [orderSteps, manufacturingOrders, manufacturingSteps, workers]);

  // Group tasks by worker
  const tasksByWorker = useMemo(() => {
    const grouped: Record<string, GanttTask[]> = {};
    
    workers.forEach(worker => {
      grouped[worker.id] = ganttTasks.filter(task => task.workerId === worker.id);
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
      default: return 'border-gray-300 bg-gray-100';
    }
  };

  const getTaskPosition = (task: GanttTask) => {
    const startCol = timelineDates.findIndex(date => 
      format(date, 'yyyy-MM-dd') === format(task.startDate, 'yyyy-MM-dd')
    );
    const endCol = timelineDates.findIndex(date => 
      format(date, 'yyyy-MM-dd') === format(task.endDate, 'yyyy-MM-dd')
    );
    
    const start = Math.max(0, startCol);
    const end = Math.min(timelineDates.length - 1, endCol);
    const span = Math.max(1, end - start + 1);
    
    return { start, span };
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
              {workers.map((worker) => (
                <div key={worker.id} className="grid grid-cols-[200px_1fr] gap-0 border-b min-h-[60px]">
                  {/* Worker Info */}
                  <div className="p-3 border-r bg-white flex flex-col justify-center">
                    <div className="font-medium text-sm">{worker.name}</div>
                    <div className="text-xs text-gray-500">
                      {tasksByWorker[worker.id]?.length || 0} tasks
                    </div>
                  </div>

                  {/* Timeline Grid */}
                  <div className="relative grid grid-cols-21 bg-white">
                    {timelineDates.map((_, index) => (
                      <div
                        key={index}
                        className="border-r border-gray-100 min-h-[60px]"
                      />
                    ))}
                    
                    {/* Task Bars */}
                    {tasksByWorker[worker.id]?.map((task, taskIndex) => {
                      const { start, span } = getTaskPosition(task);
                      if (start < 0 || start >= timelineDates.length) return null;
                      
                      return (
                        <div
                          key={task.id}
                          className={`absolute h-8 rounded border-2 ${getStatusColor(task.status)} ${getPriorityColor(task.priority)} shadow-sm cursor-pointer hover:shadow-md transition-shadow z-10`}
                          style={{
                            left: `${(start / timelineDates.length) * 100}%`,
                            width: `${(span / timelineDates.length) * 100}%`,
                            top: `${8 + taskIndex * 16}px`,
                          }}
                          title={`${task.orderNumber} - ${task.stepName} (${task.productName})`}
                        >
                          <div className="px-2 py-1 text-xs truncate text-white font-medium">
                            {task.orderNumber}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Legend */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Legend</h4>
                <div className="flex flex-wrap gap-4 text-xs">
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
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-300 bg-blue-100 rounded"></div>
                    <span>In Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 bg-gray-100 rounded"></div>
                    <span>Pending</span>
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
