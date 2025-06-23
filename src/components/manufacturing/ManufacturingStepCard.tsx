import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, User, Package, Calendar, Play, Factory, Cog } from 'lucide-react';
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
  cardType?: 'order' | 'step';
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

  // Get the next step name based on current step
  const getNextStepName = (currentStepName: string) => {
    const stepSequence = ['Jhalai', 'Dhol', 'Casting'];
    const currentIndex = stepSequence.indexOf(currentStepName);
    
    if (currentIndex >= 0 && currentIndex < stepSequence.length - 1) {
      return stepSequence[currentIndex + 1];
    }
    
    return null;
  };

  // Get field values in consistent order with corrected weight display (no conversion)
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
            colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            break;
          case 'weight_assigned':
            label = 'Weight Assigned';
            unit = 'kg'; // Keep as kg, no conversion
            displayValue = value.toFixed(2);
            colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
            break;
          case 'weight_received':
            label = 'Weight Received';
            unit = 'kg'; // Keep as kg, no conversion
            displayValue = value.toFixed(2);
            colorClass = 'bg-teal-50 text-teal-700 border-teal-200';
            break;
          case 'purity':
            label = 'Purity';
            unit = '%';
            colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
            break;
          case 'wastage':
            label = 'Wastage';
            unit = 'kg'; // Keep as kg, no conversion
            displayValue = value.toFixed(2);
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

  // Get card styling based on type and status
  const getCardStyling = () => {
    if (isOrderCard) {
      return {
        borderClass: 'border-l-4 border-l-indigo-500 shadow-lg',
        bgClass: 'bg-gradient-to-br from-indigo-50 to-blue-50',
        headerClass: 'bg-indigo-100/50'
      };
    }

    // Step card styling based on step name
    const stepStyles = {
      'Jhalai': {
        borderClass: 'border-l-4 border-l-orange-500 shadow-md',
        bgClass: 'bg-gradient-to-br from-orange-50 to-amber-50',
        headerClass: 'bg-orange-100/50'
      },
      'Dhol': {
        borderClass: 'border-l-4 border-l-purple-500 shadow-md',
        bgClass: 'bg-gradient-to-br from-purple-50 to-pink-50',
        headerClass: 'bg-purple-100/50'
      },
      'Casting': {
        borderClass: 'border-l-4 border-l-green-500 shadow-md',
        bgClass: 'bg-gradient-to-br from-green-50 to-emerald-50',
        headerClass: 'bg-green-100/50'
      }
    };

    return stepStyles[data.stepName as keyof typeof stepStyles] || {
      borderClass: 'border-l-4 border-l-gray-500 shadow-md',
      bgClass: 'bg-gradient-to-br from-gray-50 to-slate-50',
      headerClass: 'bg-gray-100/50'
    };
  };

  const cardStyling = getCardStyling();
  
  console.log('Button visibility check:', {
    isOrderCard,
    nextStepName,
    hasCallback: !!data.onStartNextStep,
    shouldShowButton: !!nextStepName && !!data.onStartNextStep
  });
  
  return (
    <div 
      className="relative cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
      onClick={handleClick}
      style={{ width: '380px', height: 'auto', minHeight: '200px' }}
    >
      <Card className={`w-full h-full ${cardStyling.borderClass} ${cardStyling.bgClass} backdrop-blur-sm`}>
        <CardHeader className={`pb-3 px-4 pt-3 ${cardStyling.headerClass} rounded-t-lg`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-bold truncate text-gray-900 flex items-center gap-2">
                {isOrderCard ? <Factory className="h-4 w-4 text-indigo-600" /> : <Cog className="h-4 w-4 text-gray-600" />}
                {displayStepName}
              </CardTitle>
              {!isOrderCard && (
                <div className="text-xs text-gray-600 mt-1 font-medium">
                  Step {data.stepOrder} • Instance {data.instanceNumber || 1}
                </div>
              )}
            </div>
            <Badge className={`text-xs px-3 py-1 flex-shrink-0 font-medium border ${getStatusColor(data.status)}`}>
              {data.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 pb-3 pt-2 space-y-3">
          {/* Order Information Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-gray-200/50">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-gray-900 truncate">{data.orderNumber}</div>
                <div className="text-xs text-gray-600 truncate">{data.productCode || data.productName}</div>
              </div>
              {isOrderCard && data.quantityRequired && (
                <div className="text-sm font-semibold text-gray-700 flex-shrink-0 bg-blue-50 px-2 py-1 rounded">
                  Qty: {data.quantityRequired}
                </div>
              )}
            </div>

            {/* Progress bar for non-order cards */}
            {!isOrderCard && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${data.progress}%` }}
                />
              </div>
            )}
          </div>

          {/* Step Details Section - Only for non-order cards */}
          {!isOrderCard && data.orderStepData && (
            <div className="space-y-3">
              {/* Worker and Due Date Row */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {data.orderStepData.assigned_worker && (
                  <div className="flex items-center gap-2 bg-white/50 rounded-md p-2">
                    <User className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700 truncate font-medium">
                      {getWorkerName(data.orderStepData.assigned_worker) || 'Unknown'}
                    </span>
                  </div>
                )}

                {data.orderStepData.due_date && (
                  <div className="flex items-center gap-2 bg-white/50 rounded-md p-2">
                    <Calendar className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">
                      {format(new Date(data.orderStepData.due_date), 'MMM dd')}
                    </span>
                  </div>
                )}
              </div>

              {/* Enhanced Field Values Display */}
              {orderedFieldValues.length > 0 && (
                <div className="bg-gray-900/5 backdrop-blur-sm rounded-lg p-3 border border-gray-200/30">
                  <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    Configuration Values
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {orderedFieldValues.map((field, index) => (
                      <div 
                        key={`${field.label}-${index}`}
                        className={`px-3 py-2 rounded-md border ${field.colorClass}`}
                      >
                        <div className="text-xs font-medium text-gray-600 mb-1">{field.label}</div>
                        <div className="text-base font-bold">
                          {field.value}
                          {field.unit && <span className="text-xs font-normal ml-1">{field.unit}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Start Next Step Button */}
          {nextStepName && data.onStartNextStep && (
            <div className="pt-2 border-t border-gray-200/50">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleStartNextStep}
                className="w-full h-8 text-xs font-semibold hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 shadow-sm"
              >
                <Play className="h-3 w-3 mr-2" />
                Start {nextStepName}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* React Flow Handles with improved styling */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-4 h-4 bg-white border-2 border-gray-400 shadow-md hover:border-blue-500 transition-colors" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-4 h-4 bg-white border-2 border-gray-400 shadow-md hover:border-blue-500 transition-colors"
      />
    </div>
  );
});

ManufacturingStepCard.displayName = 'ManufacturingStepCard';

export default ManufacturingStepCard;
