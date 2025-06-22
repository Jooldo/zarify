
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X } from 'lucide-react';
import { useWorkers } from '@/hooks/useWorkers';

type StepStatus = 'pending' | 'in_progress' | 'completed' | 'partially_completed';

interface StepEditFormProps {
  editFormData: {
    status: StepStatus;
    fieldValues: Record<string, any>;
  };
  currentStepFields: any[];
  isUpdating: boolean;
  onFieldValueChange: (fieldId: string, value: any) => void;
  onStatusChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const StepEditForm: React.FC<StepEditFormProps> = ({
  editFormData,
  currentStepFields,
  isUpdating,
  onFieldValueChange,
  onStatusChange,
  onSave,
  onCancel,
}) => {
  const { workers } = useWorkers();

  const renderEditableField = (field: any) => {
    const value = editFormData.fieldValues[field.field_id] || '';

    switch (field.field_type) {
      case 'worker':
        return (
          <Select 
            value={value} 
            onValueChange={(val) => onFieldValueChange(field.field_id, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select worker" />
            </SelectTrigger>
            <SelectContent>
              {workers.map(worker => (
                <SelectItem key={worker.id} value={worker.id}>
                  {worker.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => onFieldValueChange(field.field_id, e.target.value)}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
          />
        );
      case 'text':
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => onFieldValueChange(field.field_id, e.target.value)}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
          />
        );
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => onFieldValueChange(field.field_id, e.target.value)}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Edit Step Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Status</Label>
          <Select value={editFormData.status} onValueChange={onStatusChange}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="partially_completed">Partially Completed (QC Failed)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {currentStepFields.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Configure Step Fields</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentStepFields.map(field => (
                <div key={field.id} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {field.field_label}
                    {field.field_options?.unit && ` (${field.field_options.unit})`}
                    {field.is_required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderEditableField(field)}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            onClick={onSave}
            disabled={isUpdating}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
