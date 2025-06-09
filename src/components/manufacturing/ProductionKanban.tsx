import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors, useDroppable, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import AddProductionItemDialog from './AddProductionItemDialog';
import AssignmentDialog from './AssignmentDialog';
import DraggableCard from './DraggableCard';
import TaskDetailsDialog from './TaskDetailsDialog';

interface ProductionTask {
  id: string;
  productCode: string;
  category: string;
  subcategory: string;
  quantity: number;
  orderNumber: string;
  customerName: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignedWorker?: string;
  estimatedTime?: number;
  startedAt?: Date;
  notes?: string;
  expectedDate?: Date;
  createdAt?: Date;
  status?: string;
  receivedWeight?: number;
  receivedQuantity?: number;
  completedWeight?: number;
  completedQuantity?: number;
  parentTaskId?: string;
  isChildTask?: boolean;
}

const PROCESS_STEPS = [
  { id: 'pending', name: 'Pending', color: 'bg-gray-100' },
  { id: 'jhalai', name: 'Jhalai', color: 'bg-blue-100' },
  { id: 'quellai', name: 'Quellai', color: 'bg-yellow-100' },
  { id: 'meena', name: 'Meena', color: 'bg-purple-100' },
  { id: 'vibrator', name: 'Vibrator', color: 'bg-green-100' },
  { id: 'quality-check', name: 'Quality Check', color: 'bg-orange-100' },
  { id: 'completed', name: 'Completed', color: 'bg-emerald-100' }
];

// Mock data for demonstration
const initialMockTasks: { [key: string]: ProductionTask[] } = {
  pending: [
    {
      id: '1',
      productCode: 'RCC-12-SM',
      category: 'RCC Pipe',
      subcategory: 'Standard',
      quantity: 50,
      orderNumber: 'OD000123',
      customerName: 'ABC Construction',
      priority: 'High',
      createdAt: new Date('2024-12-08'),
      expectedDate: new Date('2024-12-15')
    },
    {
      id: '2', 
      productCode: 'RCC-18-HD',
      category: 'RCC Pipe',
      subcategory: 'Heavy Duty',
      quantity: 25,
      orderNumber: 'OD000124',
      customerName: 'XYZ Builders',
      priority: 'Medium',
      createdAt: new Date('2024-12-09'),
      expectedDate: new Date('2024-12-20')
    }
  ],
  jhalai: [
    {
      id: '3',
      productCode: 'RCC-15-ST',
      category: 'RCC Pipe',
      subcategory: 'Standard',
      quantity: 30,
      orderNumber: 'OD000121',
      customerName: 'PQR Infrastructure',
      priority: 'Urgent',
      assignedWorker: 'Rajesh Kumar',
      startedAt: new Date(),
      estimatedTime: 120,
      expectedDate: new Date('2024-12-12')
    }
  ],
  quellai: [
    {
      id: '4',
      productCode: 'RCC-20-HD',
      category: 'RCC Pipe', 
      subcategory: 'Heavy Duty',
      quantity: 40,
      orderNumber: 'OD000120',
      customerName: 'MNO Contractors',
      priority: 'High',
      assignedWorker: 'Suresh Patel',
      startedAt: new Date(Date.now() - 3600000),
      estimatedTime: 180
    }
  ],
  meena: [],
  vibrator: [
    {
      id: '5',
      productCode: 'RCC-12-ST',
      category: 'RCC Pipe',
      subcategory: 'Standard', 
      quantity: 60,
      orderNumber: 'OD000119',
      customerName: 'LMN Builders',
      priority: 'Medium',
      assignedWorker: 'Anil Sharma',
      startedAt: new Date(Date.now() - 7200000),
      estimatedTime: 90
    }
  ],
  'quality-check': [],
  completed: [
    {
      id: '6',
      productCode: 'RCC-18-ST',
      category: 'RCC Pipe',
      subcategory: 'Standard',
      quantity: 35,
      orderNumber: 'OD000118',
      customerName: 'DEF Construction',
      priority: 'Low',
      assignedWorker: 'Vinod Singh'
    }
  ]
};

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
  const [tasks, setTasks] = useState(initialMockTasks);
  const [activeTask, setActiveTask] = useState<ProductionTask | null>(null);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState<ProductionTask | null>(null);
  const [taskDetailsDialogOpen, setTaskDetailsDialogOpen] = useState(false);
  
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
    const newTask: ProductionTask = {
      id: `new-${Date.now()}`,
      productCode: newItem.productCode,
      category: 'RCC Pipe',
      subcategory: 'Standard',
      quantity: newItem.quantity,
      orderNumber: `OD${String(Date.now()).slice(-6)}`,
      customerName: 'Production Request',
      priority: 'Medium',
      expectedDate: newItem.expectedDate,
      createdAt: new Date(),
    };

    setTasks(prev => ({
      ...prev,
      pending: [...(prev.pending || []), newTask]
    }));
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

    // Special handling for Pending → Jalhai
    if (activeStepId === 'pending' && overStepId === 'jhalai') {
      console.log('Opening assignment dialog for Pending → Jhalai');
      setTaskToAssign(activeTask);
      setAssignmentDialogOpen(true);
      return;
    }

    // Move task for other steps
    if (activeTask) {
      console.log('Moving task to different step');
      moveTask(activeTask.id, activeStepId, overStepId);
    }
  };

  const moveTask = (taskId: string, fromStep: string, toStep: string, updatedTask?: Partial<ProductionTask>) => {
    console.log('Moving task:', { taskId, fromStep, toStep, updatedTask });
    
    setTasks(prev => {
      const newTasks = { ...prev };
      
      // Find and remove task from source step
      const taskIndex = newTasks[fromStep]?.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        console.log('Task not found in source step');
        return prev;
      }
      
      const [task] = newTasks[fromStep].splice(taskIndex, 1);
      
      // Add task to destination step with any updates
      if (!newTasks[toStep]) newTasks[toStep] = [];
      newTasks[toStep].push({ ...task, ...updatedTask });
      
      console.log('Task moved successfully');
      return newTasks;
    });
  };

  const handleAssignment = (assignment: {
    taskId: string;
    workerId: string;
    workerName: string;
    expectedDate: Date;
    remarks?: string;
  }) => {
    console.log('Handling assignment:', assignment);
    
    moveTask(assignment.taskId, 'pending', 'jhalai', {
      assignedWorker: assignment.workerName,
      expectedDate: assignment.expectedDate,
      startedAt: new Date(),
      notes: assignment.remarks,
      status: 'Progress'
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
    
    setTasks(prev => {
      const newTasks = { ...prev };
      let updatedTask: ProductionTask | undefined;
      let stepId: string | undefined;
      
      // Find the task in the current step
      for (const currentStepId in newTasks) {
        const taskIndex = newTasks[currentStepId]?.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          // Update the task with new status and additional data
          stepId = currentStepId;
          updatedTask = {
            ...newTasks[currentStepId][taskIndex],
            status: newStatus,
            ...(additionalData?.weight !== undefined && { receivedWeight: additionalData.weight }),
            ...(additionalData?.quantity !== undefined && { receivedQuantity: additionalData.quantity }),
            ...(additionalData?.completedWeight !== undefined && { completedWeight: additionalData.completedWeight }),
            ...(additionalData?.completedQuantity !== undefined && { completedQuantity: additionalData.completedQuantity })
          };
          newTasks[currentStepId][taskIndex] = updatedTask;
          break;
        }
      }
      
      // Handle child task creation for partially completed items
      if (additionalData?.createChildTask && updatedTask && stepId) {
        const completedWeight = additionalData.completedWeight || 0;
        const completedQuantity = additionalData.completedQuantity || 0;
        const receivedWeight = updatedTask.receivedWeight || 0;
        const receivedQuantity = updatedTask.receivedQuantity || 0;
        
        // Create child task with remaining work
        if (receivedWeight > completedWeight || receivedQuantity > completedQuantity) {
          const remainingWeight = receivedWeight - completedWeight;
          const remainingQuantity = receivedQuantity - completedQuantity;
          
          const childTask: ProductionTask = {
            id: `child-${updatedTask.id}-${Date.now()}`,
            productCode: updatedTask.productCode,
            category: updatedTask.category,
            subcategory: updatedTask.subcategory,
            quantity: remainingQuantity,
            orderNumber: updatedTask.orderNumber,
            customerName: updatedTask.customerName,
            priority: updatedTask.priority,
            expectedDate: updatedTask.expectedDate,
            createdAt: new Date(),
            notes: `Remaining work from partially completed task #${updatedTask.id}`,
            status: 'Progress',
            receivedWeight: remainingWeight,
            receivedQuantity: remainingQuantity,
            parentTaskId: updatedTask.id,
            isChildTask: true
          };
          
          // Add to pending queue
          if (!newTasks['pending']) newTasks['pending'] = [];
          newTasks['pending'].push(childTask);
          
          console.log('Created child task for remaining work:', childTask);
        }
      }
      
      return newTasks;
    });
  };

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
              tasks={tasks[step.id] || []}
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
