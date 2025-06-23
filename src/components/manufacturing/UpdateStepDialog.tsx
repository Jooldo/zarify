
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, User, Clock, Package, Settings, ChevronDown, ChevronUp, AlertCircle, Scale, Hash, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ManufacturingOrderStep } from '@/hooks/useManufacturingSteps';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useUpdateManufacturingStep } from '@/hooks/useUpdateManufacturingStep';
import { useWorkers } from '@/hooks/useWorkers';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { findWorkerName, calculateRemainingWeight, calculateRemainingQuantity } from '@/utils/weightCalculations';
import { useCreateManufacturingStep } from '@/hooks/useCreateManufacturingStep';

interface UpdateStepDialogProps {
  step: ManufacturingOrderStep | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStepUpdate?: () => void;
  orderSteps?: any[];
  manufacturingSteps?: any[];
}

const UpdateStepDialog: React.FC<UpdateStepDialogProps> = ({
  step,
  open,
  onOpenChange,
  onStepUpdate,
  orderSteps = [],
  manufacturingSteps = []
}) => {
  const { stepFields, refetch } = useManufacturingSteps();
  const { updateStep } = useUpdateManufacturingStep();
  const { createStep } = useCreateManufacturingStep();
  const { workers } = useWorkers();
  const { toast } = useToast();
  
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showParentDetails, setShowParentDetails] = useState(false);
  
  // Rework states
  const [isReworkMode, setIsReworkMode] = useState(false);
  const [reworkQuantity, setReworkQuantity] = useState('');
  const [reworkWeight, setReworkWeight] = useState('');

  // Check if this step should show rework tag based on step order comparison
  const shouldShowReworkTag = useMemo(() => {
    if (!step?.origin_step_id || !Array.isArray(orderSteps) || !Array.isArray(manufacturingSteps)) {
      return false;
    }

    // Get current step order
    const currentStepConfig = manufacturingSteps.find(ms => ms.step_name === step.step_name);
    if (!currentStepConfig) return false;

    // Get origin step details
    const originStep = orderSteps.find(os => os.id === step.origin_step_id);
    if (!originStep) return false;

    // Get origin step order
    const originStepConfig = manufacturingSteps.find(ms => ms.step_name === originStep.step_name);
    if (!originStepConfig) return false;

    // Show rework tag if current step order <= origin step order
    return currentStepConfig.step_order <= originStepConfig.step_order;
  }, [step, orderSteps, manufacturingSteps]);

  // Get parent step details
  const parentStepDetails = useMemo(() => {
    if (!step || !step.parent_instance_id || !orderSteps.length) {
      return null;
    }

    const parentStep = orderSteps.find(orderStep => orderStep.id === step.parent_instance_id);
    if (!parentStep) return null;

    const parentStepDefinition = manufacturingSteps.find(ms => ms.step_name === parentStep.step_name);
    const parentStepFields = stepFields.filter(field => field.step_name === parentStep.step_name);

    return {
      step: parentStep,
      definition: parentStepDefinition,
      fields: parentStepFields
    };
  }, [step, orderSteps, manufacturingSteps, stepFields]);

  // Calculate remaining quantities
  const remainingQuantities = useMemo(() => {
    if (!step || !parentStepDetails) {
      return null;
    }

    const currentStepName = step.step_name;
    const parentInstanceNumber = parentStepDetails.step.instance_number || 1;

    // Calculate remaining weight (excluding current step's assignment)
    const otherChildSteps = orderSteps.filter(orderStep => 
      orderStep.parent_instance_id === step.parent_instance_id && 
      orderStep.id !== step.id
    );

    const remainingWeight = calculateRemainingWeight(
      parentStepDetails.step,
      otherChildSteps,
      currentStepName,
      parentInstanceNumber
    );

    const remainingQuantity = calculateRemainingQuantity(
      parentStepDetails.step,
      otherChildSteps,
      currentStepName,
      parentInstanceNumber
    );

    // Add back current step's assignments to show total available
    const totalAvailableWeight = remainingWeight + (step.weight_assigned || 0);
    const totalAvailableQuantity = remainingQuantity + (step.quantity_assigned || 0);

    return {
      weight: totalAvailableWeight,
      quantity: totalAvailableQuantity,
      parentWeightReceived: parentStepDetails.step.weight_received || 0,
      parentQuantityReceived: parentStepDetails.step.quantity_received || 0
    };
  }, [step, parentStepDetails, orderSteps]);

  // Get current step fields that match this step in consistent order
  const currentStepFields = stepFields.filter(field => {
    return step && field.step_name === step.step_name;
  }).sort((a, b) => {
    // Define consistent field order
    const fieldOrder = [
      'quantity_assigned',
      'quantity_received', 
      'weight_assigned',
      'weight_received',
      'purity',
      'wastage',
      'assigned_worker',
      'due_date',
      'notes'
    ];
    
    const aIndex = fieldOrder.indexOf(a.field_key);
    const bIndex = fieldOrder.indexOf(b.field_key);
    
    // If both fields are in the order array, sort by that order
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    // If only one is in the order array, prioritize it
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    // If neither is in the order array, sort alphabetically
    return a.field_key.localeCompare(b.field_key);
  });

  // Create a unique key that changes when step data changes
  const stepDataKey = useMemo(() => {
    if (!step) return '';
    return `${step.id}-${step.updated_at}-${step.quantity_assigned}-${step.quantity_received}-${step.weight_assigned}-${step.weight_received}-${step.purity}-${step.wastage}-${step.assigned_worker}`;
  }, [step]);

  // Initialize form values when step changes or when step data updates
  useEffect(() => {
    if (step && open) {
      console.log('Initializing form with step:', step);
      
      // Initialize field values with current database values
      const initialValues: Record<string, any> = {};
      
      currentStepFields.forEach(field => {
        // Check if the step has the field value directly from database
        switch (field.field_key) {
          case 'quantity_assigned':
            initialValues[field.field_key] = step.quantity_assigned || '';
            break;
          case 'quantity_received':
            initialValues[field.field_key] = step.quantity_received || '';
            break;
          case 'weight_assigned':
            initialValues[field.field_key] = step.weight_assigned || '';
            break;
          case 'weight_received':
            initialValues[field.field_key] = step.weight_received || '';
            break;
          case 'purity':
            initialValues[field.field_key] = step.purity || '';
            break;
          case 'wastage':
            initialValues[field.field_key] = step.wastage || '';
            break;
          case 'assigned_worker':
            initialValues[field.field_key] = step.assigned_worker || 'unassigned';
            break;
          case 'due_date':
            initialValues[field.field_key] = step.due_date ? new Date(step.due_date) : undefined;
            break;
          case 'notes':
            initialValues[field.field_key] = step.notes || '';
            break;
          default:
            initialValues[field.field_key] = '';
        }
      });
      
      console.log('Initial field values:', initialValues);
      
      setFieldValues(initialValues);
      setStatus(step.status || '');
      
      // Reset rework states
      setIsReworkMode(false);
      setReworkQuantity('');
      setReworkWeight('');
    }
  }, [step, open, currentStepFields.length, stepDataKey]);

  const handleFieldChange = (fieldKey: string, value: any) => {
    console.log('Field changed:', fieldKey, '=', value);
    setFieldValues(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const handleReworkSubmit = async () => {
    if (!step || !reworkQuantity || !reworkWeight) {
      toast({
        title: 'Error',
        description: 'Please fill in both quantity and weight for rework',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create a new Jhalai step instance with rework data
      await createStep({
        manufacturingOrderId: step.order_id,
        stepName: 'Jhalai',
        fieldValues: {
          parent_instance_id: null, // No parent for rework Jhalai step
          quantity_assigned: parseFloat(reworkQuantity),
          weight_assigned: parseFloat(reworkWeight),
          is_rework: true,
          origin_step_id: step.id, // The current step where rework is initiated
          status: 'pending'
        }
      });

      toast({
        title: 'Success',
        description: `Rework instance created for ${reworkQuantity} pieces (${reworkWeight}kg)`,
      });
      
      // Reset rework mode
      setIsReworkMode(false);
      setReworkQuantity('');
      setReworkWeight('');
      
      if (onStepUpdate) {
        onStepUpdate();
      }
      
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error creating rework step:', error);
      toast({
        title: 'Error',
        description: 'Failed to create rework instance',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!step) return;
    
    // If in rework mode, handle rework submission
    if (isReworkMode) {
      await handleReworkSubmit();
      return;
    }
    
    setIsSubmitting(true);

    try {
      console.log('Submitting update with field values:', fieldValues);
      
      // Prepare field values with proper handling for dates and worker assignment
      const processedFieldValues = { ...fieldValues };
      Object.entries(processedFieldValues).forEach(([key, value]) => {
        if (key === 'due_date' && value instanceof Date) {
          processedFieldValues[key] = format(value, 'yyyy-MM-dd');
        }
        if (key === 'assigned_worker' && value === 'unassigned') {
          processedFieldValues[key] = null;
        }
      });
      
      await updateStep({
        stepId: step.id,
        fieldValues: processedFieldValues,
        status: status as any,
        stepName: step.step_name,
        orderNumber: 'Unknown'
      });

      toast({
        title: 'Success',
        description: 'Step updated successfully',
      });

      // Force refresh of data
      await refetch();

      // Trigger data refresh
      if (onStepUpdate) {
        onStepUpdate();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating step:', error);
      toast({
        title: 'Error',
        description: 'Failed to update step',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFieldLabel = (fieldKey: string) => {
    const fieldLabels: Record<string, string> = {
      'quantity_assigned': 'Quantity Assigned',
      'quantity_received': 'Quantity Received',
      'weight_assigned': 'Weight Assigned',
      'weight_received': 'Weight Received',
      'purity': 'Purity',
      'wastage': 'Wastage',
      'assigned_worker': 'Assigned Worker',
      'due_date': 'Due Date',
      'notes': 'Notes'
    };
    
    return fieldLabels[fieldKey] || fieldKey
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatParentFieldValue = (field: any, value: any) => {
    if (!value || value === 0) return '-';
    
    // Handle assigned worker specially to show worker name instead of ID
    if (field.field_key === 'assigned_worker') {
      return findWorkerName(value, workers);
    }
    
    // For weight fields, display in kg (no conversion needed as values are already in kg)
    if (field.field_key === 'weight_assigned' || field.field_key === 'weight_received' || field.field_key === 'wastage') {
      return `${value} kg`;
    }
    
    if (field.field_key === 'purity') {
      return `${value}%`;
    }
    
    return value;
  };

  const renderField = (field: any) => {
    const value = fieldValues[field.field_key] || '';

    // Handle assigned worker field
    if (field.field_key === 'assigned_worker') {
      return (
        <div key={field.id} className="space-y-1">
          <Label className="text-xs font-medium text-gray-600">
            <User className="h-3 w-3 inline mr-1" />
            Assigned Worker
            {field.is_visible && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select 
            value={value || 'unassigned'} 
            onValueChange={(newValue) => handleFieldChange(field.field_key, newValue)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select worker" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {workers.map(worker => (
                <SelectItem key={worker.id} value={worker.id}>
                  {worker.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Handle due date field
    if (field.field_key === 'due_date') {
      const dateValue = value instanceof Date ? value : (value ? new Date(value) : undefined);
      return (
        <div key={field.id} className="space-y-1">
          <Label className="text-xs font-medium text-gray-600">
            <Clock className="h-3 w-3 inline mr-1" />
            Due Date
            {field.is_visible && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-8 text-sm",
                  !dateValue && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3 w-3" />
                {dateValue ? format(dateValue, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateValue}
                onSelect={(date) => handleFieldChange(field.field_key, date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    }

    // Handle notes field
    if (field.field_key === 'notes') {
      return (
        <div key={field.id} className="space-y-1 col-span-2">
          <Label htmlFor={field.field_key} className="text-xs font-medium text-gray-600">
            {formatFieldLabel(field.field_key)}
            {field.is_visible && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Textarea
            id={field.field_key}
            value={value}
            onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
            placeholder={`Enter ${formatFieldLabel(field.field_key)}`}
            rows={2}
            className="text-sm resize-none"
          />
        </div>
      );
    }

    // Handle regular fields with enhanced remaining quantity info
    const showRemainingInfo = remainingQuantities && 
      (field.field_key === 'quantity_assigned' || field.field_key === 'weight_assigned');

    const getFieldIcon = (fieldKey: string) => {
      if (fieldKey === 'quantity_assigned' || fieldKey === 'quantity_received') {
        return <Hash className="h-3 w-3 text-blue-600" />;
      }
      if (fieldKey === 'weight_assigned' || fieldKey === 'weight_received') {
        return <Scale className="h-3 w-3 text-purple-600" />;
      }
      return null;
    };

    return (
      <div key={field.id} className="space-y-1">
        <Label htmlFor={field.field_key} className="text-xs font-medium text-gray-600">
          {formatFieldLabel(field.field_key)}
          {field.is_visible && <span className="text-red-500 ml-1">*</span>}
          {field.unit && <span className="text-gray-400 ml-1">({field.unit})</span>}
        </Label>
        <Input
          id={field.field_key}
          value={value}
          onChange={(e) => handleFieldChange(field.field_key, e.target.value)}
          placeholder={`Enter ${formatFieldLabel(field.field_key)}`}
          type={field.field_key.includes('quantity') || field.field_key.includes('weight') || field.field_key.includes('purity') || field.field_key.includes('wastage') ? 'number' : 'text'}
          step={field.field_key.includes('quantity') || field.field_key.includes('weight') || field.field_key.includes('purity') || field.field_key.includes('wastage') ? '0.01' : undefined}
          className="h-8 text-sm"
        />
        {showRemainingInfo && (
          <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-md mt-1">
            {getFieldIcon(field.field_key)}
            <div className="flex-1">
              <div className="text-xs font-medium text-emerald-800">
                Available from parent: {field.field_key === 'quantity_assigned' 
                  ? `${remainingQuantities.quantity} pieces` 
                  : `${remainingQuantities.weight.toFixed(2)} kg`}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!step) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5 text-blue-600" />
              Update Step
            </DialogTitle>
            <div className="flex items-center gap-2">
              {shouldShowReworkTag && (
                <Badge className="text-xs bg-orange-100 text-orange-800">
                  Rework
                </Badge>
              )}
              <Badge className={`text-xs ${getStatusColor(step.status)}`}>
                {step.status?.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {step.step_name} {step.instance_number && step.instance_number > 1 && `#${step.instance_number}`}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Parent Step Details with Remaining Weight */}
          {parentStepDetails && (
            <Card>
              <Collapsible open={showParentDetails} onOpenChange={setShowParentDetails}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="pb-2 cursor-pointer hover:bg-gray-50">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-purple-600" />
                        Parent Step: {parentStepDetails.step.step_name}
                        {parentStepDetails.step.instance_number && parentStepDetails.step.instance_number > 1 && ` #${parentStepDetails.step.instance_number}`}
                      </div>
                      {showParentDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CardTitle>
                    {/* Show remaining weight in the collapsed header */}
                    {!showParentDetails && remainingQuantities && (
                      <div className="text-xs text-purple-600 font-medium flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          Available: {remainingQuantities.quantity} pieces
                        </span>
                        <span className="flex items-center gap-1">
                          <Scale className="h-3 w-3" />
                          Available: {remainingQuantities.weight.toFixed(2)} kg
                        </span>
                      </div>
                    )}
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {/* Remaining quantities summary */}
                    {remainingQuantities && (
                      <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                        <div className="text-sm font-medium text-purple-900 mb-2">Available for Assignment to Next Step</div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
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
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {parentStepDetails.fields.map(field => {
                          const value = parentStepDetails.step[field.field_key];
                          if (!value && value !== 0) return null;
                          
                          return (
                            <div key={field.id} className="bg-white rounded p-2 border">
                              <div className="text-gray-500 mb-1">{formatFieldLabel(field.field_key)}</div>
                              <div className="font-semibold text-gray-900">
                                {formatParentFieldValue(field, value)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )}

          {/* Status Only */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-600">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Step Configuration Fields in 2x2 Grid */}
          {currentStepFields.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  Step Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3">
                  {currentStepFields.map(field => {
                    // Update field labels to show kg for weight fields
                    const updatedField = { ...field };
                    if (field.field_key.includes('weight')) {
                      updatedField.unit = 'kg';
                    }
                    return renderField(updatedField);
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rework Section - Now below configured fields */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-orange-600" />
                Rework Option
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center space-x-2 mb-3">
                <Checkbox 
                  id="rework-mode" 
                  checked={isReworkMode}
                  onCheckedChange={(checked) => setIsReworkMode(checked === true)}
                />
                <Label htmlFor="rework-mode" className="text-sm text-gray-700">
                  Create rework instance for this step
                </Label>
              </div>
              
              {isReworkMode && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-600">
                      Quantity (required)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={reworkQuantity}
                      onChange={(e) => setReworkQuantity(e.target.value)}
                      placeholder="Enter quantity"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-gray-600">
                      Weight (Kg, required)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={reworkWeight}
                      onChange={(e) => setReworkWeight(e.target.value)}
                      placeholder="Enter weight"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-8 px-4 text-sm"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || (isReworkMode && (!reworkQuantity || !reworkWeight))}
              className="h-8 px-4 text-sm"
            >
              {isSubmitting ? 'Processing...' : (isReworkMode ? 'Create Rework' : 'Update Step')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStepDialog;
