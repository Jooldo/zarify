
import React from 'react';
import { Package, User, Calendar, Hash, Scale } from 'lucide-react';
import { format } from 'date-fns';
import { StepCardData } from '../ManufacturingStepCard';

interface StepProgressSectionProps {
  data: StepCardData;
  getWorkerName: (workerId: string | null) => string | null;
  stepProgressData: any;
  additionalFields: any[];
  remainingQuantities: any;
}

const StepProgressSection: React.FC<StepProgressSectionProps> = ({ 
  data, 
  getWorkerName, 
  stepProgressData, 
  additionalFields,
  remainingQuantities 
}) => {
  if (!data.orderStepData) return null;

  // Calculate rework quantities for this step - count ALL rework instances that originated from this step
  const getReworkQuantities = () => {
    if (!data.orderSteps || !data.orderStepData) return { quantity: 0, weight: 0 };
    
    // Find ALL rework instances that originated from this step instance
    // These are instances that have origin_step_id = current step's id
    const allReworkInstances = data.orderSteps.filter(step => 
      step.origin_step_id === data.orderStepData.id
    );
    
    const totalReworkQuantity = allReworkInstances.reduce((sum, step) => 
      sum + (step.quantity_assigned || 0), 0
    );
    
    const totalReworkWeight = allReworkInstances.reduce((sum, step) => 
      sum + (step.weight_assigned || 0), 0
    );
    
    return {
      quantity: totalReworkQuantity,
      weight: totalReworkWeight
    };
  };

  const reworkQuantities = getReworkQuantities();
  const hasRework = reworkQuantities.quantity > 0 || reworkQuantities.weight > 0;

  return (
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
                <div className="text-center bg-orange-50 px-2 py-1 rounded text-orange-700 text-sm font-semibold">
                  {hasRework ? reworkQuantities.quantity : '—'}
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
                <div className="text-center bg-orange-50 px-2 py-1 rounded text-orange-700 text-sm font-semibold">
                  {hasRework ? reworkQuantities.weight.toFixed(2) : '—'}
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t border-gray-200 text-xs font-medium text-gray-500">
            <div>Metric</div>
            <div className="text-center">Assigned</div>
            <div className="text-center">Received</div>
            <div className="text-center">Rework</div>
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

      {/* Available for Assignment to Next Step */}
      {remainingQuantities && (
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
    </div>
  );
};

export default StepProgressSection;
