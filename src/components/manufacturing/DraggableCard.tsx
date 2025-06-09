
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Package, Eye, Calendar } from 'lucide-react';

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

interface DraggableCardProps {
  task: ProductionTask;
  stepId: string;
  onTaskClick: (task: ProductionTask) => void;
}

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

const DraggableCard = ({ task, stepId, onTaskClick }: DraggableCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
      stepId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderPendingCard = () => (
    <Card 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab hover:shadow-md transition-shadow border-l-4 border-l-blue-500 active:cursor-grabbing"
      onClick={() => onTaskClick(task)}
    >
      <CardContent className="p-3 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="font-medium text-sm">{task.category}</p>
            <p className="text-xs text-muted-foreground">{task.subcategory}</p>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Eye className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Quantity:</span>
            <span className="text-sm font-medium">{task.quantity}</span>
          </div>
          
          {task.createdAt && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Created:</span>
              <span className="text-xs">{task.createdAt.toLocaleDateString()}</span>
            </div>
          )}
          
          {task.expectedDate && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Expected:</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs">{task.expectedDate.toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderJalhaiCard = () => (
    <Card 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab hover:shadow-md transition-shadow border-l-4 border-l-green-500 active:cursor-grabbing"
      onClick={() => onTaskClick(task)}
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
          <p className="text-xs text-muted-foreground">Qty: {task.quantity} pcs</p>
        </div>
        
        {task.assignedWorker && (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">
              {task.assignedWorker}
            </span>
          </div>
        )}
        
        {task.expectedDate && (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Due: {task.expectedDate.toLocaleDateString()}
            </span>
          </div>
        )}
        
        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
          In Progress
        </Badge>
      </CardContent>
    </Card>
  );

  const renderRegularCard = () => (
    <Card 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab hover:shadow-md transition-shadow border-l-4 border-l-blue-500 active:cursor-grabbing"
      onClick={() => onTaskClick(task)}
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
  );

  if (stepId === 'pending') {
    return renderPendingCard();
  } else if (stepId === 'jhalai') {
    return renderJalhaiCard();
  } else {
    return renderRegularCard();
  }
};

export default DraggableCard;
