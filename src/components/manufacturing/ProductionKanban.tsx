import { useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors, useDroppable, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import AddProductionItemDialog from './AddProductionItemDialog';
import AssignmentDialog from './AssignmentDialog';
import DraggableCard from './DraggableCard';
import TaskDetailsDialog from './TaskDetailsDialog';
import { useProductionTasks, ProductionTask } from '@/hooks/useProductionTasks';
import { useProductionStepHistory } from '@/hooks/useProductionStepHistory';

const PROCESS_STEPS = [
  { id: 'pending', name: 'Pending', color: 'bg-gray-100' },
  { id: 'jhalai', name: 'Jhalai', color: 'bg-blue-100' },
  { id: 'quellai', name: 'Quellai', color: 'bg-yellow-100' },
  { id: 'meena', name: 'Meena', color: 'bg-purple-100' },
  { id: 'vibrator', name: 'Vibrator', color: 'bg-green-100' },
  { id: 'quality-check', name: 'Quality Check', color: 'bg-orange-100' },
  { id: 'completed', name: 'Completed', color: 'bg-emerald-100' }
];

// Valid production steps for type checking
const VALID_PRODUCTION_STEPS: ProductionTask['current_step'][] = [
  'pending', 'jhalai', 'quellai', 'meena', 'vibrator', 'quality-check', 'completed'
];

// Droppable step component
const DroppableStep = ({ step, tasks, onTaskClick }: { 
  step: { id: string; name: string; color: string }, 
  tasks: ProductionTask[], 
  onTaskClick: (task: ProductionTask, stepId: string) => void 
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: step.id,
  });

  const style = {
    backgroundColor: isOver ? 'rgba(59, 130, 246, 0.1)' : undefined,
  };

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${step.color} border`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{step.name}</h3>
            <p className="text-sm text-muted-foreground">
              {tasks.length || 0} tasks in progress
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {tasks.length || 0}
          </Badge>
        </div>
      </div>
      
      <div 
        ref={setNodeRef}
        style={style}
        className="min-h-[120px] relative"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tasks.map(task => (
              <DraggableCard 
                key={task.id}
                task={task}
                stepId={step.id}
                onTaskClick={(task) => onTaskClick(task, step.id)}
              />
            ))}
            
            {/* Empty state */}
            {tasks.length === 0 && (
              <div className="col-span-full border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No tasks in {step.name}</p>
                <p className="text-xs text-gray-400 mt-1">Tasks will appear here when assigned to this step</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

const ProductionKanban = () => {
  const [selectedTask, setSelectedTask] = useState<ProductionTask | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string>('');
  const [activeTask, setActiveTask] = useState<ProductionTask | null>(null);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState<ProductionTask | null>(null);
  const [taskDetailsDialogOpen, setTaskDetailsDialogOpen] = useState(false);
  
  const { tasksByStep, isLoading, createTask, moveTask, updateTask } = useProductionTasks();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleTaskClick = (task: ProductionTask, stepId: string) => {
    setSelectedTask(task);
    setSelectedStepId(stepId);
    setTaskDetailsDialogOpen(true);
  };

  const handleAddItem = (newItem: {
    productCode: string;
    quantity: number;
    expectedDate: Date;
  }) => {
    // Find the product config by product code
    // This should be enhanced to actually find the product config
    createTask({
      product_config_id: 'temp-id', // This should be the actual product config ID
      order_number: `OD${String(Date.now()).slice(-6)}`,
      customer_name: 'Production Request',
      quantity: newItem.quantity,
      priority: 'Medium',
      expected_date: newItem.expectedDate.toISOString().split('T')[0],
      current_step: 'pending',
      status: 'Created',
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = active.data.current?.task;
    setActiveTask(task);
    console.log('Drag started:', { taskId: active.id, task });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    console.log('Drag ended:', { active: active.id, over: over?.id });

    if (!over) {
      console.log('No drop target');
      return;
    }

    const activeTask = active.data.current?.task;
    const activeStepId = active.data.current?.stepId;
    const overStepId = over.id as string;

    console.log('Drop details:', { activeTask, activeStepId, overStepId });

    // If dropping in the same step, do nothing
    if (activeStepId === overStepId) {
      console.log('Dropped in same step, no action needed');
      return;
    }

    // Validate that overStepId is a valid production step
    if (!VALID_PRODUCTION_STEPS.includes(overStepId as ProductionTask['current_step'])) {
      console.log('Invalid drop target step:', overStepId);
      return;
    }

    // Special handling for transitions that require assignment
    if ((activeStepId === 'pending' && overStepId === 'jhalai') ||
        (activeStepId === 'jhalai' && overStepId === 'quellai') ||
        (activeStepId === 'quellai' && overStepId === 'meena') ||
        (activeStepId === 'meena' && overStepId === 'vibrator') ||
        (activeStepId === 'vibrator' && overStepId === 'quality-check')) {
      console.log('Opening assignment dialog for step transition');
      setTaskToAssign(activeTask);
      setAssignmentDialogOpen(true);
      return;
    }

    // Move task for other steps
    if (activeTask) {
      console.log('Moving task to different step');
      moveTask({
        taskId: activeTask.id,
        toStep: overStepId as ProductionTask['current_step'],
      });
    }
  };

  const handleAssignment = (assignment: {
    taskId: string;
    workerId: string;
    workerName: string;
    expectedDate: Date;
    remarks?: string;
  }) => {
    console.log('Handling assignment:', assignment);
    
    // Determine which step to move to based on current task
    const activeTask = taskToAssign;
    if (!activeTask) return;

    let toStep: ProductionTask['current_step'] = 'jhalai';
    if (activeTask.current_step === 'pending') {
      toStep = 'jhalai';
    } else if (activeTask.current_step === 'jhalai') {
      toStep = 'quellai';
    } else if (activeTask.current_step === 'quellai') {
      toStep = 'meena';
    } else if (activeTask.current_step === 'meena') {
      toStep = 'vibrator';
    } else if (activeTask.current_step === 'vibrator') {
      toStep = 'quality-check';
    }
    
    moveTask({
      taskId: assignment.taskId,
      toStep,
      additionalUpdates: {
        assigned_worker_id: assignment.workerId,
        assigned_worker_name: assignment.workerName,
        expected_date: assignment.expectedDate.toISOString().split('T')[0],
        started_at: new Date().toISOString(),
        notes: assignment.remarks,
        status: 'Progress'
      }
    });
    
    setTaskToAssign(null);
  };

  const handleStatusUpdate = (taskId: string, newStatus: string, additionalData?: { 
    weight?: number; 
    quantity?: number;
    completedWeight?: number;
    completedQuantity?: number;
    createChildTask?: boolean;
  }) => {
    console.log('Updating task status:', { taskId, newStatus, additionalData });
    
    const updates: Partial<ProductionTask> = {
      status: newStatus as any,
      ...(additionalData?.weight !== undefined && { received_weight: additionalData.weight }),
      ...(additionalData?.quantity !== undefined && { received_quantity: additionalData.quantity }),
      ...(additionalData?.completedWeight !== undefined && { completed_weight: additionalData.completedWeight }),
      ...(additionalData?.completedQuantity !== undefined && { completed_quantity: additionalData.completedQuantity })
    };

    updateTask({ id: taskId, updates });

    // Handle child task creation for partially completed items
    if (additionalData?.createChildTask) {
      const originalTask = Object.values(tasksByStep).flat().find(t => t.id === taskId);
      if (originalTask && additionalData.completedWeight && additionalData.completedQuantity) {
        const completedWeight = additionalData.completedWeight;
        const completedQuantity = additionalData.completedQuantity;
        const receivedWeight = originalTask.received_weight || 0;
        const receivedQuantity = originalTask.received_quantity || originalTask.quantity || 0;
        
        // Create child task with remaining work
        if (receivedWeight > completedWeight || receivedQuantity > completedQuantity) {
          const remainingWeight = receivedWeight - completedWeight;
          const remainingQuantity = receivedQuantity - completedQuantity;
          
          createTask({
            product_config_id: originalTask.product_config_id,
            order_number: originalTask.order_number,
            customer_name: originalTask.customer_name,
            quantity: remainingQuantity,
            priority: originalTask.priority,
            expected_date: originalTask.expected_date,
            notes: `Remaining work from partially completed task #${originalTask.id}`,
            status: 'Progress',
            received_weight: remainingWeight,
            received_quantity: remainingQuantity,
            parent_task_id: originalTask.id,
            is_child_task: true,
            current_step: 'pending'
          });
          
          console.log('Created child task for remaining work');
        }
      }
    }
  };

  if (isLoading) {
    return <div>Loading production tasks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Production Queue</h2>
          <p className="text-muted-foreground">Track manufacturing progress across process steps</p>
        </div>
        <AddProductionItemDialog onAddItem={handleAddItem} />
      </div>

      <DndContext 
        sensors={sensors} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-6">
          {PROCESS_STEPS.map(step => (
            <DroppableStep
              key={step.id}
              step={step}
              tasks={tasksByStep[step.id] || []}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <DraggableCard 
              task={activeTask} 
              stepId="overlay"
              onTaskClick={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <AssignmentDialog 
        open={assignmentDialogOpen}
        onOpenChange={setAssignmentDialogOpen}
        task={taskToAssign}
        onAssign={handleAssignment}
      />

      <TaskDetailsDialog
        open={taskDetailsDialogOpen}
        onOpenChange={setTaskDetailsDialogOpen}
        task={selectedTask}
        stepId={selectedStepId}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default ProductionKanban;
