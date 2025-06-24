import React, { memo, useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Factory, Cog } from 'lucide-react';
import { useWorkers } from '@/hooks/useWorkers';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { calculateRemainingWeight, calculateRemainingQuantity } from '@/utils/weightCalculations';
import OrderSummarySection from './card-components/OrderSummarySection';
import StepSummaryTable from './card-components/StepSummaryTable';
import StepProgressSection from './card-components/StepProgressSection';
import ActionButtonsSection from './card-components/ActionButtonsSection';

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
  reworkAssigned: number;
  reworkReceived: number;
  reworkRequested: number;
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
    isRework: data.orderStepData?.is_rework,
    orderStepData: data.orderStepData
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

  // Check if this should show rework tag based on step order comparison
  const shouldShowReworkTag = useMemo(() => {
    if (!data.orderStepData?.origin_step_id || !Array.isArray(orderSteps) || !Array.isArray(manufacturingSteps)) {
      return false;
    }

    // Get current step order
    const currentStepConfig = manufacturingSteps.find(step => step.step_name === data.stepName);
    if (!currentStepConfig) return false;

    // Get origin step details
    const originStep = orderSteps.find(step => step.id === data.orderStepData.origin_step_id);
    if (!originStep) return false;

    // Get origin step order
    const originStepConfig = manufacturingSteps.find(step => step.step_name === originStep.step_name);
    if (!originStepConfig) return false;

    // Show rework tag if current step order <= origin step order
    return currentStepConfig.step_order <= originStepConfig.step_order;
  }, [data.orderStepData, data.stepName, orderSteps, manufacturingSteps]);
  
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

      // Separate regular and rework instances
      const regularInstances = stepInstances.filter(instance => !instance.is_rework);
      const reworkInstances = stepInstances.filter(instance => instance.is_rework);

      // Calculate metrics for regular instances (exclude rework)
      const totalActiveInstances = regularInstances.filter(instance => 
        instance.status === 'in_progress' || instance.status === 'pending'
      ).length;

      const weightAssigned = regularInstances.reduce((sum, instance) => 
        sum + (instance.weight_assigned || 0), 0
      );

      const weightReceived = regularInstances.reduce((sum, instance) => 
        sum + (instance.weight_received || 0), 0
      );

      // Calculate rework metrics (only rework instances)
      const reworkAssigned = reworkInstances.reduce((sum, instance) => 
        sum + (instance.weight_assigned || 0), 0
      );

      const reworkReceived = reworkInstances.reduce((sum, instance) => 
        sum + (instance.weight_received || 0), 0
      );

      // Calculate rework requested (quantity/weight requested for rework from origin instances)
      // This would be the sum of rework instances that originated from this step
      const reworkRequested = thisOrderSteps.filter(orderStep => 
        orderStep.origin_step_id && 
        stepInstances.some(stepInstance => stepInstance.id === orderStep.origin_step_id) &&
        orderStep.is_rework
      ).reduce((sum, instance) => sum + (instance.weight_assigned || 0), 0);

      return {
        stepName: step.step_name,
        stepOrder: step.step_order,
        totalActiveInstances,
        weightAssigned,
        weightReceived,
        reworkAssigned,
        reworkReceived,
        reworkRequested,
        completionPercentage: 0 // Not used anymore but kept for interface compatibility
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
      style={{ width: '420px', height: 'auto', minHeight: '200px' }}
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
            <div className="flex gap-2 flex-shrink-0">
              {shouldShowReworkTag && (
                <Badge className="text-xs px-2 py-1 bg-orange-100 text-orange-800 border border-orange-300 font-medium">
                  Rework
                </Badge>
              )}
              <Badge className={`text-xs px-3 py-1 flex-shrink-0 font-medium border ${getStatusColor(data.status)}`}>
                {data.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 pb-3 pt-2 space-y-3">
          {/* Order Information Section */}
          <OrderSummarySection data={data} isOrderCard={isOrderCard} />

          {/* Step Summary Table for Order Cards */}
          <StepSummaryTable stepSummaries={stepSummaries} />

          {/* Step Details Section - Only for non-order cards */}
          {!isOrderCard && (
            <StepProgressSection 
              data={{...data, orderSteps}}
              getWorkerName={getWorkerName}
              stepProgressData={stepProgressData}
              additionalFields={additionalFields}
              remainingQuantities={remainingQuantities}
            />
          )}

          {/* Start Next Step Button */}
          <ActionButtonsSection 
            data={data}
            nextStepName={nextStepName}
            onStartNextStep={handleStartNextStep}
          />
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
