
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
  onStartNextStep?: (orderId: string, stepName?: string, sourceInstanceNumber?: number) => void;
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

  // Get field values in consistent order
  const getOrderedFieldValues = () => {
    if (!data.orderStepData) return [];
    
    const fieldOrder = [
      'quantity_assigned',
      'quantity_received',
      'weight_assigned',
      'weight_received',
      'purity',
      'wastage'
    ];
    
    const fieldValues = [];
    
    for (const fieldKey of fieldOrder) {
      const value = data.orderStepData[fieldKey];
      if (value && value > 0) {
        let displayValue = value;
        let unit = '';
        let label = '';
        let colorClass = '';
        
        switch (fieldKey) {
          case 'quantity_assigned':
            label = 'Qty Assigned';
            colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
            break;
          case 'quantity_received':
            label = 'Qty Received';
            colorClass = 'bg-green-50 text-green-700 border-green-200';
            break;
          case 'weight_assigned':
            label = 'Weight Assigned';
            unit = 'g';
            colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
            break;
          case 'weight_received':
            label = 'Weight Received';
            unit = 'g';
            colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            break;
          case 'purity':
            label = 'Purity';
            unit = '%';
            colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
            break;
          case 'wastage':
            label = 'Wastage';
            unit = 'g';
            colorClass = 'bg-red-50 text-red-700 border-red-200';
            break;
        }
        
        fieldValues.push({
          label,
          value: displayValue,
          unit,
          colorClass
        });
      }
    }
    
    return fieldValues;
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
    console.log('Start next step clicked for order:', data.orderId, 'from instance:', data.instanceNumber);
    
    if (data.onStartNextStep) {
      const isOrderCard = data.stepName === 'Manufacturing Order';
      const nextStepName = isOrderCard ? 'Jhalai' : getNextStepName(data.stepName);
      
      console.log('Starting step:', nextStepName, 'for order:', data.orderId, 'from source instance:', data.instanceNumber);
      data.onStartNextStep(data.orderId, nextStepName, data.instanceNumber);
    }
  };

  const isOrderCard = data.stepName === 'Manufacturing Order';
  const nextStepName = isOrderCard ? 'Jhalai' : getNextStepName(data.stepName);
  const orderedFieldValues = getOrderedFieldValues();
  
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
      style={{ width: '350px', height: 'auto', minHeight: '180px' }}
    >
      <Card className="w-full h-full shadow-md border-l-4 border-l-blue-500">
        <CardHeader className="pb-2 px-3 pt-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-semibold truncate text-gray-900">{displayStepName}</CardTitle>
              {!isOrderCard && (
                <div className="text-xs text-gray-500 mt-0.5">
                  Step {data.stepOrder}
                </div>
              )}
            </div>
            <Badge className={`text-xs px-2 py-0.5 flex-shrink-0 ${getStatusColor(data.status)}`}>
              {data.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="px-3 pb-2 pt-0 space-y-2">
          {/* Order Information Section */}
          <div className="bg-gray-50 rounded-md p-2">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-3 w-3 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-xs text-gray-900 truncate">{data.orderNumber}</div>
                <div className="text-xs text-gray-600 truncate">{data.productCode || data.productName}</div>
              </div>
              {isOrderCard && data.quantityRequired && (
                <div className="text-xs text-gray-500 flex-shrink-0">
                  Qty: {data.quantityRequired}
                </div>
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

          {/* Step Details Section - Only for non-order cards */}
          {!isOrderCard && data.orderStepData && (
            <div className="space-y-2">
              {/* Worker and Due Date Row */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {data.orderStepData.assigned_worker && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700 truncate">
                      {getWorkerName(data.orderStepData.assigned_worker) || 'Unknown'}
                    </span>
                  </div>
                )}

                {data.orderStepData.due_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      {format(new Date(data.orderStepData.due_date), 'MMM dd')}
                    </span>
                  </div>
                )}
              </div>

              {/* Field Values in Consistent Order */}
              {orderedFieldValues.length > 0 && (
                <div className="grid grid-cols-2 gap-1">
                  {orderedFieldValues.map((field, index) => (
                    <div 
                      key={`${field.label}-${index}`}
                      className={`px-2 py-1 rounded text-xs border ${field.colorClass}`}
                    >
                      <span className="font-medium">{field.label}:</span>
                      <span className="ml-1">{field.value}{field.unit}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Start Next Step Button */}
          {nextStepName && data.onStartNextStep && (
            <div className="pt-2 border-t border-gray-200">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleStartNextStep}
                className="w-full h-7 text-xs font-medium hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
              >
                <Play className="h-3 w-3 mr-1" />
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
