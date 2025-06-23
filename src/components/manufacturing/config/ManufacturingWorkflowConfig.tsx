import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Settings, Workflow } from 'lucide-react';
import { useMerchantStepConfig, CreateStepData, FieldConfigUpdate } from '@/hooks/useMerchantStepConfig';
import { useMasterFields } from '@/hooks/useMasterFields';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMerchant } from '@/hooks/useMerchant';

const ManufacturingWorkflowConfig = () => {
  const { steps, fieldConfigs, isLoading, createStep, deleteStep, isCreatingStep, isDeletingStep } = useMerchantStepConfig();
  const { masterFields } = useMasterFields();
  const { merchant } = useMerchant();
  const { toast } = useToast();
  
  const [newStepName, setNewStepName] = useState('');
  const [fieldVisibility, setFieldVisibility] = useState<Record<string, Record<string, boolean>>>({});
  const [fieldUnits, setFieldUnits] = useState<Record<string, Record<string, string>>>({});
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());

  // Initialize field visibility and units from existing configs
  useEffect(() => {
    const visibility: Record<string, Record<string, boolean>> = {};
    const units: Record<string, Record<string, string>> = {};
    
    steps.forEach(step => {
      visibility[step.step_name] = {};
      units[step.step_name] = {};
      
      masterFields.forEach(field => {
        const config = fieldConfigs.find(
          c => c.step_name === step.step_name && c.field_key === field.field_key
        );
        visibility[step.step_name][field.field_key] = config?.is_visible || false;
        units[step.step_name][field.field_key] = config?.unit || '';
      });
    });
    
    setFieldVisibility(visibility);
    setFieldUnits(units);
  }, [steps, fieldConfigs, masterFields]);

  const upsertFieldConfig = useCallback(async (stepName: string, fieldKey: string, isVisible: boolean, unit?: string) => {
    if (!merchant?.id) return;

    const updateKey = `${stepName}-${fieldKey}`;
    setPendingUpdates(prev => new Set(prev).add(updateKey));

    try {
      const { error } = await supabase
        .from('merchant_step_field_config')
        .upsert({
          merchant_id: merchant.id,
          step_name: stepName,
          field_key: fieldKey,
          is_visible: isVisible,
          unit: unit || null,
        }, {
          onConflict: 'merchant_id,step_name,field_key'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating field config:', error);
      toast({
        title: 'Error',
        description: 'Failed to update field configuration',
        variant: 'destructive',
      });
    } finally {
      setPendingUpdates(prev => {
        const newSet = new Set(prev);
        newSet.delete(updateKey);
        return newSet;
      });
    }
  }, [merchant?.id, toast]);

  const handleFieldVisibilityChange = useCallback((stepName: string, fieldKey: string, isVisible: boolean) => {
    setFieldVisibility(prev => ({
      ...prev,
      [stepName]: {
        ...prev[stepName],
        [fieldKey]: isVisible
      }
    }));

    const unit = fieldUnits[stepName]?.[fieldKey] || '';
    upsertFieldConfig(stepName, fieldKey, isVisible, unit);
  }, [fieldUnits, upsertFieldConfig]);

  const handleFieldUnitChange = useCallback((stepName: string, fieldKey: string, unit: string) => {
    setFieldUnits(prev => ({
      ...prev,
      [stepName]: {
        ...prev[stepName],
        [fieldKey]: unit
      }
    }));

    const isVisible = fieldVisibility[stepName]?.[fieldKey] || false;
    upsertFieldConfig(stepName, fieldKey, isVisible, unit);
  }, [fieldVisibility, upsertFieldConfig]);

  const handleCreateStep = async () => {
    if (!newStepName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a step name',
        variant: 'destructive',
      });
      return;
    }

    const stepData: CreateStepData = {
      step_name: newStepName.trim(),
      step_order: steps.length + 1,
    };

    await createStep(stepData);
    setNewStepName('');
  };

  const handleDeleteStep = async (stepId: string) => {
    await deleteStep(stepId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const isPendingUpdate = (stepName: string, fieldKey: string) => {
    return pendingUpdates.has(`${stepName}-${fieldKey}`);
  };

  return (
    <div className="space-y-6">
      {/* Create New Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Manufacturing Step
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter step name (e.g., Cutting, Assembly, Quality Check)"
                value={newStepName}
                onChange={(e) => setNewStepName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateStep()}
              />
            </div>
            <Button 
              onClick={handleCreateStep}
              disabled={isCreatingStep || !newStepName.trim()}
            >
              {isCreatingStep ? 'Adding...' : 'Add Step'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Steps Configuration */}
      <div className="grid gap-6">
        {steps.map((step) => (
          <Card key={step.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  {step.step_name}
                  <Badge variant="outline" className="ml-2">
                    Order: {step.step_order}
                  </Badge>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteStep(step.id)}
                  disabled={isDeletingStep}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Field Configuration</span>
                </div>
                <div className="grid gap-4">
                  {masterFields.map((field) => {
                    const isVisible = fieldVisibility[step.step_name]?.[field.field_key] || false;
                    const unit = fieldUnits[step.step_name]?.[field.field_key] || '';
                    const isPending = isPendingUpdate(step.step_name, field.field_key);
                    
                    return (
                      <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/50 relative">
                        {isPending && (
                          <div className="absolute top-1 right-1">
                            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={isVisible}
                              onCheckedChange={(checked) => 
                                handleFieldVisibilityChange(step.step_name, field.field_key, checked)
                              }
                              disabled={isPending}
                            />
                            <div>
                              <Label className="text-sm font-medium">
                                {field.label}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                {field.description}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {isVisible && (
                          <div className="flex items-center gap-2 ml-4">
                            <Label className="text-xs text-muted-foreground">Unit:</Label>
                            <Input
                              className="w-20 h-8 text-xs"
                              placeholder="Unit"
                              value={unit}
                              onChange={(e) => 
                                handleFieldUnitChange(step.step_name, field.field_key, e.target.value)
                              }
                              disabled={isPending}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {steps.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Manufacturing Steps</h3>
            <p className="text-gray-500 mb-4">
              Create your first manufacturing step to start configuring your workflow.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManufacturingWorkflowConfig;
