
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
      // Pass the current instance number as the source instance
      data.onStartNextStep(data.orderId, nextStepName, data.instanceNumber);
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
  
  return (
    <div 
      className="relative cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
      style={{ width: '100%', height: '100%' }}
    >
      <Card className="w-full h-full shadow-md border-l-4 border-l-blue-500">
        <CardHeader className="pb-3 px-4 pt-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold truncate text-gray-900">{displayStepName}</CardTitle>
              {!isOrderCard && (
                <div className="text-sm text-gray-600 mt-1 font-medium">
                  Step {data.stepOrder}
                </div>
              )}
            </div>
            <Badge className={`text-xs px-3 py-1 flex-shrink-0 font-semibold ${getStatusColor(data.status)}`}>
              {data.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 pb-4 pt-0">
          {/* Order Information Section - More prominent */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-100">
            <div className="flex items-center gap-3 mb-3">
              <Package className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-base text-gray-900 truncate">{data.orderNumber}</div>
                <div className="text-sm text-gray-700 truncate font-medium">{data.productCode || data.productName}</div>
              </div>
              {isOrderCard && data.quantityRequired && (
                <div className="text-sm text-gray-600 flex-shrink-0 font-semibold bg-white px-2 py-1 rounded">
                  Qty: {data.quantityRequired}
                </div>
              )}
            </div>

            {/* Progress bar for non-order cards - More prominent */}
            {!isOrderCard && (
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${data.progress}%` }}
                />
              </div>
            )}
          </div>

          {/* Step Details Section - Enhanced for configured fields */}
          {!isOrderCard && data.orderStepData && (
            <div className="space-y-3">
              {/* Worker and Due Date Row - More prominent */}
              <div className="grid grid-cols-2 gap-4">
                {data.orderStepData.assigned_worker && (
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <User className="h-4 w-4 text-gray-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {getWorkerName(data.orderStepData.assigned_worker) || 'Unknown'}
                    </span>
                  </div>
                )}

                {data.orderStepData.due_date && (
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <Calendar className="h-4 w-4 text-gray-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-800">
                      {format(new Date(data.orderStepData.due_date), 'MMM dd')}
                    </span>
                  </div>
                )}
              </div>

              {/* Enhanced Metrics Row - Larger and more prominent */}
              <div className="grid grid-cols-3 gap-2">
                {data.orderStepData.quantity_assigned > 0 && (
                  <div className="bg-blue-50 px-3 py-2 rounded-lg text-center border border-blue-200">
                    <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Qty</div>
                    <div className="text-sm font-bold text-blue-800">{data.orderStepData.quantity_assigned}</div>
                  </div>
                )}
                
                {data.orderStepData.weight_assigned > 0 && (
                  <div className="bg-purple-50 px-3 py-2 rounded-lg text-center border border-purple-200">
                    <div className="text-xs text-purple-600 font-medium uppercase tracking-wide">Weight</div>
                    <div className="text-sm font-bold text-purple-800">{data.orderStepData.weight_assigned}g</div>
                  </div>
                )}
                
                {data.orderStepData.purity > 0 && (
                  <div className="bg-amber-50 px-3 py-2 rounded-lg text-center border border-amber-200">
                    <div className="text-xs text-amber-600 font-medium uppercase tracking-wide">Purity</div>
                    <div className="text-sm font-bold text-amber-800">{data.orderStepData.purity}%</div>
                  </div>
                )}
              </div>

              {/* Additional metrics if available */}
              {(data.orderStepData.wastage > 0 || data.orderStepData.quantity_received > 0 || data.orderStepData.weight_received > 0) && (
                <div className="grid grid-cols-3 gap-2">
                  {data.orderStepData.quantity_received > 0 && (
                    <div className="bg-green-50 px-3 py-2 rounded-lg text-center border border-green-200">
                      <div className="text-xs text-green-600 font-medium uppercase tracking-wide">Received</div>
                      <div className="text-sm font-bold text-green-800">{data.orderStepData.quantity_received}</div>
                    </div>
                  )}
                  
                  {data.orderStepData.weight_received > 0 && (
                    <div className="bg-green-50 px-3 py-2 rounded-lg text-center border border-green-200">
                      <div className="text-xs text-green-600 font-medium uppercase tracking-wide">Wt Rcvd</div>
                      <div className="text-sm font-bold text-green-800">{data.orderStepData.weight_received}g</div>
                    </div>
                  )}
                  
                  {data.orderStepData.wastage > 0 && (
                    <div className="bg-red-50 px-3 py-2 rounded-lg text-center border border-red-200">
                      <div className="text-xs text-red-600 font-medium uppercase tracking-wide">Wastage</div>
                      <div className="text-sm font-bold text-red-800">{data.orderStepData.wastage}g</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Start Next Step Button */}
          {nextStepName && data.onStartNextStep && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleStartNextStep}
                className="w-full flex items-center justify-center gap-2 h-9 text-sm font-semibold hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
              >
                <Play className="h-4 w-4" />
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
