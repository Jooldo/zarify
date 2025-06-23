
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, User, Package, Calendar, Play } from 'lucide-react';
import { format } from 'date-fns';
import { useWorkers } from '@/hooks/useWorkers';

export interface StepCardData {
  stepName: string;
  stepOrder: number;
  orderId: string;
  orderNumber: string;
  productName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped';
  progress: number;
  assignedWorker?: string;
  productCode?: string;
  quantityRequired?: number;
  priority?: string;
  dueDate?: string;
  isJhalaiStep: boolean;
  manufacturingSteps?: any[];
  orderSteps?: any[];
  onAddStep?: (stepData: StepCardData) => void;
  onStepClick?: (stepData: StepCardData) => void;
  onOrderClick?: (orderId: string) => void;
  onStartNextStep?: (orderId: string, stepName?: string) => void;
  orderStepData?: any;
  rawMaterials?: any[];
  instanceNumber?: number;
  [key: string]: any;
}

const ManufacturingStepCard: React.FC<{ data: StepCardData }> = memo(({ data }) => {
  const { workers } = useWorkers();
  
  console.log('ManufacturingStepCard render:', {
    stepName: data.stepName,
    orderId: data.orderId,
    instanceNumber: data.instanceNumber,
    hasOnStartNextStep: !!data.onStartNextStep
  });
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'skipped': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkerName = (workerId: string | null) => {
    if (!workerId) return null;
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : null;
  };

  // Get the next step name based on current step
  const getNextStepName = (currentStepName: string) => {
    const stepSequence = ['Jhalai', 'Dhol', 'Casting'];
    const currentIndex = stepSequence.indexOf(currentStepName);
    
    if (currentIndex >= 0 && currentIndex < stepSequence.length - 1) {
      return stepSequence[currentIndex + 1];
    }
    
    return null;
  };

  const handleClick = () => {
    console.log('Card clicked:', data);
    const isOrderCard = data.stepName === 'Manufacturing Order';
    
    if (isOrderCard && data.onOrderClick) {
      data.onOrderClick(data.orderId);
    } else if (!isOrderCard && data.onStepClick) {
      data.onStepClick(data);
    }
  };

  const handleStartNextStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Start next step clicked for order:', data.orderId);
    
    if (data.onStartNextStep) {
      const isOrderCard = data.stepName === 'Manufacturing Order';
      const nextStepName = isOrderCard ? 'Jhalai' : getNextStepName(data.stepName);
      
      console.log('Starting step:', nextStepName, 'for order:', data.orderId);
      data.onStartNextStep(data.orderId, nextStepName);
    }
  };

  const isOrderCard = data.stepName === 'Manufacturing Order';
  const nextStepName = isOrderCard ? 'Jhalai' : getNextStepName(data.stepName);
  
  // Format step name with instance number for display
  const displayStepName = isOrderCard 
    ? data.stepName 
    : data.instanceNumber && data.instanceNumber > 1 
      ? `${data.stepName} #${data.instanceNumber}`
      : data.stepName;
  
  console.log('Button visibility check:', {
    isOrderCard,
    nextStepName,
    hasCallback: !!data.onStartNextStep,
    shouldShowButton: !!nextStepName && !!data.onStartNextStep
  });
  
  return (
    <div 
      className="relative cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
      style={{ width: '100%', height: '100%' }}
    >
      <Card className="w-full h-full shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium truncate">{displayStepName}</CardTitle>
            <Badge className={`text-xs ${getStatusColor(data.status)}`}>
              {data.status.replace('_', ' ')}
            </Badge>
          </div>
          {!isOrderCard && (
            <div className="text-xs text-muted-foreground">
              Step {data.stepOrder}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="pt-0 space-y-2">
          {/* Optimized layout for wider cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left column - Order Information */}
            <div className="space-y-2">
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium truncate">{data.orderNumber}</span>
                </div>
                <div className="text-muted-foreground font-semibold truncate">{data.productCode || data.productName}</div>
                {isOrderCard && data.quantityRequired && (
                  <div className="text-muted-foreground">Qty: {data.quantityRequired}</div>
                )}
              </div>

              {/* Progress bar for non-order cards */}
              {!isOrderCard && (
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${data.progress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Right column - Step-specific information */}
            {!isOrderCard && data.orderStepData && (
              <div className="space-y-2 text-xs">
                {/* Assigned Worker */}
                {data.orderStepData.assigned_worker && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{getWorkerName(data.orderStepData.assigned_worker) || 'Unknown Worker'}</span>
                  </div>
                )}

                {/* Due Date */}
                {data.orderStepData.due_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{format(new Date(data.orderStepData.due_date), 'MMM dd')}</span>
                  </div>
                )}

                {/* Field Values - Horizontal layout for wider cards */}
                <div className="flex gap-2 flex-wrap">
                  {data.orderStepData.quantity_assigned > 0 && (
                    <div className="bg-blue-50 px-2 py-1 rounded text-xs">
                      <span className="text-muted-foreground">Qty:</span>
                      <span className="font-medium ml-1">{data.orderStepData.quantity_assigned}</span>
                    </div>
                  )}
                  
                  {data.orderStepData.weight_assigned > 0 && (
                    <div className="bg-purple-50 px-2 py-1 rounded text-xs">
                      <span className="text-muted-foreground">Wt:</span>
                      <span className="font-medium ml-1">{data.orderStepData.weight_assigned}g</span>
                    </div>
                  )}
                  
                  {data.orderStepData.purity > 0 && (
                    <div className="bg-gray-50 px-2 py-1 rounded text-xs">
                      <span className="text-muted-foreground">Purity:</span>
                      <span className="font-medium ml-1">{data.orderStepData.purity}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Start Next Step button - full width for better visibility */}
          {nextStepName && data.onStartNextStep && (
            <div className="pt-2 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleStartNextStep}
                className="w-full flex items-center justify-center gap-1 h-8 text-xs"
              >
                <Play className="h-3 w-3" />
                Start {nextStepName}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* React Flow Handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-gray-400 border-2 border-white" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
    </div>
  );
});

ManufacturingStepCard.displayName = 'ManufacturingStepCard';

export default ManufacturingStepCard;
