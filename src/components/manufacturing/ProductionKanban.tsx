
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Package, Eye, MoreHorizontal } from 'lucide-react';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import AddProductionItemDialog from './AddProductionItemDialog';

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
const mockTasks: { [key: string]: ProductionTask[] } = {
  pending: [
    {
      id: '1',
      productCode: 'RCC-12-SM',
      category: 'RCC Pipe',
      subcategory: 'Standard',
      quantity: 50,
      orderNumber: 'OD000123',
      customerName: 'ABC Construction',
      priority: 'High'
    },
    {
      id: '2', 
      productCode: 'RCC-18-HD',
      category: 'RCC Pipe',
      subcategory: 'Heavy Duty',
      quantity: 25,
      orderNumber: 'OD000124',
      customerName: 'XYZ Builders',
      priority: 'Medium'
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
      estimatedTime: 120
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

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Urgent': return 'bg-red-100 text-red-800';
    case 'High': return 'bg-orange-100 text-orange-800';
    case 'Medium': return 'bg-yellow-100 text-yellow-800';
    case 'Low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatTimeElapsed = (startedAt: Date) => {
  const now = new Date();
  const elapsed = Math.floor((now.getTime() - startedAt.getTime()) / 60000);
  if (elapsed < 60) return `${elapsed}m`;
  return `${Math.floor(elapsed / 60)}h ${elapsed % 60}m`;
};

const ProductionKanban = () => {
  const [selectedTask, setSelectedTask] = useState<ProductionTask | null>(null);
  const [tasks, setTasks] = useState(mockTasks);
  
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
      category: 'RCC Pipe', // Default category - could be fetched from product config
      subcategory: 'Standard', // Default subcategory - could be fetched from product config
      quantity: newItem.quantity,
      orderNumber: `OD${String(Date.now()).slice(-6)}`,
      customerName: 'Production Request',
      priority: 'Medium',
      expectedDate: newItem.expectedDate,
    };

    setTasks(prev => ({
      ...prev,
      pending: [...(prev.pending || []), newTask]
    }));
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

      <div className="grid grid-cols-7 gap-4 min-h-[600px]">
        {PROCESS_STEPS.map(step => (
          <div key={step.id} className="space-y-3">
            <div className={`p-3 rounded-lg ${step.color}`}>
              <h3 className="font-semibold text-sm">{step.name}</h3>
              <p className="text-xs text-muted-foreground">
                {tasks[step.id]?.length || 0} tasks
              </p>
            </div>
            
            <div className="space-y-2 min-h-[500px]">
              {tasks[step.id]?.map(task => (
                <Card 
                  key={task.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                  onClick={() => handleTaskClick(task)}
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{task.category}</p>
                        <p className="text-xs text-muted-foreground">{task.subcategory}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs font-medium">{task.productCode}</p>
                      <p className="text-xs text-muted-foreground">Qty: {task.quantity}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </Badge>
                      {task.assignedWorker && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                            {task.assignedWorker.split(' ')[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {task.startedAt && (
                      <div className="flex items-center gap-1 mt-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatTimeElapsed(task.startedAt)}
                        </span>
                      </div>
                    )}
                    
                    <div className="border-t pt-2">
                      <p className="text-xs text-muted-foreground">{task.orderNumber}</p>
                      <p className="text-xs text-muted-foreground truncate">{task.customerName}</p>
                      {task.expectedDate && (
                        <p className="text-xs text-muted-foreground">
                          Due: {task.expectedDate.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Empty state */}
              {(!tasks[step.id] || tasks[step.id].length === 0) && (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                  <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No tasks</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductionKanban;
