
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, User, Package, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface ProductNodeData {
  productName: string;
  orderId: string;
  orderNumber: string;
  currentStep: string;
  assignedWorker?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'qc_failed' | 'blocked';
  progress: number;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  quantity: number;
}

export const ProductNode = ({ data }: { data: ProductNodeData }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'qc_failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'blocked': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const isOverdue = data.dueDate && new Date(data.dueDate) < new Date() && data.status !== 'completed';

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <Card className={`w-80 ${isOverdue ? 'border-red-300 shadow-red-100' : 'border-border'} hover:shadow-lg transition-shadow`}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-sm truncate">{data.productName}</h3>
              <p className="text-xs text-muted-foreground font-mono">{data.orderNumber}</p>
            </div>
            <div className="flex flex-col gap-1">
              <div className={`w-3 h-3 rounded-full ${getPriorityColor(data.priority)}`} />
              {isOverdue && <AlertTriangle className="w-4 h-4 text-red-500" />}
            </div>
          </div>

          {/* Current Step */}
          <div className="mb-3">
            <Badge className={`text-xs ${getStatusColor(data.status)}`}>
              {data.currentStep}
            </Badge>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{data.progress}%</span>
            </div>
            <Progress value={data.progress} className="h-2" />
          </div>

          {/* Details */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Package className="w-3 h-3 text-muted-foreground" />
              <span>Qty: {data.quantity}</span>
            </div>
            
            {data.assignedWorker && (
              <div className="flex items-center gap-2">
                <User className="w-3 h-3 text-muted-foreground" />
                <span className="truncate">{data.assignedWorker}</span>
              </div>
            )}
            
            {data.dueDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                  {format(new Date(data.dueDate), 'MMM dd')}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};
