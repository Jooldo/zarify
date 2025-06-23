import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, Package, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useWorkers } from '@/hooks/useWorkers';

export interface StepCardData {
  stepName: string;
  stepOrder: number;
  orderId: string;
  orderNumber: string;
  productName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped';
  progress: number;
  assignedWorker?: string;
  productCode?: string;
  quantityRequired?: number;
  priority?: string;
  dueDate?: string;
  isJhalaiStep: boolean;
  manufacturingSteps?: any[];
  orderSteps?: any[];
  onAddStep?: (stepData: StepCardData) => void;
  onStepClick?: (stepData: StepCardData) => void;
  orderStepData?: any; // The actual step data from manufacturing_order_step_data
  rawMaterials?: any[]; // Add this property
  [key: string]: any; // Add index signature for compatibility
}

const ManufacturingStepCard: React.FC<{ data: StepCardData }> = memo(({ data }) => {
  const { workers } = useWorkers();
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'skipped': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkerName = (workerId: string | null) => {
    if (!workerId) return null;
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : null;
  };

  const handleClick = () => {
    console.log('Card clicked:', data);
    if (data.onStepClick) {
      data.onStepClick(data);
    }
  };

  const isOrderCard = data.stepName === 'Manufacturing Order';
  
  return (
    <div 
      className={`relative ${!isOrderCard ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={!isOrderCard ? handleClick : undefined}
    >
      <Card className="w-64 shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{data.stepName}</CardTitle>
            <Badge className={`text-xs ${getStatusColor(data.status)}`}>
              {data.status.replace('_', ' ')}
            </Badge>
          </div>
          {!isOrderCard && (
            <div className="text-xs text-muted-foreground">
              Step {data.stepOrder}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="pt-0 space-y-2">
          {/* Order Information */}
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-1">
              <Package className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{data.orderNumber}</span>
            </div>
            <div className="text-muted-foreground">{data.productName}</div>
            {data.productCode && (
              <div className="text-muted-foreground font-mono">{data.productCode}</div>
            )}
          </div>

          {/* Step-specific information */}
          {!isOrderCard && data.orderStepData && (
            <div className="space-y-2 text-xs border-t pt-2">
              {/* Assigned Worker */}
              {data.orderStepData.assigned_worker && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span>{getWorkerName(data.orderStepData.assigned_worker) || 'Unknown Worker'}</span>
                </div>
              )}

              {/* Due Date */}
              {data.orderStepData.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span>{format(new Date(data.orderStepData.due_date), 'MMM dd, yyyy')}</span>
                </div>
              )}

              {/* Started/Completed Times */}
              {data.orderStepData.started_at && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">Started: {format(new Date(data.orderStepData.started_at), 'MMM dd, HH:mm')}</span>
                </div>
              )}

              {data.orderStepData.completed_at && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-blue-600" />
                  <span className="text-blue-600">Completed: {format(new Date(data.orderStepData.completed_at), 'MMM dd, HH:mm')}</span>
                </div>
              )}

              {/* Field Values */}
              <div className="grid grid-cols-2 gap-1">
                {data.orderStepData.quantity_assigned > 0 && (
                  <div className="bg-blue-50 p-1 rounded text-xs">
                    <div className="text-muted-foreground">Qty Assigned:</div>
                    <div className="font-medium">{data.orderStepData.quantity_assigned}</div>
                  </div>
                )}
                
                {data.orderStepData.quantity_received > 0 && (
                  <div className="bg-green-50 p-1 rounded text-xs">
                    <div className="text-muted-foreground">Qty Received:</div>
                    <div className="font-medium">{data.orderStepData.quantity_received}</div>
                  </div>
                )}
                
                {data.orderStepData.weight_assigned > 0 && (
                  <div className="bg-blue-50 p-1 rounded text-xs">
                    <div className="text-muted-foreground">Weight Assigned:</div>
                    <div className="font-medium">{data.orderStepData.weight_assigned}g</div>
                  </div>
                )}
                
                {data.orderStepData.weight_received > 0 && (
                  <div className="bg-green-50 p-1 rounded text-xs">
                    <div className="text-muted-foreground">Weight Received:</div>
                    <div className="font-medium">{data.orderStepData.weight_received}g</div>
                  </div>
                )}
                
                {data.orderStepData.purity > 0 && (
                  <div className="bg-gray-50 p-1 rounded text-xs">
                    <div className="text-muted-foreground">Purity:</div>
                    <div className="font-medium">{data.orderStepData.purity}%</div>
                  </div>
                )}
                
                {data.orderStepData.wastage > 0 && (
                  <div className="bg-red-50 p-1 rounded text-xs">
                    <div className="text-muted-foreground">Wastage:</div>
                    <div className="font-medium">{data.orderStepData.wastage}</div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {data.orderStepData.notes && (
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <div className="text-muted-foreground mb-1">Notes:</div>
                  <div>{data.orderStepData.notes}</div>
                </div>
              )}
            </div>
          )}

          {/* Progress bar for non-order cards */}
          {!isOrderCard && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${data.progress}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* React Flow Handles */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-gray-400 border-2 border-white" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
    </div>
  );
});

ManufacturingStepCard.displayName = 'ManufacturingStepCard';

export default ManufacturingStepCard;
