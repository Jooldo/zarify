
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Clock, User, Package, Settings } from 'lucide-react';

export interface RawMaterial {
  name: string;
  quantity: number;
  unit: string;
}

export interface StepCardData extends Record<string, unknown> {
  stepName: string;
  stepOrder: number;
  orderId: string;
  orderNumber: string;
  productName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  progress: number;
  assignedWorker?: string;
  estimatedDuration?: number;
  isJhalaiStep?: boolean;
  productCode?: string;
  category?: string;
  quantityRequired?: number;
  priority?: string;
  rawMaterials?: RawMaterial[];
}

interface ManufacturingStepCardProps {
  data: StepCardData;
  onAddStep?: (stepData: StepCardData) => void;
  onStepClick?: (stepData: StepCardData) => void;
}

const ManufacturingStepCard: React.FC<ManufacturingStepCardProps> = ({ 
  data, 
  onAddStep,
  onStepClick 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStepName = () => {
    if (data.stepName === 'Manufacturing Order' && data.status === 'pending') {
      return 'Move to Jhalai';
    }
    return 'Add Next Step';
  };

  const cardClassName = data.isJhalaiStep 
    ? "border-blue-500 bg-blue-50 shadow-lg min-w-[300px] cursor-pointer hover:shadow-xl transition-shadow" 
    : "border-border bg-card shadow-md min-w-[300px] cursor-pointer hover:shadow-lg transition-shadow";

  const handleAddStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddStep?.(data);
  };

  const handleCardClick = () => {
    onStepClick?.(data);
  };

  return (
    <Card className={cardClassName} onClick={handleCardClick}>
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-sm font-semibold ${data.isJhalaiStep ? 'text-blue-700' : 'text-foreground'}`}>
            {data.stepName}
            {data.isJhalaiStep && (
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 border-blue-300">
                Jhalai
              </Badge>
            )}
            {data.stepName === 'Manufacturing Order' && (
              <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700">
                Order
              </Badge>
            )}
          </CardTitle>
          {data.stepOrder > 0 && (
            <Badge variant="secondary" className="text-xs">
              Step {data.stepOrder}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Order Information */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Package className="h-3 w-3" />
          <span>{data.orderNumber} - {data.productName}</span>
        </div>

        {/* Product Code */}
        {data.productCode && (
          <div className="flex items-center gap-2 text-xs">
            <Settings className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Code:</span>
            <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
              {data.productCode}
            </span>
          </div>
        )}

        {/* Quantity and Priority for Manufacturing Orders */}
        {data.stepName === 'Manufacturing Order' && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {data.quantityRequired && (
              <div>
                <span className="text-muted-foreground">Qty:</span>
                <span className="font-medium ml-1">{data.quantityRequired}</span>
              </div>
            )}
            {data.priority && (
              <div>
                <span className="text-muted-foreground">Priority:</span>
                <span className={`font-medium ml-1 capitalize ${
                  data.priority === 'high' || data.priority === 'urgent' ? 'text-red-600' : 
                  data.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {data.priority}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Raw Materials Summary */}
        {data.rawMaterials && data.rawMaterials.length > 0 && (
          <div className="text-xs">
            <span className="text-muted-foreground">Materials:</span>
            <div className="mt-1 space-y-1">
              {data.rawMaterials.slice(0, 2).map((material, index) => (
                <div key={index} className="flex justify-between bg-gray-50 px-2 py-1 rounded text-xs">
                  <span className="truncate">{material.name}</span>
                  <span>{material.quantity}{material.unit}</span>
                </div>
              ))}
              {data.rawMaterials.length > 2 && (
                <div className="text-muted-foreground text-xs">
                  +{data.rawMaterials.length - 2} more materials
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status and Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(data.status)}>
              {data.status.replace('_', ' ').toUpperCase()}
            </Badge>
            {data.progress > 0 && (
              <span className="text-xs text-muted-foreground">{data.progress}%</span>
            )}
          </div>
          {data.progress > 0 && (
            <Progress value={data.progress} className="h-2" />
          )}
        </div>

        {/* Worker Assignment */}
        {data.assignedWorker && (
          <div className="flex items-center gap-2 text-xs">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Assigned to:</span>
            <span className="font-medium">{data.assignedWorker}</span>
          </div>
        )}

        {/* Duration */}
        {data.estimatedDuration && data.estimatedDuration > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{data.estimatedDuration}h estimated</span>
          </div>
        )}

        {/* Add Step Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className={`w-full mt-3 ${data.isJhalaiStep ? 'border-blue-300 hover:bg-blue-100' : ''}`}
          onClick={handleAddStep}
        >
          <Plus className="h-3 w-3 mr-1" />
          {getNextStepName()}
        </Button>
      </CardContent>

      <Handle type="source" position={Position.Right} className="!bg-gray-400" />
    </Card>
  );
};

export default ManufacturingStepCard;
