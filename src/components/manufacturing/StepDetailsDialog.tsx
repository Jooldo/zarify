import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, Package, Settings, Weight, Hash, Type, History } from 'lucide-react';
import { format } from 'date-fns';
import { StepCardData } from './ManufacturingStepCard';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useManufacturingSteps, ManufacturingOrderStep } from '@/hooks/useManufacturingSteps';

interface StepDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stepData: StepCardData | null;
  orderStep?: ManufacturingOrderStep | null;
  stepFields?: any[];
}

const StepDetailsDialog: React.FC<StepDetailsDialogProps> = ({
  open,
  onOpenChange,
  stepData,
  orderStep,
  stepFields = []
}) => {
  const { getStepValue, stepValues, isLoading: isLoadingValues } = useManufacturingStepValues();
  const { orderSteps: allOrderSteps, stepFields: allStepFields, isLoading: isLoadingSteps } = useManufacturingSteps();
  const isLoading = isLoadingValues || isLoadingSteps;

  React.useEffect(() => {
    if (open) {
      console.log('--- StepDetailsDialog DATA (REVISED) ---');
      console.log('isLoading (Combined):', isLoading);
      console.log('isLoadingValues:', isLoadingValues);
      console.log('isLoadingSteps:', isLoadingSteps);
      console.log('stepData:', JSON.stringify(stepData, null, 2));
      console.log('orderStep:', JSON.stringify(orderStep, null, 2));
      console.log('stepValues count:', stepValues.length);
      console.log('allOrderSteps count:', allOrderSteps.length);
      console.log('allStepFields count:', allStepFields.length);
    }
  }, [open, isLoading, isLoadingValues, isLoadingSteps, stepData, orderStep, allOrderSteps, allStepFields, stepValues]);

  if (!stepData) return null;

  console.log('StepDetailsDialog - stepData:', stepData);
  console.log('StepDetailsDialog - orderStep:', orderStep);
  console.log('StepDetailsDialog - stepFields from props:', stepFields);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get icon for field type with enhanced logic
  const getFieldIcon = (fieldName: string, fieldType: string) => {
    if (fieldName.toLowerCase().includes('weight')) {
      return <Weight className="h-4 w-4 text-purple-600" />;
    }
    if (fieldName.toLowerCase().includes('quantity')) {
      return <Hash className="h-4 w-4 text-purple-600" />;
    }
    if (fieldType === 'date') {
      return <Calendar className="h-4 w-4 text-purple-600" />;
    }
    if (fieldType === 'worker') {
      return <User className="h-4 w-4 text-purple-600" />;
    }
    if (fieldType === 'number') {
      return <Hash className="h-4 w-4 text-purple-600" />;
    }
    return <Type className="h-4 w-4 text-purple-600" />;
  };

  // Get field values from database if orderStep is available
  const getFieldValues = () => {
    if (!orderStep || !stepFields || stepFields.length === 0) {
      return [];
    }

    return stepFields.map(field => {
      let value = 'Not set';
      let displayValue = 'Not set';
      
      // Get value from database
      const savedValue = getStepValue(orderStep.id, field.field_id);
      if (savedValue !== null && savedValue !== undefined && savedValue !== '') {
        value = savedValue;
        displayValue = savedValue;
        
        // Add unit information from field options
        if (field.field_options?.unit) {
          displayValue = `${value} ${field.field_options.unit}`;
        }
      }
      
      return {
        ...field,
        value: displayValue,
        isEmpty: value === 'Not set'
      };
    });
  };

  const fieldValues = getFieldValues();

  const previousOrderSteps = React.useMemo(() => {
    if (isLoading || !orderStep || !orderStep.manufacturing_order_id || !orderStep.manufacturing_steps || typeof orderStep.manufacturing_steps.step_order !== 'number') {
      return [];
    }

    const currentStepOrder = orderStep.manufacturing_steps.step_order;

    const filteredSteps = allOrderSteps
      .filter(os =>
          String(os.manufacturing_order_id) === String(orderStep.manufacturing_order_id) &&
          os.manufacturing_steps && typeof os.manufacturing_steps.step_order === 'number' &&
          os.manufacturing_steps.step_order < currentStepOrder
      );

    return filteredSteps.sort((a, b) => (a.manufacturing_steps?.step_order || 0) - (b.manufacturing_steps?.step_order || 0));
  }, [orderStep, allOrderSteps, isLoading]);

  const previousStepsWithFieldValues = React.useMemo(() => {
    if (isLoading || !previousOrderSteps.length) {
      return [];
    }

    return previousOrderSteps.map(step => {
      const fieldsForStep = allStepFields.filter(f => String(f.manufacturing_step_id) === String(step.manufacturing_step_id));
      
      const stepFieldValues = {
        dueDate: 'N/A',
        quantityAssigned: 'N/A',
        quantityReceived: 'N/A',
        weightAssigned: 'N/A',
        weightReceived: 'N/A',
      };
      
      fieldsForStep.forEach(field => {
        const value = getStepValue(step.id, field.field_id);
        
        if (value !== null && value !== undefined && value !== '') {
          let displayValue = `${value}`;
          if (field.field_options?.unit) {
            displayValue = `${value} ${field.field_options.unit}`;
          }

          const fieldName = field.field_name.toLowerCase();

          if (field.field_type === 'date' && (fieldName.includes('due') || fieldName.includes('date'))) {
            const parsedDate = new Date(value);
            if (!isNaN(parsedDate.getTime())) {
                stepFieldValues.dueDate = format(parsedDate, 'dd MMM yyyy');
            }
          }
          if (fieldName.includes('quantity') && fieldName.includes('assigned')) {
            stepFieldValues.quantityAssigned = displayValue;
          }
          if (fieldName.includes('quantity') && fieldName.includes('received')) {
            stepFieldValues.quantityReceived = displayValue;
          }
          if (fieldName.includes('weight') && fieldName.includes('assigned')) {
            stepFieldValues.weightAssigned = displayValue;
          }
          if (fieldName.includes('weight') && fieldName.includes('received')) {
            stepFieldValues.weightReceived = displayValue;
          }
        }
      });
      
      return {
        ...step,
        ...stepFieldValues
      };
    });
  }, [previousOrderSteps, allStepFields, getStepValue, isLoading]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {stepData.stepName} Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Order Information */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Order Number</label>
              <p className="text-sm font-semibold">{stepData.orderNumber}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Product Name</label>
              <p className="text-sm">{stepData.productName}</p>
            </div>
          </div>

          {/* Product Details */}
          {(stepData.productCode || stepData.category) && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h3 className="text-xs font-medium text-blue-900 mb-2 flex items-center gap-1">
                <Settings className="h-3 w-3" />
                Product Configuration
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {stepData.productCode && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-blue-700">Product Code</label>
                    <p className="text-xs text-blue-800 font-mono bg-white px-2 py-1 rounded border">
                      {stepData.productCode}
                    </p>
                  </div>
                )}
                {stepData.category && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-blue-700">Category</label>
                    <p className="text-xs text-blue-800">{stepData.category}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Badge className={getStatusColor(stepData.status)}>
                {stepData.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Manufacturing Details */}
          {stepData.stepName === 'Manufacturing Order' && (stepData.quantityRequired || stepData.priority) && (
            <div className="bg-green-50 p-3 rounded-lg">
              <h3 className="text-xs font-medium text-green-900 mb-2">Manufacturing Details</h3>
              <div className="grid grid-cols-2 gap-2">
                {stepData.quantityRequired && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-green-700">Quantity</label>
                    <p className="text-xs text-green-800">{stepData.quantityRequired}</p>
                  </div>
                )}
                {stepData.priority && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-green-700">Priority</label>
                    <p className="text-xs text-green-800 capitalize">{stepData.priority}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Raw Materials Section */}
          {stepData.rawMaterials && stepData.rawMaterials.length > 0 && (
            <div className="bg-amber-50 p-3 rounded-lg">
              <h3 className="text-xs font-medium text-amber-900 mb-2 flex items-center gap-1">
                <Package className="h-3 w-3" />
                Raw Materials Required
              </h3>
              <div className="space-y-1">
                {stepData.rawMaterials.slice(0, 3).map((material, index) => (
                  <div key={index} className="flex justify-between items-center bg-white px-2 py-1 rounded border">
                    <span className="text-xs font-medium text-amber-800">{material.name}</span>
                    <span className="text-xs text-amber-700">
                      {material.quantity} {material.unit}
                    </span>
                  </div>
                ))}
                {stepData.rawMaterials.length > 3 && (
                  <p className="text-xs text-amber-700">+{stepData.rawMaterials.length - 3} more materials</p>
                )}
              </div>
            </div>
          )}

          {/* Previous Steps Data */}
          {previousOrderSteps.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="text-xs font-medium text-gray-900 mb-2 flex items-center gap-1">
                <History className="h-3 w-3" />
                Previous Steps
              </h3>
              <div className="overflow-x-auto">
                {isLoading ? (
                  <p className="text-xs text-center p-4">Loading step details...</p>
                ) : (
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="p-2 text-left font-semibold border border-gray-300">Step</th>
                        <th className="p-2 text-left font-semibold border border-gray-300">Status</th>
                        <th className="p-2 text-left font-semibold border border-gray-300">Worker</th>
                        <th className="p-2 text-left font-semibold border border-gray-300">Qty Assigned</th>
                        <th className="p-2 text-left font-semibold border border-gray-300">Qty Received</th>
                        <th className="p-2 text-left font-semibold border border-gray-300">Weight Assigned</th>
                        <th className="p-2 text-left font-semibold border border-gray-300">Weight Received</th>
                        <th className="p-2 text-left font-semibold border border-gray-300">Progress</th>
                        <th className="p-2 text-left font-semibold border border-gray-300">Started</th>
                        <th className="p-2 text-left font-semibold border border-gray-300">Completed</th>
                        <th className="p-2 text-left font-semibold border border-gray-300">Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previousStepsWithFieldValues.map((step) => (
                        <tr key={step.id} className="border-b border-gray-300">
                          <td className="p-2 font-medium border border-gray-300">{step.manufacturing_steps?.step_name || 'N/A'}</td>
                          <td className="p-2 border border-gray-300 capitalize">{step.status.replace('_', ' ')}</td>
                          <td className="p-2 border border-gray-300">{step.workers?.name || 'N/A'}</td>
                          <td className="p-2 border border-gray-300">{step.quantityAssigned}</td>
                          <td className="p-2 border border-gray-300">{step.quantityReceived}</td>
                          <td className="p-2 border border-gray-300">{step.weightAssigned}</td>
                          <td className="p-2 border border-gray-300">{step.weightReceived}</td>
                          <td className="p-2 border border-gray-300">{step.progress_percentage}%</td>
                          <td className="p-2 border border-gray-300">
                            {step.started_at ? format(new Date(step.started_at), 'dd MMM, hh:mm a') : 'N/A'}
                          </td>
                          <td className="p-2 border border-gray-300">
                            {step.completed_at ? format(new Date(step.completed_at), 'dd MMM, hh:mm a') : 'N/A'}
                          </td>
                          <td className="p-2 border border-gray-300">{step.dueDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
          
          {/* Step Field Values - Show actual values from database */}
          {fieldValues.length > 0 && (
            <div className="bg-purple-50 p-3 rounded-lg">
              <h3 className="text-xs font-medium text-purple-900 mb-2 flex items-center gap-1">
                <Settings className="h-3 w-3" />
                Step Configuration
              </h3>
              <div className="space-y-2">
                {fieldValues.map((field, index) => (
                  <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded border">
                    <div className="flex items-center gap-2">
                      {getFieldIcon(field.field_name, field.field_type)}
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-purple-800">
                          {field.field_label}
                          {field.field_options?.unit && ` (${field.field_options.unit})`}
                        </span>
                        <span className={`text-xs font-semibold ${field.isEmpty ? 'text-gray-500 italic' : 'text-purple-900'}`}>
                          {field.value}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {field.field_type}
                        {field.is_required && ' • Required'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step Fields - Enhanced with Icons and Units (fallback if no values) */}
          {fieldValues.length === 0 && stepData.stepFields && stepData.stepFields.length > 0 && (
            <div className="bg-purple-50 p-3 rounded-lg">
              <h3 className="text-xs font-medium text-purple-900 mb-2 flex items-center gap-1">
                <Settings className="h-3 w-3" />
                Step Configuration Fields
              </h3>
              <div className="space-y-2">
                {stepData.stepFields.map((field, index) => (
                  <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded border">
                    <div className="flex items-center gap-2">
                      {getFieldIcon(field.field_name, field.field_type)}
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-purple-800">
                          {field.field_label}
                          {field.field_options?.unit && ` (${field.field_options.unit})`}
                        </span>
                        <span className="text-xs text-purple-600">
                          {field.field_type}
                          {field.is_required && ' • Required'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {field.field_type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Worker and Duration */}
          <div className="grid grid-cols-2 gap-2">
            {stepData.assignedWorker && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Assigned Worker</label>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs font-medium">{stepData.assignedWorker}</p>
                </div>
              </div>
            )}
            {stepData.estimatedDuration && stepData.estimatedDuration > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Duration</label>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs">{stepData.estimatedDuration}h</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StepDetailsDialog;
