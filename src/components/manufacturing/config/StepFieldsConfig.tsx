
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, GripVertical, User, Calendar, Hash, Type, Weight, Package } from 'lucide-react';
import { RequiredField, ManufacturingStepConfig } from './ManufacturingConfigPanel';

interface StepFieldsConfigProps {
  step: ManufacturingStepConfig;
  availableFields: RequiredField[];
  onFieldsUpdate: (stepId: string, fields: RequiredField[]) => void;
}

const StepFieldsConfig: React.FC<StepFieldsConfigProps> = ({
  step,
  availableFields,
  onFieldsUpdate
}) => {
  const [fields, setFields] = useState<RequiredField[]>(step.requiredFields);

  useEffect(() => {
    setFields(step.requiredFields);
  }, [step.requiredFields]);

  const handleAddField = () => {
    const newField: RequiredField = {
      id: `field_${Date.now()}`,
      name: '',
      label: '',
      type: 'text',
      required: false,
      options: {}
    };
    const updatedFields = [...fields, newField];
    setFields(updatedFields);
    onFieldsUpdate(step.id, updatedFields);
  };

  const handleRemoveField = (fieldId: string) => {
    const updatedFields = fields.filter(field => field.id !== fieldId);
    setFields(updatedFields);
    onFieldsUpdate(step.id, updatedFields);
  };

  const handleFieldUpdate = (fieldId: string, updates: Partial<RequiredField>) => {
    const updatedFields = fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    );
    setFields(updatedFields);
    onFieldsUpdate(step.id, updatedFields);
  };

  const handleAddFromTemplate = (templateField: RequiredField) => {
    const newField: RequiredField = {
      ...templateField,
      id: `${templateField.id}_${Date.now()}`,
    };
    const updatedFields = [...fields, newField];
    setFields(updatedFields);
    onFieldsUpdate(step.id, updatedFields);
  };

  const getFieldIcon = (type: string, name: string) => {
    if (type === 'worker') return <User className="h-4 w-4" />;
    if (type === 'date') return <Calendar className="h-4 w-4" />;
    if (type === 'number') {
      if (name.toLowerCase().includes('weight')) return <Weight className="h-4 w-4" />;
      if (name.toLowerCase().includes('quantity')) return <Hash className="h-4 w-4" />;
      return <Hash className="h-4 w-4" />;
    }
    return <Type className="h-4 w-4" />;
  };

  const isWeightField = (fieldName: string) => {
    return fieldName.toLowerCase().includes('weight');
  };

  const isQuantityField = (fieldName: string) => {
    return fieldName.toLowerCase().includes('quantity');
  };

  return (
    <div className="space-y-6">
      {/* Current Fields */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Configured Fields</h4>
          <Button onClick={handleAddField} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Custom Field
          </Button>
        </div>

        {fields.map((field, index) => (
          <Card key={field.id} className="p-4">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                {getFieldIcon(field.type, field.name)}
                <Badge variant="outline" className="text-xs">
                  {field.type}
                </Badge>
                <span className="flex-1 font-medium">{field.label || 'Untitled Field'}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveField(field.id)}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Field Name</Label>
                  <Input
                    value={field.name}
                    onChange={(e) => handleFieldUpdate(field.id, { name: e.target.value })}
                    placeholder="field_name"
                    className="h-8 text-xs"
                  />
                </div>
                
                <div>
                  <Label className="text-xs">Display Label</Label>
                  <Input
                    value={field.label}
                    onChange={(e) => handleFieldUpdate(field.id, { label: e.target.value })}
                    placeholder="Display Label"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Field Type</Label>
                  <Select 
                    value={field.type} 
                    onValueChange={(value) => handleFieldUpdate(field.id, { type: value as RequiredField['type'] })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="worker">Worker</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Unit Selection for Weight and Quantity Fields */}
                {(isWeightField(field.name) || isQuantityField(field.name)) && (
                  <div>
                    <Label className="text-xs flex items-center gap-1">
                      {isWeightField(field.name) ? (
                        <>
                          <Weight className="h-3 w-3" />
                          Weight Unit
                        </>
                      ) : (
                        <>
                          <Package className="h-3 w-3" />
                          Quantity Unit
                        </>
                      )}
                    </Label>
                    <Select 
                      value={field.options?.unit || (isWeightField(field.name) ? 'Kg' : 'pieces')}
                      onValueChange={(value) => handleFieldUpdate(field.id, { 
                        options: { ...field.options, unit: value }
                      })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {isWeightField(field.name) ? (
                          <>
                            <SelectItem value="Kg">
                              <div className="flex items-center gap-2">
                                <Weight className="h-3 w-3" />
                                Kilograms (Kg)
                              </div>
                            </SelectItem>
                            <SelectItem value="G">
                              <div className="flex items-center gap-2">
                                <Weight className="h-3 w-3" />
                                Grams (G)
                              </div>
                            </SelectItem>
                          </>
                        ) : (
                          <SelectItem value="pieces">
                            <div className="flex items-center gap-2">
                              <Package className="h-3 w-3" />
                              Pieces
                            </div>
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id={`required-${field.id}`}
                    checked={field.required}
                    onCheckedChange={(checked) => handleFieldUpdate(field.id, { required: checked })}
                  />
                  <Label htmlFor={`required-${field.id}`} className="text-xs">
                    Required
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {fields.length === 0 && (
          <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
            <p>No fields configured for this step.</p>
            <p className="text-sm">Add fields from templates below or create custom fields.</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Field Templates */}
      <div className="space-y-4">
        <h4 className="font-medium">Add from Templates</h4>
        <div className="grid grid-cols-1 gap-2">
          {availableFields.map((templateField) => {
            const isAlreadyAdded = fields.some(field => field.name === templateField.name);
            return (
              <div
                key={templateField.id}
                className={`flex items-center justify-between p-3 border rounded-lg ${
                  isAlreadyAdded ? 'bg-muted/50 border-muted' : 'hover:bg-muted/30 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getFieldIcon(templateField.type, templateField.name)}
                  <div>
                    <div className="font-medium text-sm">{templateField.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {templateField.type} • {templateField.required ? 'Required' : 'Optional'}
                      {(isWeightField(templateField.name) || isQuantityField(templateField.name)) && (
                        <span className="ml-1">
                          • {isWeightField(templateField.name) ? 'Kg/G units' : 'Pieces unit'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleAddFromTemplate(templateField)}
                  disabled={isAlreadyAdded}
                  size="sm"
                  variant="outline"
                >
                  {isAlreadyAdded ? 'Added' : 'Add'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepFieldsConfig;
