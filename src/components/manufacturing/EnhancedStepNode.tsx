
import React, { useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Clock, CheckCircle2, Weight, Hash, Type, GitBranch, ArrowRight, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { useManufacturingStepValues } from '@/hooks/useManufacturingStepValues';
import { useWorkers } from '@/hooks/useWorkers';

interface BranchInfo {
  id: string;
  type: 'progression' | 'rework' | 'qc';
  targetStepName: string;
  quantity?: number;
  label: string;
}

interface EnhancedStepNodeProps {
  data: {
    orderStep: any;
    stepFields: any[];
    order: any;
    branches: BranchInfo[];
    onViewDetails: () => void;
  };
}

const EnhancedStepNode: React.FC<EnhancedStepNodeProps> = ({ data }) => {
  const { orderStep, stepFields, order, branches = [], onViewDetails } = data;
  const { getStepValue } = useManufacturingStepValues();
  const { workers } = useWorkers();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'partially_completed': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'blocked': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Get configured field values for display - only required fields
  const getConfiguredFieldValues = () => {
    if (!stepFields || stepFields.length === 0) {
      return [];
    }
    
    const fieldValues = stepFields
      .filter(field => field.field_type !== 'worker' && field.is_required)
      .map(field => {
        let value = 'Not set';
        let displayValue = 'Not set';
        
        const savedValue = getStepValue(orderStep.id, field.field_id);
        
        if (savedValue !== null && savedValue !== undefined && savedValue !== '') {
          value = savedValue;
          displayValue = savedValue;
          
          if (field.field_options?.unit) {
            displayValue = `${value} ${field.field_options.unit}`;
          }
        }
        
        return {
          label: field.field_label,
          value: displayValue,
          type: field.field_type,
          isEmpty: value === 'Not set',
          fieldName: field.field_name
        };
      });
    
    return fieldValues;
  };

  // Get icon for field type
  const getFieldIcon = (fieldName: string, fieldType: string) => {
    if (fieldName.toLowerCase().includes('weight')) {
      return <Weight className="h-3 w-3 text-slate-400" />;
    }
    if (fieldName.toLowerCase().includes('quantity')) {
      return <Hash className="h-3 w-3 text-slate-400" />;
    }
    if (fieldType === 'date') {
      return <Calendar className="h-3 w-3 text-slate-400" />;
    }
    if (fieldType === 'number') {
      return <Hash className="h-3 w-3 text-slate-400" />;
    }
    return <Type className="h-3 w-3 text-slate-400" />;
  };

  // Get assigned worker name
  const getAssignedWorkerName = () => {
    if (stepFields) {
      const workerField = stepFields.find(field => field.field_type === 'worker');
      if (workerField) {
        const workerId = getStepValue(orderStep.id, workerField.field_id);
        if (workerId) {
          const worker = workers.find(w => w.id === workerId);
          if (worker) {
            return worker.name;
          }
        }
      }
    }
    
    if (orderStep.assigned_worker_id) {
      const worker = workers.find(w => w.id === orderStep.assigned_worker_id);
      if (worker) {
        return worker.name;
      }
    }
    
    if (orderStep.workers?.name) {
      return orderStep.workers.name;
    }
    
    return null;
  };

  const configuredFieldValues = getConfiguredFieldValues();
  const assignedWorkerName = getAssignedWorkerName();
  const isCompleted = orderStep.status === 'completed';
  const isPartiallyCompleted = orderStep.status === 'partially_completed';
  const hasBranches = branches.length > 0;

  // Enhanced handle positioning for parallel branching
  const getBranchHandles = useMemo(() => {
    if (!hasBranches) {
      return [{
        id: 'step-output-main',
        type: 'source' as const,
        position: Position.Right,
        style: { background: isCompleted ? '#10b981' : '#3b82f6', border: 'none', width: 8, height: 8 }
      }];
    }

    // Enhanced positioning for parallel branch handles
    return branches.map((branch, index) => {
      const isReworkBranch = branch.type === 'rework';
      const isProgressionBranch = branch.type === 'progression';
      
      // Enhanced vertical spacing for clear visual separation
      const totalBranches = branches.length;
      const spacing = 25; // Increased spacing between handles
      const startOffset = -(totalBranches - 1) * spacing / 2;
      const verticalOffset = startOffset + (index * spacing);
      
      // Enhanced color coding for branch types
      const handleColor = isReworkBranch ? '#3b82f6' : '#10b981'; // Blue for rework, Green for progression
      
      return {
        id: `step-output-${branch.id}`,
        type: 'source' as const,
        position: Position.Right,
        style: { 
          background: handleColor, 
          border: 'none', 
          width: 10, 
          height: 10,
          top: `calc(50% + ${verticalOffset}px)`,
          borderRadius: isReworkBranch ? '2px' : '50%' // Square for rework, circle for progression
        }
      };
    });
  }, [branches, isCompleted, hasBranches]);

  const getBranchIcon = (type: string) => {
    switch (type) {
      case 'rework': return <RotateCcw className="h-3 w-3" />;
      case 'qc': return <CheckCircle2 className="h-3 w-3" />;
      default: return <ArrowRight className="h-3 w-3" />;
    }
  };

  const getBranchTypeLabel = (type: string) => {
    switch (type) {
      case 'rework': return 'Rework Path';
      case 'progression': return 'Accepted Path';
      case 'qc': return 'QC Path';
      default: return 'Flow Path';
    }
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        id="step-details-input"
        style={{ background: isCompleted ? '#10b981' : '#3b82f6', border: 'none', width: 8, height: 8 }}
      />
      
      {/* Enhanced dynamic branch handles */}
      {getBranchHandles.map(handle => (
        <Handle
          key={handle.id}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          style={handle.style}
        />
      ))}
      
      <Card 
        className={`w-80 border-l-2 ${
          isPartiallyCompleted 
            ? 'border-l-orange-400 bg-gradient-to-r from-orange-50/30 to-white border-orange-100' 
            : isCompleted 
            ? 'border-l-emerald-400 bg-gradient-to-r from-emerald-50/30 to-white border-emerald-100' 
            : 'border-l-blue-400 bg-gradient-to-r from-blue-50/30 to-white border-blue-100'
        } hover:shadow-md transition-shadow cursor-pointer shadow-sm`} 
        onClick={onViewDetails}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
                {orderStep.manufacturing_steps?.step_name}
                {orderStep.manufacturing_steps?.qc_required && (
                  <Badge variant="secondary" className="bg-yellow-50 text-yellow-600 border-yellow-200 text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    QC
                  </Badge>
                )}
                {hasBranches && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-xs">
                    <GitBranch className="w-3 h-3 mr-1" />
                    {branches.length} Paths
                  </Badge>
                )}
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Step {orderStep.manufacturing_steps?.step_order}
              </p>
            </div>
            <Badge className={`text-xs border ${getStatusColor(orderStep.status)}`}>
              {orderStep.status === 'partially_completed' ? 'PARTIAL' : orderStep.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          
          {/* Progress */}
          {orderStep.progress_percentage > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="font-medium text-slate-600">Progress</span>
                <span className={`font-semibold ${
                  isPartiallyCompleted ? 'text-orange-600' : 
                  isCompleted ? 'text-emerald-600' : 'text-blue-600'
                }`}>
                  {orderStep.progress_percentage}%
                </span>
              </div>
              <div className={`w-full rounded-full h-2 ${
                isPartiallyCompleted ? 'bg-orange-100' : 
                isCompleted ? 'bg-emerald-100' : 'bg-blue-100'
              }`}>
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isPartiallyCompleted ? 'bg-orange-400' : 
                    isCompleted ? 'bg-emerald-400' : 'bg-blue-400'
                  }`}
                  style={{ width: `${orderStep.progress_percentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Worker Assignment */}
          {assignedWorkerName && (
            <div className={`flex items-center gap-2 text-xs p-2 rounded-md border ${
              isPartiallyCompleted ? 'bg-orange-50 border-orange-100' : 
              isCompleted ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'
            }`}>
              <User className={`h-3 w-3 ${
                isPartiallyCompleted ? 'text-orange-500' : 
                isCompleted ? 'text-emerald-500' : 'text-blue-500'
              }`} />
              <span className="text-slate-600">Assigned to:</span>
              <span className={`font-medium ${
                isPartiallyCompleted ? 'text-orange-700' : 
                isCompleted ? 'text-emerald-700' : 'text-blue-700'
              }`}>
                {assignedWorkerName}
              </span>
            </div>
          )}

          {/* Configured Field Values */}
          {configuredFieldValues.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-600">Field Values:</div>
              {configuredFieldValues.map((field, index) => (
                <div key={index} className={`flex items-center gap-2 text-xs bg-white p-2 rounded-md border ${
                  isPartiallyCompleted ? 'border-orange-100' : 
                  isCompleted ? 'border-emerald-100' : 'border-blue-100'
                }`}>
                  {getFieldIcon(field.fieldName, field.type)}
                  <span className="font-medium text-slate-600">{field.label}:</span>
                  <span className={`font-medium flex-1 ${
                    field.isEmpty ? 'text-slate-400 italic' : 'text-slate-700'
                  }`}>
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Enhanced Branch Information */}
          {hasBranches && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-xs font-medium text-slate-600 flex items-center gap-2">
                <GitBranch className="h-3 w-3" />
                Parallel Branches:
              </div>
              {branches.map((branch, index) => {
                const isReworkBranch = branch.type === 'rework';
                const isProgressionBranch = branch.type === 'progression';
                
                return (
                  <div key={index} className={`flex items-center gap-2 text-xs p-2 rounded-md border ${
                    isReworkBranch 
                      ? 'bg-blue-50 border-blue-100' 
                      : 'bg-emerald-50 border-emerald-100'
                  }`}>
                    {getBranchIcon(branch.type)}
                    <span className={`font-medium ${
                      isReworkBranch ? 'text-blue-600' : 'text-emerald-600'
                    }`}>
                      {getBranchTypeLabel(branch.type)}:
                    </span>
                    <span className="text-slate-700 flex-1">{branch.targetStepName}</span>
                    {branch.quantity && (
                      <Badge variant="outline" className={`text-xs ${
                        isReworkBranch 
                          ? 'bg-blue-50 text-blue-600 border-blue-200' 
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}>
                        Qty: {branch.quantity}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Timestamps */}
          <div className={`space-y-1 text-xs border-t pt-2 text-slate-500 ${
            isPartiallyCompleted ? 'border-orange-100' : 
            isCompleted ? 'border-emerald-100' : 'border-blue-100'
          }`}>
            {orderStep.started_at && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Started: {format(new Date(orderStep.started_at), 'MMM dd, HH:mm')}</span>
              </div>
            )}
            {orderStep.completed_at && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>Completed: {format(new Date(orderStep.completed_at), 'MMM dd, HH:mm')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default EnhancedStepNode;
