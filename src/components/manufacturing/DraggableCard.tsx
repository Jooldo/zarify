
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Package, Eye, Calendar, Weight, Hash, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { ProductionTask } from '@/hooks/useProductionTasks';
import { useProductionStepHistory } from '@/hooks/useProductionStepHistory';

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

const formatTimeElapsed = (startedAt: string) => {
  const now = new Date();
  const started = new Date(startedAt);
  const elapsed = Math.floor((now.getTime() - started.getTime()) / 60000);
  if (elapsed < 60) return `${elapsed}m`;
  return `${Math.floor(elapsed / 60)}h ${elapsed % 60}m`;
};

const DraggableCard = ({ task, stepId, onTaskClick }: DraggableCardProps) => {
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const { stepHistory } = useProductionStepHistory(task.id);
  
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

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTaskClick(task);
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTimelineExpanded(!isTimelineExpanded);
  };

  // Define card border style based on whether it's a child task
  const cardBorderClass = task.is_child_task 
    ? "cursor-grab hover:shadow-md transition-shadow border-l-4 border-l-orange-500 border border-orange-300 bg-orange-50 active:cursor-grabbing"
    : "cursor-grab hover:shadow-md transition-shadow border-l-4 border-l-blue-500 active:cursor-grabbing";

  const productCode = task.product_configs?.product_code || 'Unknown';
  const category = task.product_configs?.category || task.customer_name;
  const subcategory = task.product_configs?.subcategory || 'Production Request';
    
  const renderPendingCard = () => (
    <Card 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cardBorderClass}
    >
      <CardContent className="p-3 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="font-medium text-sm">{category}</p>
            <p className="text-xs text-muted-foreground">{subcategory}</p>
            {task.is_child_task && (
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 mt-1">
                Remaining Work
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={handleViewClick}
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Quantity:</span>
            <span className="text-sm font-medium">{task.quantity}</span>
          </div>
          
          {task.received_weight && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Weight:</span>
              <div className="flex items-center gap-1">
                <Weight className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs">{task.received_weight} kg</span>
              </div>
            </div>
          )}
          
          {task.parent_task_id && (
            <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
              <Hash className="h-3 w-3" />
              <span>From partial completion</span>
            </div>
          )}
          
          {task.created_at && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Created:</span>
              <span className="text-xs">{new Date(task.created_at).toLocaleDateString()}</span>
            </div>
          )}
          
          {task.expected_date && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Expected:</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs">{new Date(task.expected_date).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderProcessingStepCard = () => (
    <Card 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cardBorderClass}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="font-medium text-sm">{category}</p>
            <p className="text-xs text-muted-foreground">{subcategory}</p>
            {task.is_child_task && (
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 mt-1">
                Remaining Work
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={handleViewClick}
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs font-medium">{productCode}</p>
          
          {/* Current Step Quantity/Weight */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Qty:</span>
              <span className="font-medium ml-1">
                {task.received_quantity || task.quantity} pcs
              </span>
            </div>
            {task.received_weight && (
              <div>
                <span className="text-muted-foreground">Weight:</span>
                <span className="font-medium ml-1">{task.received_weight} kg</span>
              </div>
            )}
          </div>
        </div>
        
        {task.assigned_worker_name && (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">
              {task.assigned_worker_name}
            </span>
          </div>
        )}
        
        {task.expected_date && (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Due: {new Date(task.expected_date).toLocaleDateString()}
            </span>
          </div>
        )}
        
        {task.status && (
          <Badge variant="outline" className={`text-xs ${
            task.status === 'Received' ? 'bg-green-50 text-green-700' :
            task.status === 'QC' ? 'bg-orange-50 text-orange-700' :
            task.status === 'Partially Completed' ? 'bg-yellow-50 text-yellow-700' :
            task.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {task.status}
          </Badge>
        )}

        {/* Expandable Previous Steps Summary */}
        {stepHistory.length > 0 && (
          <Collapsible open={isTimelineExpanded} onOpenChange={setIsTimelineExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between p-1 h-6 text-xs"
                onClick={handleTimelineClick}
              >
                <span>Previous Steps ({stepHistory.length})</span>
                {isTimelineExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pt-1">
              <div className="space-y-1 text-xs bg-gray-50 rounded p-2">
                {stepHistory.map((step, index) => (
                  <div key={index} className="flex justify-between items-center py-1 border-b last:border-b-0">
                    <div>
                      <div className="font-medium">{step.step_name}</div>
                      {step.assigned_worker_name && (
                        <div className="text-muted-foreground text-xs">{step.assigned_worker_name}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div>{step.output_weight || '-'} kg</div>
                      <div className="text-muted-foreground">{step.output_quantity || '-'} pcs</div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );

  const renderRegularCard = () => (
    <Card 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cardBorderClass}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="font-medium text-sm">{category}</p>
            <p className="text-xs text-muted-foreground">{subcategory}</p>
            {task.is_child_task && (
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 mt-1">
                Remaining Work
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={handleViewClick}
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs font-medium">{productCode}</p>
          <p className="text-xs text-muted-foreground">Qty: {task.quantity}</p>
          {task.received_weight && (
            <p className="text-xs text-muted-foreground">Weight: {task.received_weight} kg</p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </Badge>
          {task.assigned_worker_name && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                {task.assigned_worker_name.split(' ')[0]}
              </span>
            </div>
          )}
        </div>
        
        {task.started_at && (
          <div className="flex items-center gap-1 mt-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {formatTimeElapsed(task.started_at)}
            </span>
          </div>
        )}
        
        <div className="border-t pt-2">
          {task.expected_date && (
            <p className="text-xs text-muted-foreground">
              Due: {new Date(task.expected_date).toLocaleDateString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (stepId === 'pending') {
    return renderPendingCard();
  } else if (stepId === 'jhalai' || stepId === 'quellai' || stepId === 'meena' || stepId === 'vibrator') {
    return renderProcessingStepCard();
  } else {
    return renderRegularCard();
  }
};

export default DraggableCard;
