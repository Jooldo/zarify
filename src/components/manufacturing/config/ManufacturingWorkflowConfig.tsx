
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Settings, Trash2, GripVertical } from 'lucide-react';
import { useMasterFields } from '@/hooks/useMasterFields';
import { useMerchantStepConfig } from '@/hooks/useMerchantStepConfig';
import { useToast } from '@/hooks/use-toast';

const ManufacturingWorkflowConfig = () => {
  const { toast } = useToast();
  const { masterFields } = useMasterFields();
  const {
    steps,
    fieldConfigs,
    isLoading,
    createStep,
    updateFieldVisibility,
    deleteStep,
    isFieldVisible,
    getFieldUnit,
    isCreatingStep,
  } = useMerchantStepConfig();

  const [newStepName, setNewStepName] = useState('');
  const [isAddStepDialogOpen, setIsAddStepDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<string>('');

  // Unit options for fields
  const unitOptions = [
    { value: 'grams', label: 'Grams' },
    { value: 'kilograms', label: 'Kilograms' },
    { value: 'pieces', label: 'Pieces' },
    { value: 'carats', label: 'Carats' },
    { value: 'millimeters', label: 'Millimeters' },
    { value: 'centimeters', label: 'Centimeters' },
    { value: 'hours', label: 'Hours' },
    { value: 'minutes', label: 'Minutes' },
    { value: 'percent', label: 'Percent' },
    { value: 'celsius', label: 'Celsius' },
    { value: 'fahrenheit', label: 'Fahrenheit' },
  ];

  const handleCreateStep = () => {
    if (!newStepName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a step name',
        variant: 'destructive',
      });
      return;
    }

    const nextOrder = Math.max(...steps.map(s => s.step_order), 0) + 1;
    
    createStep({
      step_name: newStepName.trim(),
      step_order: nextOrder,
    });

    setNewStepName('');
    setIsAddStepDialogOpen(false);
  };

  const handleFieldVisibilityToggle = (stepName: string, fieldKey: string, isVisible: boolean) => {
    const currentUnit = getFieldUnit(stepName, fieldKey);
    updateFieldVisibility({
      step_name: stepName,
      field_key: fieldKey,
      is_visible: isVisible,
      unit: currentUnit,
    });
  };

  const handleUnitChange = (stepName: string, fieldKey: string, unit: string) => {
    const isVisible = isFieldVisible(stepName, fieldKey);
    updateFieldVisibility({
      step_name: stepName,
      field_key: fieldKey,
      is_visible: isVisible,
      unit: unit,
    });
  };

  const handleDeleteStep = (stepId: string, stepName: string) => {
    if (confirm(`Are you sure you want to delete the "${stepName}" step? This will also remove all field configurations for this step.`)) {
      deleteStep(stepId);
    }
  };

  const shouldShowUnitSelector = (dataType: string) => {
    return ['number', 'decimal'].includes(dataType);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Manufacturing Workflow Configuration</h2>
        <p className="text-muted-foreground">
          Configure your manufacturing steps and choose which fields to show for each step.
        </p>
      </div>

      {/* Steps Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Manufacturing Steps</CardTitle>
            <p className="text-sm text-muted-foreground">
              Define the sequence of steps in your manufacturing process
            </p>
          </div>
          <Dialog open={isAddStepDialogOpen} onOpenChange={setIsAddStepDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Manufacturing Step</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="step-name">Step Name</Label>
                  <Input
                    id="step-name"
                    value={newStepName}
                    onChange={(e) => setNewStepName(e.target.value)}
                    placeholder="e.g., Jhalai, Dhol, Casting"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddStepDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateStep} disabled={isCreatingStep}>
                    {isCreatingStep ? 'Creating...' : 'Create Step'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {steps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No manufacturing steps configured yet.</p>
              <p className="text-sm">Add your first step to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {steps.map((step, index) => (
                <Card key={step.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline">{step.step_order}</Badge>
                        <span className="font-medium">{step.step_name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStep(step.id, step.step_name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm text-muted-foreground">
                      {fieldConfigs.filter(c => c.step_name === step.step_name && c.is_visible).length} 
                      /{masterFields.length} fields visible
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Field Configuration */}
      {steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Field Configuration</CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose which Zerify fields to show for each manufacturing step and configure their units
            </p>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedStep || steps[0]?.step_name} onValueChange={setSelectedStep}>
              <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 w-full">
                {steps.map((step) => (
                  <TabsTrigger key={step.id} value={step.step_name} className="text-xs">
                    {step.step_name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {steps.map((step) => (
                <TabsContent key={step.id} value={step.step_name} className="mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Fields for {step.step_name}</h3>
                      <Badge variant="outline">
                        {fieldConfigs.filter(c => c.step_name === step.step_name && c.is_visible).length} visible
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4">
                      {masterFields.map((field) => {
                        const currentUnit = getFieldUnit(step.step_name, field.field_key);
                        const isVisible = isFieldVisible(step.step_name, field.field_key);
                        
                        return (
                          <div key={field.field_key} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Label htmlFor={`${step.step_name}-${field.field_key}`} className="font-medium">
                                  {field.label}
                                  {currentUnit && (
                                    <span className="text-muted-foreground ml-1">({currentUnit})</span>
                                  )}
                                </Label>
                                <Badge variant="secondary" className="text-xs">
                                  {field.data_type}
                                </Badge>
                              </div>
                              {field.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {field.description}
                                </p>
                              )}
                              {shouldShowUnitSelector(field.data_type) && isVisible && (
                                <div className="mt-2">
                                  <Label className="text-xs text-muted-foreground">Unit</Label>
                                  <Select
                                    value={currentUnit || ''}
                                    onValueChange={(unit) => handleUnitChange(step.step_name, field.field_key, unit)}
                                  >
                                    <SelectTrigger className="w-[180px] h-8">
                                      <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {unitOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                            <Switch
                              id={`${step.step_name}-${field.field_key}`}
                              checked={isVisible}
                              onCheckedChange={(checked) => 
                                handleFieldVisibilityToggle(step.step_name, field.field_key, checked)
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManufacturingWorkflowConfig;
