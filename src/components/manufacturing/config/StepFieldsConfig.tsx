
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Settings, Save } from 'lucide-react';

// Simple interfaces for this component
interface RequiredField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  unit?: string;
}

interface ManufacturingStepConfig {
  id: string;
  step_name: string;
  step_order: number;
  fields: RequiredField[];
}

interface StepFieldsConfigProps {
  steps: ManufacturingStepConfig[];
  onSave: (stepId: string, fields: RequiredField[]) => void;
  isLoading?: boolean;
}

const StepFieldsConfig: React.FC<StepFieldsConfigProps> = ({ 
  steps, 
  onSave, 
  isLoading = false 
}) => {
  const [changes, setChanges] = useState<{[stepId: string]: RequiredField[]}>({});

  const handleFieldToggle = (stepId: string, fieldId: string, required: boolean) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    const updatedFields = step.fields.map(field => 
      field.id === fieldId ? { ...field, required } : field
    );

    setChanges(prev => ({
      ...prev,
      [stepId]: updatedFields
    }));
  };

  const handleSave = (stepId: string) => {
    const fieldsToSave = changes[stepId];
    if (fieldsToSave) {
      onSave(stepId, fieldsToSave);
      setChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[stepId];
        return newChanges;
      });
    }
  };

  const getFieldsForStep = (step: ManufacturingStepConfig) => {
    return changes[step.id] || step.fields;
  };

  const hasChanges = (stepId: string) => {
    return stepId in changes;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Step Fields Configuration</h2>
        <p className="text-muted-foreground">
          Configure which fields are required for each manufacturing step.
        </p>
      </div>

      {steps.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No manufacturing steps configured yet.</p>
            <p className="text-sm text-muted-foreground">Add steps first to configure their fields.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {steps.map((step) => (
            <Card key={step.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="outline">{step.step_order}</Badge>
                    {step.step_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Configure required fields for this step
                  </p>
                </div>
                {hasChanges(step.id) && (
                  <Button onClick={() => handleSave(step.id)} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {getFieldsForStep(step).map((field) => (
                    <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Label className="font-medium">{field.label}</Label>
                          <Badge variant="secondary" className="text-xs">
                            {field.type}
                          </Badge>
                          {field.unit && (
                            <Badge variant="outline" className="text-xs">
                              {field.unit}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`${step.id}-${field.id}`} className="text-sm">
                          Required
                        </Label>
                        <Switch
                          id={`${step.id}-${field.id}`}
                          checked={field.required}
                          onCheckedChange={(checked) => 
                            handleFieldToggle(step.id, field.id, checked)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StepFieldsConfig;
