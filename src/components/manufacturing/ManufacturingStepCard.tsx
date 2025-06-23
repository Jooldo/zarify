import React, { memo, useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, User, Package, Calendar, Play, Factory, Cog, Hash, Scale } from 'lucide-react';
import { format } from 'date-fns';
import { useWorkers } from '@/hooks/useWorkers';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { calculateRemainingWeight, calculateRemainingQuantity } from '@/utils/weightCalculations';

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

interface StepSummary {
  stepName: string;
  stepOrder: number;
  totalActiveInstances: number;
  weightAssigned: number;
  weightReceived: number;
  completionPercentage: number;
}

const ManufacturingStepCard: React.FC<{ data: StepCardData }> = memo(({ data }) => {
  const { workers } = useWorkers();
  const { manufacturingSteps, orderSteps } = useManufacturingSteps();
  
  console.log('ManufacturingStepCard render:', {
    stepName: data.stepName,
    orderId: data.orderId,
    instanceNumber: data.instanceNumber,
    hasOnStartNextStep: !!data.onStartNextStep,
    isRework: data.orderStepData?.is_rework // Log rework status
  });

  // Calculate remaining quantities for parent steps
  const remainingQuantities = useMemo(() => {
    if (!data.orderStepData || !Array.isArray(orderSteps)) {
      return null;
    }

    const currentStep = data.orderStepData;
    const currentStepName = data.stepName;
    const instanceNumber = data.instanceNumber || 1;

    // Find child steps that use this step as parent
    const childSteps = orderSteps.filter(orderStep => 
      orderStep.parent_instance_id === currentStep.id
    );

    // If no child steps, don't show remaining quantities
    if (childSteps.length === 0) {
      return null;
    }

    const remainingWeight = calculateRemainingWeight(
      currentStep,
      childSteps,
      currentStepName,
      instanceNumber
    );

    const remainingQuantity = calculateRemainingQuantity(
      currentStep,
      childSteps,
      currentStepName,
      instanceNumber
    );

    return {
      weight: remainingWeight,
      quantity: remainingQuantity,
    };
  }, [data.orderStepData, data.stepName, data.instanceNumber, orderSteps]);
  
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

  // Calculate step summaries for order cards
  const getStepSummaries = (): StepSummary[] => {
    if (!data.orderId || !Array.isArray(orderSteps) || !Array.isArray(manufacturingSteps)) {
      return [];
    }

    // Get order steps for this specific order
    const thisOrderSteps = orderSteps.filter(step => step.order_id === data.orderId);

    // Get active manufacturing steps in order
    const activeSteps = manufacturingSteps
      .filter(step => step.is_active)
      .sort((a, b) => a.step_order - b.step_order);

    return activeSteps.map(step => {
      // Find all instances of this step for this order
      const stepInstances = thisOrderSteps.filter(orderStep => 
        orderStep.step_name === step.step_name
      );

      // Calculate metrics
      const totalActiveInstances = stepInstances.filter(instance => 
        instance.status === 'in_progress' || instance.status === 'pending'
      ).length;

      const weightAssigned = stepInstances.reduce((sum, instance) => 
        sum + (instance.weight_assigned || 0), 0
      );

      const weightReceived = stepInstances.reduce((sum, instance) => 
        sum + (instance.weight_received || 0), 0
      );

      // Calculate completion percentage
      let completionPercentage = 0;
      if (weightAssigned > 0) {
        completionPercentage = Math.round((weightReceived / weightAssigned) * 100 * 100) / 100;
      }

      return {
        stepName: step.step_name,
        stepOrder: step.step_order,
        totalActiveInstances,
        weightAssigned,
        weightReceived,
        completionPercentage
      };
    });
  };

  // Get step progress data for the clean table
  const getStepProgressData = () => {
    if (!data.orderStepData) return null;
    
    const quantityAssigned = data.orderStepData.quantity_assigned || 0;
    const quantityReceived = data.orderStepData.quantity_received || 0;
    const weightAssigned = data.orderStepData.weight_assigned || 0;
    const weightReceived = data.orderStepData.weight_received || 0;
    
    // Calculate completion percentages
    const quantityCompletion = quantityAssigned > 0 
      ? Math.round((quantityReceived / quantityAssigned) * 100 * 100) / 100
      : 0;
    
    const weightCompletion = weightAssigned > 0 
      ? Math.round((weightReceived / weightAssigned) * 100 * 100) / 100
      : 0;
    
    return {
      quantity: {
        assigned: quantityAssigned,
        received: quantityReceived,
        completion: quantityCompletion
      },
      weight: {
        assigned: weightAssigned,
        received: weightReceived,
        completion: weightCompletion
      }
    };
  };

  // Get additional field values (purity, wastage, etc.) that don't fit in the main table
  const getAdditionalFieldValues = () => {
    if (!data.orderStepData) return [];
    
    const additionalFields = [];
    
    // Add purity if it exists
    if (data.orderStepData.purity && data.orderStepData.purity > 0) {
      additionalFields.push({
        label: 'Purity',
        value: data.orderStepData.purity,
        unit: '%',
        colorClass: 'bg-amber-50 text-amber-700 border-amber-200'
      });
    }
    
    // Add wastage if it exists
    if (data.orderStepData.wastage && data.orderStepData.wastage > 0) {
      additionalFields.push({
        label: 'Wastage',
        value: data.orderStepData.wastage.toFixed(2),
        unit: 'kg',
        colorClass: 'bg-red-50 text-red-700 border-red-200'
      });
    }
    
    return additionalFields;
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
  const stepSummaries = isOrderCard ? getStepSummaries() : [];
  const stepProgressData = getStepProgressData();
  const additionalFields = getAdditionalFieldValues();
  
  // Check if this is a rework instance
  const isRework = data.orderStepData?.is_rework || false;
  
  // Format step name with instance number and rework tag for display
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
      style={{ width: '420px', height: 'auto', minHeight: '200px' }}
    >
      <Card className={`w-full h-full ${cardStyling.borderClass} ${cardStyling.bgClass} backdrop-blur-sm`}>
        <CardHeader className={`pb-3 px-4 pt-3 ${cardStyling.headerClass} rounded-t-lg`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-bold truncate text-gray-900 flex items-center gap-2">
                {isOrderCard ? <Factory className="h-4 w-4 text-indigo-600" /> : <Cog className="h-4 w-4 text-gray-600" />}
                {displayStepName}
                {/* Rework Tag */}
                {isRework && (
                  <Badge className="text-xs px-2 py-1 bg-orange-100 text-orange-800 border-orange-300">
                    REWORK
                  </Badge>
                )}
              </CardTitle>
              {!isOrderCard && (
                <div className="text-xs text-gray-600 mt-1 font-medium">
                  Step {data.stepOrder} • Instance {data.instanceNumber || 1}
                  {isRework && (
                    <span className="text-orange-600 ml-2">• Rework Item</span>
                  )}
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

          {/* Step Summary Table for Order Cards */}
          {isOrderCard && stepSummaries.length > 0 && (
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-gray-200/50">
              <div className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide flex items-center gap-2">
                <Factory className="h-3 w-3" />
                Manufacturing Progress
              </div>
              <div className="space-y-2">
                {stepSummaries.map((summary) => (
                  <div key={summary.stepName} className="grid grid-cols-4 gap-2 text-xs">
                    <div className="font-medium text-gray-900 truncate">{summary.stepName}</div>
                    <div className="text-center bg-blue-50 px-2 py-1 rounded text-blue-700 text-sm font-semibold">
                      {summary.totalActiveInstances || 0}
                    </div>
                    <div className="text-right bg-purple-50 px-2 py-1 rounded text-purple-700 text-sm font-semibold">
                      {summary.weightAssigned > 0 ? `${summary.weightAssigned.toFixed(1)}kg` : '—'}
                    </div>
                    <div className="text-right bg-green-50 px-2 py-1 rounded text-green-700 font-bold text-sm">
                      {summary.completionPercentage > 0 ? `${summary.completionPercentage.toFixed(1)}%` : '—'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t border-gray-200 text-xs font-medium text-gray-500">
                <div>Step</div>
                <div className="text-center">Active</div>
                <div className="text-right">Assigned</div>
                <div className="text-right">Complete</div>
              </div>
            </div>
          )}

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

              {/* Step Progress Table */}
              {stepProgressData && (stepProgressData.quantity.assigned > 0 || stepProgressData.weight.assigned > 0) && (
                <div className="bg-gray-900/5 backdrop-blur-sm rounded-lg p-3 border border-gray-200/30">
                  <div className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide flex items-center gap-2">
                    <Package className="h-3 w-3" />
                    Step Progress
                  </div>
                  <div className="space-y-2">
                    {/* Quantity Row */}
                    {stepProgressData.quantity.assigned > 0 && (
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="font-medium text-gray-900 flex items-center gap-1">
                          <Hash className="h-3 w-3 text-blue-600" />
                          Quantity
                        </div>
                        <div className="text-center bg-blue-50 px-2 py-1 rounded text-blue-700 text-sm font-semibold">
                          {stepProgressData.quantity.assigned}
                        </div>
                        <div className="text-center bg-emerald-50 px-2 py-1 rounded text-emerald-700 text-sm font-semibold">
                          {stepProgressData.quantity.received}
                        </div>
                        <div className="text-center bg-green-50 px-2 py-1 rounded text-green-700 font-bold text-sm">
                          {stepProgressData.quantity.completion > 0 ? `${stepProgressData.quantity.completion.toFixed(1)}%` : '—'}
                        </div>
                      </div>
                    )}
                    
                    {/* Weight Row */}
                    {stepProgressData.weight.assigned > 0 && (
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="font-medium text-gray-900 flex items-center gap-1">
                          <Scale className="h-3 w-3 text-purple-600" />
                          Weight (Kg)
                        </div>
                        <div className="text-center bg-blue-50 px-2 py-1 rounded text-blue-700 text-sm font-semibold">
                          {stepProgressData.weight.assigned.toFixed(2)}
                        </div>
                        <div className="text-center bg-emerald-50 px-2 py-1 rounded text-emerald-700 text-sm font-semibold">
                          {stepProgressData.weight.received.toFixed(2)}
                        </div>
                        <div className="text-center bg-green-50 px-2 py-1 rounded text-green-700 font-bold text-sm">
                          {stepProgressData.weight.completion > 0 ? `${stepProgressData.weight.completion.toFixed(1)}%` : '—'}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t border-gray-200 text-xs font-medium text-gray-500">
                    <div>Metric</div>
                    <div className="text-center">Assigned</div>
                    <div className="text-center">Received</div>
                    <div className="text-center">% Complete</div>
                  </div>
                </div>
              )}

              {/* Additional Fields (Purity, Wastage) */}
              {additionalFields.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {additionalFields.map((field, index) => (
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
              )}
            </div>
          )}

          {/* Available for Assignment to Next Step - For Parent Steps - Now positioned above CTA */}
          {!isOrderCard && remainingQuantities && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3">
              <div className="text-xs font-semibold text-purple-900 mb-2 uppercase tracking-wide">
                Available for Assignment to Next Step
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-semibold text-blue-900">{remainingQuantities.quantity} pieces</div>
                    <div className="text-xs text-blue-600">Quantity Available</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="font-semibold text-purple-900">{remainingQuantities.weight.toFixed(2)} kg</div>
                    <div className="text-xs text-purple-600">Weight Available</div>
                  </div>
                </div>
              </div>
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
