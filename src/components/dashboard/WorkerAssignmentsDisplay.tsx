
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Package, Weight, Users, MapPin } from 'lucide-react';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useWorkers } from '@/hooks/useWorkers';

interface WorkerAssignment {
  workerId: string;
  workerName: string;
  totalQuantity: number;
  totalWeight: number;
  orderCount: number;
  steps: Array<{
    stepName: string;
    stepOrder: number;
    quantity: number;
    weight: number;
    quantityUnit: string | null;
    weightUnit: string | null;
    orderIds: string[];
  }>;
}

interface WorkerAssignmentsDisplayProps {
  manufacturingOrders: any[];
  loading: boolean;
}

const WorkerAssignmentsDisplay = ({ manufacturingOrders, loading }: WorkerAssignmentsDisplayProps) => {
  const { manufacturingSteps, orderSteps, stepFields, getStepFields } = useManufacturingSteps();
  const { getStepValue } = useManufacturingStepValues();
  const { workers } = useWorkers();

  const workerAssignments = useMemo(() => {
    if (!orderSteps.length || !manufacturingSteps.length || !stepFields.length || !workers.length) {
      return [];
    }

    // Filter for active order steps with assigned workers
    const activeOrderSteps = orderSteps.filter(
      orderStep => 
        orderStep.status === 'in_progress' && 
        orderStep.assigned_worker_id &&
        orderStep.manufacturing_steps
    );

    // Group by worker
    const workerMap = new Map<string, WorkerAssignment>();

    activeOrderSteps.forEach(orderStep => {
      const workerId = orderStep.assigned_worker_id!;
      const worker = workers.find(w => w.id === workerId);
      const manufacturingStep = orderStep.manufacturing_steps;
      
      if (!worker || !manufacturingStep) return;

      const stepFieldsConfig = getStepFields(orderStep.manufacturing_step_id);
      const quantityField = stepFieldsConfig.find(field => 
        ['quantityAssigned', 'quantity_assigned', 'quantity'].includes(field.field_name)
      );
      const weightField = stepFieldsConfig.find(field => 
        ['rawMaterialWeightAssigned', 'weight_assigned', 'weight'].includes(field.field_name)
      );

      let stepQuantity = 0;
      let stepWeight = 0;
      const quantityUnit = quantityField?.field_options?.unit || null;
      const weightUnit = weightField?.field_options?.unit || null;

      if (quantityField) {
        const quantityValue = getStepValue(orderStep.id, quantityField.field_id);
        stepQuantity = parseFloat(quantityValue) || 0;
      }

      if (weightField) {
        const weightValue = getStepValue(orderStep.id, weightField.field_id);
        stepWeight = parseFloat(weightValue) || 0;
      }

      if (!workerMap.has(workerId)) {
        workerMap.set(workerId, {
          workerId,
          workerName: worker.name,
          totalQuantity: 0,
          totalWeight: 0,
          orderCount: 0,
          steps: []
        });
      }

      const assignment = workerMap.get(workerId)!;
      
      // Check if step already exists for this worker
      let existingStep = assignment.steps.find(s => s.stepName === manufacturingStep.step_name);
      
      if (!existingStep) {
        existingStep = {
          stepName: manufacturingStep.step_name,
          stepOrder: manufacturingStep.step_order,
          quantity: 0,
          weight: 0,
          quantityUnit,
          weightUnit,
          orderIds: []
        };
        assignment.steps.push(existingStep);
      }

      // Add to totals
      assignment.totalQuantity += stepQuantity;
      assignment.totalWeight += stepWeight;
      existingStep.quantity += stepQuantity;
      existingStep.weight += stepWeight;
      
      if (!existingStep.orderIds.includes(orderStep.manufacturing_order_id)) {
        existingStep.orderIds.push(orderStep.manufacturing_order_id);
        assignment.orderCount += 1;
      }
    });

    // Sort steps by step order for each worker
    workerMap.forEach(assignment => {
      assignment.steps.sort((a, b) => a.stepOrder - b.stepOrder);
    });

    return Array.from(workerMap.values());
  }, [orderSteps, manufacturingSteps, stepFields, workers, getStepFields, getStepValue]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
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

  if (workerAssignments.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Active Worker Assignments</h3>
          <p className="text-gray-600">There are currently no workers assigned to manufacturing steps.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {workerAssignments.map((assignment) => (
        <Card key={assignment.workerId} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {assignment.workerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{assignment.workerName}</p>
                <p className="text-xs text-gray-500 font-normal">
                  {assignment.orderCount} order{assignment.orderCount !== 1 ? 's' : ''} assigned
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-2">
              {assignment.totalQuantity > 0 && (
                <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">Total Qty</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-800">
                    {assignment.totalQuantity}
                  </span>
                </div>
              )}
              
              {assignment.totalWeight > 0 && (
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Total Wt</span>
                  </div>
                  <span className="text-sm font-bold text-orange-800">
                    {assignment.totalWeight.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Current Steps */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4" />
                <span>Working On:</span>
              </div>
              
              {assignment.steps.map((step, index) => (
                <div key={`${step.stepName}-${index}`} className="pl-6 border-l-2 border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800">{step.stepName}</span>
                    <Badge variant="outline" className="text-xs">
                      Step {step.stepOrder}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    {step.quantity > 0 && (
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                        {step.quantity} {step.quantityUnit || 'pcs'}
                      </span>
                    )}
                    {step.weight > 0 && (
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                        {step.weight.toFixed(2)} {step.weightUnit || 'kg'}
                      </span>
                    )}
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {step.orderIds.length} order{step.orderIds.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WorkerAssignmentsDisplay;
