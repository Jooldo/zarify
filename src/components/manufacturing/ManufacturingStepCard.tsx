
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Clock, User, Package } from 'lucide-react';

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

  const cardClassName = data.isJhalaiStep 
    ? "border-blue-500 bg-blue-50 shadow-lg min-w-[280px] cursor-pointer hover:shadow-xl transition-shadow" 
    : "border-border bg-card shadow-md min-w-[280px] cursor-pointer hover:shadow-lg transition-shadow";

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

        {/* Status and Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(data.status)}>
              {data.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground">{data.progress}%</span>
          </div>
          <Progress value={data.progress} className="h-2" />
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
          Add Step
        </Button>
      </CardContent>

      <Handle type="source" position={Position.Right} className="!bg-gray-400" />
    </Card>
  );
};

export default ManufacturingStepCard;
