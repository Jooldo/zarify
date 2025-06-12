
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Calendar, 
  Hash, 
  FileText, 
  Activity, 
  CheckSquare,
  Plus,
  X
} from 'lucide-react';
import { ManufacturingStepConfig, RequiredField } from './ManufacturingConfigPanel';

interface StepFieldsConfigProps {
  step: ManufacturingStepConfig;
  availableFields: RequiredField[];
  onFieldsUpdate: (stepId: string, fields: RequiredField[]) => void;
}

const getFieldIcon = (type: string) => {
  switch (type) {
    case 'worker': return User;
    case 'date': return Calendar;
    case 'number': return Hash;
    case 'text': return FileText;
    case 'status': return Activity;
    case 'multiselect': return CheckSquare;
    default: return FileText;
  }
};

const getFieldTypeColor = (type: string) => {
  switch (type) {
    case 'worker': return 'bg-blue-100 text-blue-800';
    case 'date': return 'bg-green-100 text-green-800';
    case 'number': return 'bg-purple-100 text-purple-800';
    case 'text': return 'bg-gray-100 text-gray-800';
    case 'status': return 'bg-orange-100 text-orange-800';
    case 'multiselect': return 'bg-cyan-100 text-cyan-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const StepFieldsConfig: React.FC<StepFieldsConfigProps> = ({
  step,
  availableFields,
  onFieldsUpdate
}) => {
  const [selectedFields, setSelectedFields] = useState<RequiredField[]>(step.requiredFields);

  const handleFieldToggle = useCallback((field: RequiredField, isEnabled: boolean) => {
    let updatedFields: RequiredField[];
    
    if (isEnabled) {
      // Add field if not already present
      if (!selectedFields.find(f => f.id === field.id)) {
        updatedFields = [...selectedFields, field];
      } else {
        updatedFields = selectedFields;
      }
    } else {
      // Remove field
      updatedFields = selectedFields.filter(f => f.id !== field.id);
    }
    
    setSelectedFields(updatedFields);
    onFieldsUpdate(step.id, updatedFields);
  }, [selectedFields, step.id, onFieldsUpdate]);

  const handleRequiredToggle = useCallback((fieldId: string, required: boolean) => {
    const updatedFields = selectedFields.map(field =>
      field.id === fieldId ? { ...field, required } : field
    );
    
    setSelectedFields(updatedFields);
    onFieldsUpdate(step.id, updatedFields);
  }, [selectedFields, step.id, onFieldsUpdate]);

  const isFieldSelected = useCallback((fieldId: string) => {
    return selectedFields.some(f => f.id === fieldId);
  }, [selectedFields]);

  const getSelectedField = useCallback((fieldId: string) => {
    return selectedFields.find(f => f.id === fieldId);
  }, [selectedFields]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Required Fields for {step.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select which fields are required for this manufacturing step. Workers will need to fill these out when completing the step.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Available Fields</h4>
          <Badge variant="outline">
            {selectedFields.length} of {availableFields.length} selected
          </Badge>
        </div>

        <div className="space-y-3">
          {availableFields.map((field) => {
            const Icon = getFieldIcon(field.type);
            const isSelected = isFieldSelected(field.id);
            const selectedField = getSelectedField(field.id);
            
            return (
              <div key={field.id} className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={isSelected}
                      onCheckedChange={(checked) => handleFieldToggle(field, checked)}
                    />
                    
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{field.label}</span>
                    </div>
                    
                    <Badge className={`text-xs ${getFieldTypeColor(field.type)}`}>
                      {field.type}
                    </Badge>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`required-${field.id}`} className="text-xs">
                        Required
                      </Label>
                      <Switch
                        id={`required-${field.id}`}
                        checked={selectedField?.required || false}
                        onCheckedChange={(required) => handleRequiredToggle(field.id, required)}
                      />
                    </div>
                  )}
                </div>

                {/* Show field options for status/multiselect types */}
                {isSelected && field.type === 'status' && field.options && (
                  <div className="ml-8 p-2 bg-gray-50 rounded text-xs">
                    <div className="font-medium mb-1">Status Options:</div>
                    <div className="flex flex-wrap gap-1">
                      {field.options.map((option, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h4 className="font-medium">Step Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-xs text-muted-foreground">QC Required</Label>
            <div className="flex items-center gap-1 mt-1">
              {step.qcRequired ? (
                <Badge className="bg-orange-100 text-orange-800 text-xs">Yes</Badge>
              ) : (
                <Badge variant="outline" className="text-xs">No</Badge>
              )}
            </div>
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground">Estimated Duration</Label>
            <div className="mt-1 text-sm font-medium">
              {step.estimatedDuration} hours
            </div>
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Required Fields ({selectedFields.filter(f => f.required).length})</Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {selectedFields
              .filter(field => field.required)
              .map(field => (
                <Badge key={field.id} className="text-xs bg-red-100 text-red-800">
                  {field.label} *
                </Badge>
              ))}
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Optional Fields ({selectedFields.filter(f => !f.required).length})</Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {selectedFields
              .filter(field => !field.required)
              .map(field => (
                <Badge key={field.id} variant="outline" className="text-xs">
                  {field.label}
                </Badge>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepFieldsConfig;
