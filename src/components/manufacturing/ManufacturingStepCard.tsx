
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, Package, Calendar, Factory, CheckCircle } from 'lucide-react';
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
      case 'pending': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'blocked': return 'bg-red-50 text-red-700 border-red-200';
      case 'skipped': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'in_progress': return <Factory className="h-3 w-3" />;
      default: return <Package className="h-3 w-3" />;
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
      className={`relative ${!isOrderCard ? 'cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]' : ''}`}
      onClick={!isOrderCard ? handleClick : undefined}
    >
      <Card className={`w-72 shadow-lg border-0 overflow-hidden ${isOrderCard ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : 'bg-white'}`}>
        <CardHeader className={`pb-3 ${isOrderCard ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <CardTitle className={`text-sm font-semibold ${isOrderCard ? 'text-white' : 'text-gray-800'}`}>
              {data.stepName}
            </CardTitle>
            <Badge className={`text-xs border ${getStatusColor(data.status)} font-medium`}>
              <div className="flex items-center gap-1">
                {getStatusIcon(data.status)}
                {data.status.replace('_', ' ')}
              </div>
            </Badge>
          </div>
          {!isOrderCard && (
            <div className="text-xs text-gray-500 font-medium">
              Step {data.stepOrder}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="pt-3 space-y-3">
          {/* Order Information */}
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              <span className="font-semibold text-sm text-gray-800">{data.orderNumber}</span>
            </div>
            {data.productCode && (
              <div className="bg-white px-2 py-1 rounded border">
                <div className="text-xs text-gray-500">Product Code</div>
                <div className="font-mono font-semibold text-sm text-gray-800">{data.productCode}</div>
              </div>
            )}
            {data.quantityRequired && (
              <div className="text-xs text-gray-600">
                Quantity: <span className="font-semibold">{data.quantityRequired}</span>
              </div>
            )}
          </div>

          {/* Step-specific information */}
          {!isOrderCard && data.orderStepData && (
            <div className="space-y-3">
              {/* Worker and Due Date */}
              <div className="grid grid-cols-1 gap-2">
                {data.orderStepData.assigned_worker && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <User className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-medium text-blue-800">
                      {getWorkerName(data.orderStepData.assigned_worker) || 'Unknown Worker'}
                    </span>
                  </div>
                )}

                {data.orderStepData.due_date && (
                  <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                    <Calendar className="h-3 w-3 text-orange-600" />
                    <span className="text-xs font-medium text-orange-800">
                      Due: {format(new Date(data.orderStepData.due_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
              </div>

              {/* Timing Information */}
              {(data.orderStepData.started_at || data.orderStepData.completed_at) && (
                <div className="space-y-2">
                  {data.orderStepData.started_at && (
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3 text-green-600" />
                      <span className="text-green-700 font-medium">
                        Started: {format(new Date(data.orderStepData.started_at), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  )}

                  {data.orderStepData.completed_at && (
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle className="h-3 w-3 text-blue-600" />
                      <span className="text-blue-700 font-medium">
                        Completed: {format(new Date(data.orderStepData.completed_at), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Field Values */}
              <div className="grid grid-cols-2 gap-2">
                {data.orderStepData.quantity_assigned > 0 && (
                  <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                    <div className="text-xs text-blue-600 font-medium">Qty Assigned</div>
                    <div className="font-bold text-sm text-blue-800">{data.orderStepData.quantity_assigned}</div>
                  </div>
                )}
                
                {data.orderStepData.quantity_received > 0 && (
                  <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                    <div className="text-xs text-green-600 font-medium">Qty Received</div>
                    <div className="font-bold text-sm text-green-800">{data.orderStepData.quantity_received}</div>
                  </div>
                )}
                
                {data.orderStepData.weight_assigned > 0 && (
                  <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
                    <div className="text-xs text-purple-600 font-medium">Weight Assigned</div>
                    <div className="font-bold text-sm text-purple-800">{data.orderStepData.weight_assigned}g</div>
                  </div>
                )}
                
                {data.orderStepData.weight_received > 0 && (
                  <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                    <div className="text-xs text-indigo-600 font-medium">Weight Received</div>
                    <div className="font-bold text-sm text-indigo-800">{data.orderStepData.weight_received}g</div>
                  </div>
                )}
                
                {data.orderStepData.purity > 0 && (
                  <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                    <div className="text-xs text-yellow-600 font-medium">Purity</div>
                    <div className="font-bold text-sm text-yellow-800">{data.orderStepData.purity}%</div>
                  </div>
                )}
                
                {data.orderStepData.wastage > 0 && (
                  <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                    <div className="text-xs text-red-600 font-medium">Wastage</div>
                    <div className="font-bold text-sm text-red-800">{data.orderStepData.wastage}</div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {data.orderStepData.notes && (
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-xs text-gray-600 font-medium mb-1">Notes</div>
                  <div className="text-xs text-gray-800 leading-relaxed">{data.orderStepData.notes}</div>
                </div>
              )}
            </div>
          )}

          {/* Progress bar for non-order cards */}
          {!isOrderCard && (
            <div className="pt-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span className="font-semibold">{data.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${data.progress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* React Flow Handles */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-blue-500 border-2 border-white shadow-lg" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-blue-500 border-2 border-white shadow-lg"
      />
    </div>
  );
});

ManufacturingStepCard.displayName = 'ManufacturingStepCard';

export default ManufacturingStepCard;
