
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Factory, Package, Clock, ArrowRight } from 'lucide-react';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useRawMaterials } from '@/hooks/useRawMaterials';

interface RawMaterialManufacturingDistributionProps {
  loading?: boolean;
}

const RawMaterialManufacturingDistribution = ({ loading }: RawMaterialManufacturingDistributionProps) => {
  const { manufacturingOrders, isLoading: ordersLoading } = useManufacturingOrders();
  const { manufacturingSteps, orderSteps, isLoading: stepsLoading } = useManufacturingSteps();
  const { rawMaterials, loading: materialsLoading } = useRawMaterials();

  const stepDistributionData = useMemo(() => {
    if (!manufacturingOrders.length || !manufacturingSteps.length || !orderSteps.length || !rawMaterials.length) {
      return [];
    }

    // Get active manufacturing orders (in_progress or pending)
    const activeOrders = manufacturingOrders.filter(order => 
      order.status === 'in_progress' || order.status === 'pending'
    );

    // Create a map of current steps for each order
    const orderCurrentSteps = new Map();
    
    activeOrders.forEach(order => {
      // Find the current step for this order
      const currentOrderSteps = orderSteps.filter(step => step.manufacturing_order_id === order.id);
      
      if (currentOrderSteps.length === 0) {
        // No steps created yet, consider it at the first step
        const firstStep = manufacturingSteps.find(step => step.step_order === 1);
        if (firstStep) {
          orderCurrentSteps.set(order.id, {
            stepId: firstStep.id,
            stepName: firstStep.step_name,
            stepOrder: firstStep.step_order,
            status: 'pending'
          });
        }
      } else {
        // Find the highest step order that has been created for this order
        const highestStep = currentOrderSteps
          .sort((a, b) => (b.manufacturing_steps?.step_order || 0) - (a.manufacturing_steps?.step_order || 0))[0];
        
        if (highestStep.manufacturing_steps) {
          orderCurrentSteps.set(order.id, {
            stepId: highestStep.manufacturing_steps.id,
            stepName: highestStep.manufacturing_steps.step_name,
            stepOrder: highestStep.manufacturing_steps.step_order,
            status: highestStep.status
          });
        }
      }
    });

    // Group orders by their current step
    const stepOrderGroups = new Map();
    
    orderCurrentSteps.forEach((stepInfo, orderId) => {
      const order = activeOrders.find(o => o.id === orderId);
      if (!order) return;

      if (!stepOrderGroups.has(stepInfo.stepId)) {
        stepOrderGroups.set(stepInfo.stepId, {
          stepName: stepInfo.stepName,
          stepOrder: stepInfo.stepOrder,
          orders: [],
          totalQuantity: 0,
          totalWeight: 0
        });
      }

      const group = stepOrderGroups.get(stepInfo.stepId);
      group.orders.push(order);
      group.totalQuantity += order.quantity_required;
      
      // Calculate estimated weight based on raw materials needed
      if (order.product_config_id) {
        // This is a simplified calculation - in reality you'd need to access product_config_materials
        // For now, we'll use a rough estimate
        group.totalWeight += order.quantity_required * 0.1; // Rough estimate
      }
    });

    // Convert to array and sort by step order
    return Array.from(stepOrderGroups.values())
      .sort((a, b) => a.stepOrder - b.stepOrder);
  }, [manufacturingOrders, manufacturingSteps, orderSteps, rawMaterials]);

  const totalInManufacturing = useMemo(() => {
    return stepDistributionData.reduce((total, step) => total + step.totalQuantity, 0);
  }, [stepDistributionData]);

  const totalWeightInManufacturing = useMemo(() => {
    return stepDistributionData.reduce((total, step) => total + step.totalWeight, 0);
  }, [stepDistributionData]);

  if (loading || ordersLoading || stepsLoading || materialsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (stepDistributionData.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6 text-center">
          <Factory className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Manufacturing</h3>
          <p className="text-gray-500">No manufacturing orders are currently in progress.</p>
        </CardContent>
      </Card>
    );
  }

  const getStepColor = (stepOrder: number, stepName: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600', 
      'from-indigo-500 to-indigo-600',
      'from-pink-500 to-pink-600',
      'from-teal-500 to-teal-600',
      'from-orange-500 to-orange-600'
    ];
    return colors[(stepOrder - 1) % colors.length];
  };

  const getStepIcon = (stepName: string) => {
    const name = stepName.toLowerCase();
    if (name.includes('jalai') || name.includes('jhalai')) return Package;
    if (name.includes('dhol')) return Clock;
    return Factory;
  };

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-slate-50 to-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Factory className="h-5 w-5 text-blue-600" />
            Raw Materials in Manufacturing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalInManufacturing}</div>
              <div className="text-sm text-gray-600">Total Units</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalWeightInManufacturing.toFixed(1)}kg</div>
              <div className="text-sm text-gray-600">Estimated Weight</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Distribution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stepDistributionData.map((step, index) => {
          const StepIcon = getStepIcon(step.stepName);
          const colorClass = getStepColor(step.stepOrder, step.stepName);
          
          return (
            <Card key={step.stepName} className="shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClass}`}>
                    <StepIcon className="h-5 w-5 text-white" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Step {step.stepOrder}
                  </Badge>
                </div>
                <CardTitle className="text-base font-semibold text-gray-800 mt-2">
                  {step.stepName}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Units:</span>
                    <span className="text-lg font-bold text-gray-900">{step.totalQuantity}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Est. Weight:</span>
                    <span className="text-sm font-semibold text-gray-700">{step.totalWeight.toFixed(1)}kg</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Orders:</span>
                    <span className="text-sm font-semibold text-gray-700">{step.orders.length}</span>
                  </div>

                  {/* Progress indicator */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 rounded-full bg-gradient-to-r ${colorClass} flex-1`}></div>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RawMaterialManufacturingDistribution;
