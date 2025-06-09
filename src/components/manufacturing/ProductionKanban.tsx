
import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import AddProductionItemDialog from './AddProductionItemDialog';
import AssignmentDialog from './AssignmentDialog';
import DraggableCard from './DraggableCard';

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

const ProductionKanban = () => {
  const [selectedTask, setSelectedTask] = useState<ProductionTask | null>(null);
  const [tasks, setTasks] = useState(initialMockTasks);
  const [activeTask, setActiveTask] = useState<ProductionTask | null>(null);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState<ProductionTask | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleTaskClick = (task: ProductionTask) => {
    setSelectedTask(task);
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
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = active.data.current?.task;
    const activeStepId = active.data.current?.stepId;
    const overStepId = over.id as string;

    // If dropping in the same step, do nothing
    if (activeStepId === overStepId) return;

    // Special handling for Pending → Jalhai
    if (activeStepId === 'pending' && overStepId === 'jhalai') {
      setTaskToAssign(activeTask);
      setAssignmentDialogOpen(true);
      return;
    }

    // Move task for other steps
    if (activeTask) {
      moveTask(activeTask.id, activeStepId, overStepId);
    }
  };

  const moveTask = (taskId: string, fromStep: string, toStep: string, updatedTask?: Partial<ProductionTask>) => {
    setTasks(prev => {
      const newTasks = { ...prev };
      
      // Find and remove task from source step
      const taskIndex = newTasks[fromStep]?.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return prev;
      
      const [task] = newTasks[fromStep].splice(taskIndex, 1);
      
      // Add task to destination step with any updates
      if (!newTasks[toStep]) newTasks[toStep] = [];
      newTasks[toStep].push({ ...task, ...updatedTask });
      
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
    moveTask(assignment.taskId, 'pending', 'jhalai', {
      assignedWorker: assignment.workerName,
      expectedDate: assignment.expectedDate,
      startedAt: new Date(),
      notes: assignment.remarks,
    });
    
    setTaskToAssign(null);
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
            <div key={step.id} className="space-y-4">
              <div className={`p-4 rounded-lg ${step.color} border`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{step.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tasks[step.id]?.length || 0} tasks in progress
                    </p>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {tasks[step.id]?.length || 0}
                  </Badge>
                </div>
              </div>
              
              <SortableContext items={tasks[step.id]?.map(t => t.id) || []} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-h-[120px] relative">
                  {/* Drop zone overlay */}
                  <div 
                    id={step.id}
                    className="absolute inset-0 pointer-events-none"
                  />
                  
                  {tasks[step.id]?.map(task => (
                    <DraggableCard 
                      key={task.id}
                      task={task}
                      stepId={step.id}
                      onTaskClick={handleTaskClick}
                    />
                  ))}
                  
                  {/* Empty state */}
                  {(!tasks[step.id] || tasks[step.id].length === 0) && (
                    <div className="col-span-full border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No tasks in {step.name}</p>
                      <p className="text-xs text-gray-400 mt-1">Tasks will appear here when assigned to this step</p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
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
    </div>
  );
};

export default ProductionKanban;
