
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Factory, Package, Weight, Users, TrendingUp } from 'lucide-react';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';

interface StepDistribution {
  stepId: string;
  stepName: string;
  stepOrder: number;
  totalQuantity: number | null;
  totalWeight: number | null;
  orderCount: number;
  status: 'in_progress';
  hasQuantityField: boolean;
  hasWeightField: boolean;
  quantityUnit: string | null;
  weightUnit: string | null;
}

interface FinishedGoodsManufacturingDistributionProps {
  manufacturingOrders: any[];
  loading: boolean;
}

const FinishedGoodsManufacturingDistribution = ({ 
  manufacturingOrders, 
  loading 
}: FinishedGoodsManufacturingDistributionProps) => {
  const { manufacturingSteps, orderSteps, stepFields, getStepFields } = useManufacturingSteps();
  const { getStepValue, getStepValues } = useManufacturingStepValues();

  const stepDistribution = useMemo(() => {
    if (!manufacturingOrders.length || !orderSteps.length || !stepFields.length) {
      return [];
    }

    // Filter in-progress manufacturing orders only
    const inProgressOrders = manufacturingOrders.filter(order => order.status === 'in_progress');
    
    // Group order steps by manufacturing step
    const stepGroups = new Map<string, any[]>();
    
    orderSteps.forEach(orderStep => {
      if (orderStep.status === 'in_progress' && orderStep.manufacturing_steps) {
        const stepId = orderStep.manufacturing_step_id;
        if (!stepGroups.has(stepId)) {
          stepGroups.set(stepId, []);
        }
        stepGroups.get(stepId)!.push(orderStep);
      }
    });

    // Calculate distribution for each step
    const distribution: StepDistribution[] = [];
    
    stepGroups.forEach((orderStepsInStep, stepId) => {
      const manufacturingStep = manufacturingSteps.find(step => step.id === stepId);
      if (!manufacturingStep) return;

      const stepFieldsConfig = getStepFields(stepId);
      const quantityField = stepFieldsConfig.find(field => 
        ['quantityAssigned', 'quantity_assigned', 'quantity'].includes(field.field_name)
      );
      const weightField = stepFieldsConfig.find(field => 
        ['rawMaterialWeightAssigned', 'weight_assigned', 'weight'].includes(field.field_name)
      );

      let totalQuantity: number | null = null;
      let totalWeight: number | null = null;
      const hasQuantityField = !!quantityField;
      const hasWeightField = !!weightField;

      // Get units from field options
      const quantityUnit = quantityField?.field_options?.unit || null;
      const weightUnit = weightField?.field_options?.unit || null;

      // Only calculate totals if fields exist
      if (hasQuantityField) {
        totalQuantity = 0;
        orderStepsInStep.forEach(orderStep => {
          const quantityValue = getStepValue(orderStep.id, quantityField!.field_id);
          const quantity = parseFloat(quantityValue) || 0;
          totalQuantity! += quantity;
        });
      }

      if (hasWeightField) {
        totalWeight = 0;
        orderStepsInStep.forEach(orderStep => {
          const weightValue = getStepValue(orderStep.id, weightField!.field_id);
          const weight = parseFloat(weightValue) || 0;
          totalWeight! += weight;
        });
      }

      distribution.push({
        stepId,
        stepName: manufacturingStep.step_name,
        stepOrder: manufacturingStep.step_order,
        totalQuantity,
        totalWeight,
        orderCount: orderStepsInStep.length,
        status: 'in_progress',
        hasQuantityField,
        hasWeightField,
        quantityUnit,
        weightUnit
      });
    });

    // Sort by step order
    return distribution.sort((a, b) => a.stepOrder - b.stepOrder);
  }, [manufacturingOrders, orderSteps, manufacturingSteps, stepFields, getStepFields, getStepValue]);

  const totalInProgress = useMemo(() => {
    return stepDistribution.reduce((totals, step) => ({
      quantity: totals.quantity + (step.totalQuantity || 0),
      weight: totals.weight + (step.totalWeight || 0),
      orders: totals.orders + step.orderCount
    }), { quantity: 0, weight: 0, orders: 0 });
  }, [stepDistribution]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Factory className="h-5 w-5 text-blue-600" />
            Manufacturing Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{totalInProgress.quantity}</div>
              <div className="text-xs text-gray-600">Total Quantity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-700">{totalInProgress.weight.toFixed(2)}</div>
              <div className="text-xs text-gray-600">Total Weight</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">{totalInProgress.orders}</div>
              <div className="text-xs text-gray-600">Active Steps</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Distribution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stepDistribution.map((step, index) => (
          <Card key={step.stepId} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                    {step.stepOrder}
                  </div>
                  <span className="truncate">{step.stepName}</span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                  Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Quantity */}
              <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">Quantity</span>
                </div>
                {step.hasQuantityField ? (
                  <div className="text-right">
                    <span className="text-lg font-bold text-emerald-800">{step.totalQuantity}</span>
                    {step.quantityUnit && (
                      <span className="text-sm text-emerald-600 ml-1">{step.quantityUnit}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-gray-500 italic">Not Applicable</span>
                )}
              </div>

              {/* Weight */}
              <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Weight className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Weight</span>
                </div>
                {step.hasWeightField ? (
                  <div className="text-right">
                    <span className="text-lg font-bold text-orange-800">{step.totalWeight?.toFixed(2)}</span>
                    {step.weightUnit && (
                      <span className="text-sm text-orange-600 ml-1">{step.weightUnit}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-gray-500 italic">Not Applicable</span>
                )}
              </div>

              {/* Order Count */}
              <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Orders</span>
                </div>
                <span className="text-lg font-bold text-purple-800">{step.orderCount}</span>
              </div>

              {/* Progress Indicator */}
              <div className="mt-3 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-500">
                    Step {step.stepOrder} of workflow
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {stepDistribution.length === 0 && (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Factory className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Active Manufacturing Steps</h3>
            <p className="text-gray-600">There are currently no manufacturing orders in progress.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinishedGoodsManufacturingDistribution;
