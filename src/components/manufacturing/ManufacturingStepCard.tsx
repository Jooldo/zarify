
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
  flowColorScheme?: {
    primary: string;
    secondary: string;
    accent: string;
    border: string;
  };
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
    if (!data.flowColorScheme) {
      // Fallback to default colors if no color scheme is provided
      switch (status.toLowerCase()) {
        case 'pending': return 'bg-gray-100 text-gray-800';
        case 'in_progress': return 'bg-blue-100 text-blue-800';
        case 'completed': return 'bg-green-100 text-green-800';
        case 'blocked': return 'bg-red-100 text-red-800';
        case 'skipped': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }

    // Use flow color scheme
    const { primary, secondary } = data.flowColorScheme;
    switch (status.toLowerCase()) {
      case 'pending': 
        return `text-gray-600`;
      case 'in_progress': 
        return `text-white`;
      case 'completed': 
        return `text-white`;
      case 'blocked': 
        return `bg-red-100 text-red-800`;
      case 'skipped': 
        return `bg-yellow-100 text-yellow-800`;
      default: 
        return `text-gray-600`;
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    if (!data.flowColorScheme) return '';
    
    const { primary, secondary, accent } = data.flowColorScheme;
    switch (status.toLowerCase()) {
      case 'pending': 
        return secondary;
      case 'in_progress': 
        return primary;
      case 'completed': 
        return accent;
      case 'blocked': 
        return '#fee2e2';
      case 'skipped': 
        return '#fef3c7';
      default: 
        return secondary;
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
  
  console.log('Button visibility check:', {
    isOrderCard,
    nextStepName,
    hasCallback: !!data.onStartNextStep,
    shouldShowButton: !!nextStepName && !!data.onStartNextStep
  });

  // Get colors from flow color scheme
  const colors = data.flowColorScheme || {
    primary: '#3b82f6',
    secondary: '#dbeafe',
    accent: '#1d4ed8',
    border: '#2563eb'
  };
  
  return (
    <div 
      className="relative cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
      style={{ width: '100%', height: '100%' }}
    >
      <Card 
        className="w-full h-full shadow-md border-l-4"
        style={{ 
          borderLeftColor: colors.border,
          backgroundColor: isOrderCard ? colors.secondary : '#ffffff'
        }}
      >
        <CardHeader className="pb-2 px-4 pt-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle 
                className="text-base font-semibold truncate"
                style={{ color: isOrderCard ? colors.accent : colors.primary }}
              >
                {displayStepName}
              </CardTitle>
              {!isOrderCard && (
                <div className="text-xs mt-0.5" style={{ color: colors.primary }}>
                  Step {data.stepOrder}
                </div>
              )}
            </div>
            <Badge 
              className={`text-xs px-2 py-1 flex-shrink-0 ${getStatusColor(data.status)}`}
              style={{ 
                backgroundColor: getStatusBackgroundColor(data.status),
                borderColor: colors.border
              }}
            >
              {data.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 pb-3 pt-1">
          {/* Order Information Section */}
          <div 
            className="rounded-lg p-3 mb-3"
            style={{ 
              backgroundColor: isOrderCard ? '#ffffff' : colors.secondary,
              border: `1px solid ${colors.border}20`
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Package 
                className="h-4 w-4 flex-shrink-0" 
                style={{ color: colors.primary }}
              />
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
                    backgroundColor: colors.primary
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

              {/* Metrics Row */}
              <div className="flex gap-2 flex-wrap">
                {data.orderStepData.quantity_assigned > 0 && (
                  <div 
                    className="px-2 py-1 rounded text-xs border"
                    style={{ 
                      backgroundColor: `${colors.primary}10`,
                      borderColor: `${colors.primary}30`,
                      color: colors.accent
                    }}
                  >
                    <span className="font-medium">Qty:</span>
                    <span className="ml-1">{data.orderStepData.quantity_assigned}</span>
                  </div>
                )}
                
                {data.orderStepData.weight_assigned > 0 && (
                  <div 
                    className="px-2 py-1 rounded text-xs border"
                    style={{ 
                      backgroundColor: `${colors.primary}10`,
                      borderColor: `${colors.primary}30`,
                      color: colors.accent
                    }}
                  >
                    <span className="font-medium">Wt:</span>
                    <span className="ml-1">{data.orderStepData.weight_assigned}g</span>
                  </div>
                )}
                
                {data.orderStepData.purity > 0 && (
                  <div 
                    className="px-2 py-1 rounded text-xs border"
                    style={{ 
                      backgroundColor: `${colors.primary}10`,
                      borderColor: `${colors.primary}30`,
                      color: colors.accent
                    }}
                  >
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
                className="w-full flex items-center justify-center gap-2 h-8 text-xs font-medium"
                style={{
                  borderColor: colors.border,
                  color: colors.primary,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                  e.currentTarget.style.color = colors.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = colors.primary;
                }}
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
        className="w-3 h-3 border-2 border-white" 
        style={{ backgroundColor: colors.primary }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 border-2 border-white"
        style={{ backgroundColor: colors.primary }}
      />
    </div>
  );
});

ManufacturingStepCard.displayName = 'ManufacturingStepCard';

export default ManufacturingStepCard;
