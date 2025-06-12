
import React, { useState, useCallback } from 'react';
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
  { id: 'rawMaterialWeight', name: 'rawMaterialWeightAssigned', label: 'Raw Material Weight Assigned', type: 'number', required: false },
  { id: 'rawMaterialReceived', name: 'rawMaterialReceived', label: 'Raw Material Received', type: 'number', required: false },
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
  const [steps, setSteps] = useState<ManufacturingStepConfig[]>([
    {
      id: '1',
      name: 'Jhalai',
      order: 1,
      qcRequired: false,
      requiredFields: defaultRequiredFields.filter(f => 
        ['worker', 'dueDate', 'rawMaterialWeight', 'status', 'notes'].includes(f.id)
      ),
      estimatedDuration: 2
    },
    {
      id: '2',
      name: 'Dhol',
      order: 2,
      qcRequired: true,
      requiredFields: defaultRequiredFields.filter(f => 
        ['worker', 'dueDate', 'quantityAssigned', 'status', 'notes'].includes(f.id)
      ),
      estimatedDuration: 3
    }
  ]);

  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const handleAddStep = useCallback(() => {
    const newStep: ManufacturingStepConfig = {
      id: Date.now().toString(),
      name: `Step ${steps.length + 1}`,
      order: steps.length + 1,
      qcRequired: false,
      requiredFields: [defaultRequiredFields[0], defaultRequiredFields[6]], // Worker and Status by default
      estimatedDuration: 1
    };
    
    setSteps(prev => [...prev, newStep]);
    setSelectedStepId(newStep.id);
  }, [steps.length]);

  const handleDeleteStep = useCallback((stepId: string) => {
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
  }, [selectedStepId]);

  const handleStepNameChange = useCallback((stepId: string, name: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, name } : step
    ));
  }, []);

  const handleQCToggle = useCallback((stepId: string, qcRequired: boolean) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, qcRequired } : step
    ));
  }, []);

  const handleFieldsUpdate = useCallback((stepId: string, fields: RequiredField[]) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, requiredFields: fields } : step
    ));
  }, []);

  const handleDurationChange = useCallback((stepId: string, duration: number) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, estimatedDuration: duration } : step
    ));
  }, []);

  const handleSaveConfiguration = async () => {
    try {
      // TODO: Implement API call to save configuration
      console.log('Saving manufacturing configuration:', steps);
      
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
            value={step.name}
            onChange={(e) => {
              e.stopPropagation();
              onNameChange(step.id, e.target.value);
            }}
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
