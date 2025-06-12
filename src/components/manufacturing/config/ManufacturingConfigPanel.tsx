
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Save
} from 'lucide-react';
import StepFieldsConfig from './StepFieldsConfig';
import { useToast } from '@/hooks/use-toast';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import { useMerchant } from '@/hooks/useMerchant';
import { supabase } from '@/integrations/supabase/client';

export interface RequiredField {
  id: string;
  name: string;
  label: string;
  type: 'worker' | 'date' | 'number' | 'text' | 'status' | 'multiselect';
  required: boolean;
  options?: string[];
}

export interface ManufacturingStepConfig {
  id: string;
  name: string;
  order: number;
  qcRequired: boolean;
  requiredFields: RequiredField[];
  estimatedDuration: number;
  description?: string;
}

const defaultRequiredFields: RequiredField[] = [
  { id: 'worker', name: 'assignedWorker', label: 'Assigned Worker', type: 'worker', required: true },
  { id: 'dueDate', name: 'dueDate', label: 'Due Date', type: 'date', required: true },
  { id: 'rawMaterialWeight', name: 'rawMaterialWeightAssigned', label: 'Material Weight Assigned', type: 'number', required: false },
  { id: 'rawMaterialReceived', name: 'rawMaterialReceived', label: 'Material Weight Received', type: 'number', required: false },
  { id: 'quantityAssigned', name: 'quantityAssigned', label: 'Quantity Assigned', type: 'number', required: false },
  { id: 'quantityReceived', name: 'quantityReceived', label: 'Quantity Received', type: 'number', required: false },
  { 
    id: 'status', 
    name: 'status', 
    label: 'Status', 
    type: 'status', 
    required: true, 
    options: ['Progress', 'Partially Completed', 'Completed', 'Pending'] 
  },
  { id: 'notes', name: 'notes', label: 'Notes / Instructions', type: 'text', required: false }
];

const ManufacturingConfigPanel = () => {
  const { toast } = useToast();
  const { manufacturingSteps, stepFields, isLoading, updateStep, saveStepFields } = useManufacturingSteps();
  const { merchant } = useMerchant();
  const [steps, setSteps] = useState<ManufacturingStepConfig[]>([]);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  // Convert database steps to local config format and load saved field configurations
  useEffect(() => {
    if (manufacturingSteps && manufacturingSteps.length > 0) {
      const configSteps = manufacturingSteps.map(step => {
        // Get saved fields for this step from stepFields
        const savedFields = stepFields
          .filter(field => field.manufacturing_step_id === step.id)
          .map(field => ({
            id: field.field_id,
            name: field.field_name,
            label: field.field_label,
            type: field.field_type,
            required: field.is_required,
            options: field.field_options
          }));

        // Use saved fields if available, otherwise use defaults
        const requiredFields = savedFields.length > 0 
          ? savedFields 
          : [defaultRequiredFields[0], defaultRequiredFields[6]]; // Worker and Status by default

        return {
          id: step.id,
          name: step.step_name,
          order: step.step_order,
          qcRequired: step.qc_required,
          requiredFields,
          estimatedDuration: step.estimated_duration_hours || 1,
          description: step.description
        };
      });
      setSteps(configSteps);
    } else {
      // No default steps - start with empty array
      setSteps([]);
    }
  }, [manufacturingSteps, stepFields]);

  const handleAddStep = useCallback(async () => {
    if (!merchant?.id) {
      toast({
        title: 'Error',
        description: 'Merchant information not available',
        variant: 'destructive',
      });
      return;
    }

    const newOrder = steps.length + 1;
    const newStepName = `Step ${newOrder}`;
    
    try {
      const { data, error } = await supabase
        .from('manufacturing_steps')
        .insert({
          step_name: newStepName,
          step_order: newOrder,
          estimated_duration_hours: 1,
          description: '',
          is_active: true,
          qc_required: false,
          merchant_id: merchant.id
        })
        .select()
        .single();

      if (error) throw error;

      const newStep: ManufacturingStepConfig = {
        id: data.id,
        name: newStepName,
        order: newOrder,
        qcRequired: false,
        requiredFields: [defaultRequiredFields[0], defaultRequiredFields[6]], // Worker and Status by default
        estimatedDuration: 1
      };
      
      setSteps(prev => [...prev, newStep]);
      setSelectedStepId(newStep.id);

      // Save default fields to database
      await saveStepFields(newStep.id, newStep.requiredFields);

      toast({
        title: 'Success',
        description: 'Manufacturing step added successfully',
      });
    } catch (error) {
      console.error('Error adding manufacturing step:', error);
      toast({
        title: 'Error',
        description: 'Failed to add manufacturing step',
        variant: 'destructive',
      });
    }
  }, [steps.length, toast, merchant?.id, saveStepFields]);

  const handleDeleteStep = useCallback(async (stepId: string) => {
    try {
      const { error } = await supabase
        .from('manufacturing_steps')
        .delete()
        .eq('id', stepId);

      if (error) throw error;

      setSteps(prev => {
        const filteredSteps = prev.filter(step => step.id !== stepId);
        // Reorder remaining steps
        return filteredSteps.map((step, index) => ({
          ...step,
          order: index + 1
        }));
      });
      
      if (selectedStepId === stepId) {
        setSelectedStepId(null);
      }

      toast({
        title: 'Success',
        description: 'Manufacturing step deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting manufacturing step:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete manufacturing step',
        variant: 'destructive',
      });
    }
  }, [selectedStepId, toast]);

  const handleStepNameChange = useCallback(async (stepId: string, name: string) => {
    // Update local state immediately for better UX
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, name } : step
    ));

    try {
      const { error } = await supabase
        .from('manufacturing_steps')
        .update({ step_name: name })
        .eq('id', stepId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating step name:', error);
      // Revert local state on error
      setSteps(prev => prev.map(step => 
        step.id === stepId ? { ...step, name: manufacturingSteps.find(ms => ms.id === stepId)?.step_name || name } : step
      ));
      toast({
        title: 'Error',
        description: 'Failed to update step name',
        variant: 'destructive',
      });
    }
  }, [toast, manufacturingSteps]);

  const handleQCToggle = useCallback(async (stepId: string, qcRequired: boolean) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, qcRequired } : step
    ));
    
    // Save to database
    await updateStep(stepId, { qc_required: qcRequired });
  }, [updateStep]);

  const handleFieldsUpdate = useCallback(async (stepId: string, fields: RequiredField[]) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, requiredFields: fields } : step
    ));
    
    // Save to database
    await saveStepFields(stepId, fields);
  }, [saveStepFields]);

  const handleDurationChange = useCallback(async (stepId: string, duration: number) => {
    try {
      const { error } = await supabase
        .from('manufacturing_steps')
        .update({ estimated_duration_hours: duration })
        .eq('id', stepId);

      if (error) throw error;

      setSteps(prev => prev.map(step => 
        step.id === stepId ? { ...step, estimatedDuration: duration } : step
      ));
    } catch (error) {
      console.error('Error updating duration:', error);
      toast({
        title: 'Error',
        description: 'Failed to update duration',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleSaveConfiguration = async () => {
    try {
      // Configuration is already saved as we update the database on each change
      toast({
        title: 'Configuration Saved',
        description: 'Manufacturing workflow configuration has been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save configuration. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const selectedStep = steps.find(step => step.id === selectedStepId);

  if (isLoading) {
    return <div>Loading manufacturing steps...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manufacturing Workflow Configuration</h2>
          <p className="text-muted-foreground">
            Define and customize your manufacturing steps, required fields, and quality checks.
          </p>
        </div>
        <Button onClick={handleSaveConfiguration} className="bg-primary">
          <Save className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Steps Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Manufacturing Steps ({steps.length})
              </CardTitle>
              <Button onClick={handleAddStep} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Step
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => (
              <StepConfigCard
                key={step.id}
                step={step}
                index={index}
                isSelected={selectedStepId === step.id}
                onSelect={() => setSelectedStepId(step.id)}
                onNameChange={handleStepNameChange}
                onQCToggle={handleQCToggle}
                onDurationChange={handleDurationChange}
                onDelete={handleDeleteStep}
              />
            ))}
            
            {steps.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No manufacturing steps configured.</p>
                <p className="text-sm">Click "Add Step" to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step Fields Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Step Configuration
              {selectedStep && (
                <Badge variant="secondary" className="ml-2">
                  {selectedStep.name}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedStep ? (
              <StepFieldsConfig
                step={selectedStep}
                availableFields={defaultRequiredFields}
                onFieldsUpdate={handleFieldsUpdate}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a step to configure its required fields</p>
                <p className="text-sm">Click on any step from the left panel to start configuring.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Individual Step Configuration Card Component
interface StepConfigCardProps {
  step: ManufacturingStepConfig;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onNameChange: (stepId: string, name: string) => void;
  onQCToggle: (stepId: string, qcRequired: boolean) => void;
  onDurationChange: (stepId: string, duration: number) => void;
  onDelete: (stepId: string) => void;
}

const StepConfigCard: React.FC<StepConfigCardProps> = ({
  step,
  index,
  isSelected,
  onSelect,
  onNameChange,
  onQCToggle,
  onDurationChange,
  onDelete
}) => {
  const [localName, setLocalName] = useState(step.name);

  // Update local name when step name changes from props
  useEffect(() => {
    setLocalName(step.name);
  }, [step.name]);

  const handleNameBlur = () => {
    if (localName !== step.name) {
      onNameChange(step.id, localName);
    }
  };

  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    }
  };

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        isSelected 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-primary/50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline" className="text-xs">
            {step.order}
          </Badge>
        </div>
        
        <div className="flex-1">
          <Input
            value={localName}
            onChange={(e) => {
              e.stopPropagation();
              setLocalName(e.target.value);
            }}
            onBlur={handleNameBlur}
            onKeyPress={handleNameKeyPress}
            className="border-none p-0 h-auto text-sm font-medium bg-transparent focus-visible:ring-0"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div className="flex items-center gap-2">
          {step.qcRequired && (
            <Badge variant="secondary" className="text-xs">
              QC Required
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(step.id);
            }}
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
        <div className="flex items-center justify-between">
          <Label htmlFor={`qc-${step.id}`} className="text-xs">QC Required</Label>
          <Switch
            id={`qc-${step.id}`}
            checked={step.qcRequired}
            onCheckedChange={(checked) => onQCToggle(step.id, checked)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Label className="text-xs">Duration (hrs):</Label>
          <Input
            type="number"
            value={step.estimatedDuration}
            onChange={(e) => onDurationChange(step.id, parseInt(e.target.value) || 1)}
            className="h-6 text-xs w-16"
            min="1"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      <div className="mt-2 text-xs text-muted-foreground">
        {step.requiredFields.length} required fields configured
      </div>
    </div>
  );
};

export default ManufacturingConfigPanel;
