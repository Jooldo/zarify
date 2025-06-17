
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, ChevronLeft, ChevronRight, Filter, User } from 'lucide-react';
import { useWorkers } from '@/hooks/useWorkers';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import { format, addDays, startOfWeek, endOfWeek, isToday, isSameDay, parseISO } from 'date-fns';

interface GanttTask {
  id: string;
  workerId: string;
  workerName: string;
  stepName: string;
  orderId: string;
  orderNumber: string;
  quantity: number;
  status: 'pending' | 'in_progress' | 'completed';
  assignedDate: Date;
  dueDate: Date;
  priority: string;
}

interface GanttViewProps {
  onViewDetails?: (orderId: string) => void;
}

const ProductionGanttView: React.FC<GanttViewProps> = ({ onViewDetails }) => {
  const { workers } = useWorkers();
  const { manufacturingOrders } = useManufacturingOrders();
  const { orderSteps } = useManufacturingSteps();
  
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [filterWorker, setFilterWorker] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Generate date range for the current view
  const dateRange = useMemo(() => {
    const start = startOfWeek(currentWeek);
    const daysToShow = viewMode === 'week' ? 7 : 30;
    return Array.from({ length: daysToShow }, (_, i) => addDays(start, i));
  }, [currentWeek, viewMode]);

  // Process data to create Gantt tasks
  const ganttTasks = useMemo(() => {
    const tasks: GanttTask[] = [];

    orderSteps.forEach(orderStep => {
      if (!orderStep.assigned_worker_id || !orderStep.manufacturing_steps) return;

      const worker = workers.find(w => w.id === orderStep.assigned_worker_id);
      const order = manufacturingOrders.find(o => o.id === orderStep.manufacturing_order_id);
      
      if (!worker || !order) return;

      // Calculate dates based on step data
      const assignedDate = orderStep.started_at 
        ? parseISO(orderStep.started_at) 
        : parseISO(orderStep.created_at);
      
      const dueDate = order.due_date 
        ? parseISO(order.due_date) 
        : addDays(assignedDate, orderStep.manufacturing_steps.estimated_duration_hours || 24);

      tasks.push({
        id: orderStep.id,
        workerId: worker.id,
        workerName: worker.name,
        stepName: orderStep.manufacturing_steps.step_name,
        orderId: order.id,
        orderNumber: order.order_number,
        quantity: order.quantity_required,
        status: orderStep.status as 'pending' | 'in_progress' | 'completed',
        assignedDate,
        dueDate,
        priority: order.priority,
      });
    });

    return tasks;
  }, [orderSteps, workers, manufacturingOrders]);

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    return ganttTasks.filter(task => {
      if (filterWorker && !task.workerName.toLowerCase().includes(filterWorker.toLowerCase())) {
        return false;
      }
      if (filterStatus && task.status !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [ganttTasks, filterWorker, filterStatus]);

  // Group tasks by worker
  const workerTasks = useMemo(() => {
    const grouped = new Map<string, GanttTask[]>();
    
    filteredTasks.forEach(task => {
      if (!grouped.has(task.workerId)) {
        grouped.set(task.workerId, []);
      }
      grouped.get(task.workerId)!.push(task);
    });

    return grouped;
  }, [filteredTasks]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-400';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  // Calculate task position and width
  const getTaskPosition = (task: GanttTask) => {
    const startDate = dateRange[0];
    const endDate = dateRange[dateRange.length - 1];
    
    // Clamp task dates to visible range
    const taskStart = task.assignedDate < startDate ? startDate : task.assignedDate;
    const taskEnd = task.dueDate > endDate ? endDate : task.dueDate;
    
    if (taskStart > endDate || taskEnd < startDate) {
      return null; // Task is outside visible range
    }

    const totalDays = dateRange.length;
    const startOffset = Math.max(0, Math.floor((taskStart.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)));
    const duration = Math.max(1, Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (24 * 60 * 60 * 1000)));
    
    const leftPercent = (startOffset / totalDays) * 100;
    const widthPercent = Math.min((duration / totalDays) * 100, 100 - leftPercent);

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
    };
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const days = viewMode === 'week' ? 7 : 30;
    setCurrentWeek(prev => addDays(prev, direction === 'next' ? days : -days));
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 min-w-48">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">
              {format(dateRange[0], 'MMM d')} - {format(dateRange[dateRange.length - 1], 'MMM d, yyyy')}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Select value={viewMode} onValueChange={(value: 'week' | 'month') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="month">Month View</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Filter workers..."
            value={filterWorker}
            onChange={(e) => setFilterWorker(e.target.value)}
            className="w-40"
          />

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Gantt Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Worker Timeline</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border rounded-lg overflow-hidden">
            {/* Date Header */}
            <div className="bg-muted/20 border-b sticky top-0 z-10">
              <div className="flex">
                <div className="w-48 border-r bg-background p-3 font-medium">Worker</div>
                <div className="flex-1 flex">
                  {dateRange.map((date, index) => (
                    <div
                      key={index}
                      className={`flex-1 p-3 text-center text-sm border-r ${
                        isToday(date) ? 'bg-blue-50 font-medium' : ''
                      }`}
                    >
                      <div className="font-medium">{format(date, 'EEE')}</div>
                      <div className="text-xs text-muted-foreground">{format(date, 'MMM d')}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Worker Rows */}
            <ScrollArea className="h-96">
              {Array.from(workerTasks.entries()).map(([workerId, tasks]) => {
                const worker = workers.find(w => w.id === workerId);
                if (!worker) return null;

                return (
                  <div key={workerId} className="border-b">
                    <div className="flex min-h-16">
                      {/* Worker Name */}
                      <div className="w-48 border-r p-3 flex items-center gap-2 bg-background">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">{worker.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="flex-1 relative p-2">
                        <TooltipProvider>
                          {tasks.map((task) => {
                            const position = getTaskPosition(task);
                            if (!position) return null;

                            return (
                              <Tooltip key={task.id}>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`absolute h-6 rounded cursor-pointer border-l-4 ${getStatusColor(task.status)} ${getPriorityColor(task.priority)} hover:opacity-80 transition-opacity`}
                                    style={{
                                      left: position.left,
                                      width: position.width,
                                      top: `${tasks.indexOf(task) * 28}px`,
                                    }}
                                    onClick={() => onViewDetails?.(task.orderId)}
                                  >
                                    <div className="px-2 py-1 text-xs text-white truncate">
                                      {task.stepName} - {task.orderNumber}
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  <div className="space-y-1">
                                    <div className="font-medium">{task.stepName}</div>
                                    <div className="text-xs space-y-1">
                                      <div>Order: {task.orderNumber}</div>
                                      <div>Quantity: {task.quantity}</div>
                                      <div>Assigned: {format(task.assignedDate, 'MMM d, yyyy')}</div>
                                      <div>Due: {format(task.dueDate, 'MMM d, yyyy')}</div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">
                                          {task.status.replace('_', ' ')}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          {task.priority}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                );
              })}

              {workerTasks.size === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No workers with assigned tasks found</p>
                  <p className="text-sm">Try adjusting your filters or check if workers are assigned to manufacturing steps</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 border-l-4 border-l-red-500 bg-gray-200"></div>
            <span>Urgent Priority</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductionGanttView;
