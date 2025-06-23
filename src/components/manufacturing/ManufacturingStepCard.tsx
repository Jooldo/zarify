
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, User, Package, Calendar, Play, Factory, Hammer, Zap } from 'lucide-react';
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
  visualStyle?: {
    borderColor: string;
    bgColor: string;
    headerBg: string;
    iconColor: string;
    accentColor: string;
  };
  isPartOfGroup?: boolean;
  groupIndex?: number;
  isOrderCard?: boolean;
  [key: string]: any;
}

const ManufacturingStepCard: React.FC<{ data: StepCardData }> = memo(({ data }) => {
  const { workers } = useWorkers();
  
  console.log('ManufacturingStepCard render:', {
    stepName: data.stepName,
    orderId: data.orderId,
    instanceNumber: data.instanceNumber,
    hasOnStartNextStep: !!data.onStartNextStep,
    visualStyle: data.visualStyle
  });
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-300';
      case 'skipped': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getWorkerName = (workerId: string | null) => {
    if (!workerId) return null;
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : null;
  };

  // Get step icon based on step name
  const getStepIcon = (stepName: string) => {
    switch (stepName) {
      case 'Manufacturing Order':
        return Factory;
      case 'Jhalai':
        return Zap;
      case 'Dhol':
        return Hammer;
      case 'Casting':
        return Package;
      default:
        return Package;
    }
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
  
  console.log('Button visibility check:', {
    isOrderCard,
    nextStepName,
    hasCallback: !!data.onStartNextStep,
    shouldShowButton: !!nextStepName && !!data.onStartNextStep
  });

  // Use visual styling or fallback to defaults
  const visualStyle = data.visualStyle || {
    borderColor: 'border-gray-500',
    bgColor: 'bg-gray-50',
    headerBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    accentColor: '#6b7280'
  };

  // Get the icon component
  const StepIcon = getStepIcon(data.stepName);

  // Add group visual indicator for instances that are part of a group
  const groupIndicator = data.isPartOfGroup && !isOrderCard && data.instanceNumber && data.instanceNumber > 1 
    ? `opacity-90 ${data.groupIndex !== undefined ? `ml-${Math.min(data.groupIndex * 2, 8)}` : ''}` 
    : '';
  
  return (
    <div 
      className={`relative cursor-pointer hover:shadow-lg transition-all duration-200 ${groupIndicator}`}
      onClick={handleClick}
      style={{ width: '100%', height: '100%' }}
    >
      <Card className={`w-full h-full shadow-md border-l-4 ${visualStyle.borderColor} ${visualStyle.bgColor} hover:shadow-xl transition-all duration-200`}>
        <CardHeader className={`pb-2 px-4 pt-3 ${visualStyle.headerBg} rounded-t-lg`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <StepIcon className={`h-5 w-5 ${visualStyle.iconColor} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base font-semibold truncate text-gray-900">{displayStepName}</CardTitle>
                {!isOrderCard && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    Step {data.stepOrder}
                    {data.isPartOfGroup && data.instanceNumber && data.instanceNumber > 1 && (
                      <span className="ml-2 px-1.5 py-0.5 bg-white bg-opacity-60 rounded text-xs font-medium">
                        Instance {data.instanceNumber}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <Badge className={`text-xs px-2 py-1 flex-shrink-0 border ${getStatusColor(data.status)}`}>
              {data.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 pb-3 pt-3">
          {/* Order Information Section */}
          <div className="bg-white bg-opacity-70 rounded-lg p-3 mb-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">{data.orderNumber}</div>
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
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${data.progress}%`,
                    backgroundColor: visualStyle.accentColor
                  }}
                />
              </div>
            )}
          </div>

          {/* Step Details Section - Only for non-order cards */}
          {!isOrderCard && data.orderStepData && (
            <div className="space-y-2">
              {/* Worker and Due Date Row */}
              <div className="grid grid-cols-2 gap-3">
                {data.orderStepData.assigned_worker && (
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    <span className="text-xs text-gray-700 truncate">
                      {getWorkerName(data.orderStepData.assigned_worker) || 'Unknown'}
                    </span>
                  </div>
                )}

                {data.orderStepData.due_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    <span className="text-xs text-gray-700">
                      {format(new Date(data.orderStepData.due_date), 'MMM dd')}
                    </span>
                  </div>
                )}
              </div>

              {/* Metrics Row with step-specific styling */}
              <div className="flex gap-2 flex-wrap">
                {data.orderStepData.quantity_assigned > 0 && (
                  <div className={`px-2 py-1 rounded text-xs border ${visualStyle.bgColor} border-current`}
                       style={{ color: visualStyle.accentColor }}>
                    <span className="font-medium">Qty:</span>
                    <span className="ml-1">{data.orderStepData.quantity_assigned}</span>
                  </div>
                )}
                
                {data.orderStepData.weight_assigned > 0 && (
                  <div className={`px-2 py-1 rounded text-xs border ${visualStyle.bgColor} border-current`}
                       style={{ color: visualStyle.accentColor }}>
                    <span className="font-medium">Wt:</span>
                    <span className="ml-1">{data.orderStepData.weight_assigned}g</span>
                  </div>
                )}
                
                {data.orderStepData.purity > 0 && (
                  <div className={`px-2 py-1 rounded text-xs border ${visualStyle.bgColor} border-current`}
                       style={{ color: visualStyle.accentColor }}>
                    <span className="font-medium">Purity:</span>
                    <span className="ml-1">{data.orderStepData.purity}%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Start Next Step Button */}
          {nextStepName && data.onStartNextStep && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleStartNextStep}
                className="w-full flex items-center justify-center gap-2 h-8 text-xs font-medium transition-all duration-200"
                style={{ 
                  borderColor: visualStyle.accentColor,
                  color: visualStyle.accentColor,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = visualStyle.accentColor;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = visualStyle.accentColor;
                }}
              >
                <Play className="h-3 w-3" />
                Start {nextStepName}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* React Flow Handles with step-specific styling */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 border-2 border-white" 
        style={{ backgroundColor: visualStyle.accentColor }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 border-2 border-white"
        style={{ backgroundColor: visualStyle.accentColor }}
      />
    </div>
  );
});

ManufacturingStepCard.displayName = 'ManufacturingStepCard';

export default ManufacturingStepCard;
