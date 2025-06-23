
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Package, AlertTriangle, CheckCircle2, Clock, User, Factory, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ManufacturingOrder } from '@/types/manufacturingOrders';
import { useManufacturingSteps } from '@/hooks/useManufacturingSteps';
import ManufacturingOrderDetailsDialog from './ManufacturingOrderDetailsDialog';

interface ManufacturingOrderCardProps {
  order: ManufacturingOrder;
  onStatusUpdate?: (orderId: string, status: ManufacturingOrder['status']) => void;
  onDelete?: (orderId: string) => void;
}

const ManufacturingOrderCard: React.FC<ManufacturingOrderCardProps> = ({
  order,
  onStatusUpdate,
  onDelete
}) => {
  const { orderSteps } = useManufacturingSteps();
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Get order steps for this specific order using order_id
  const thisOrderSteps = Array.isArray(orderSteps) 
    ? orderSteps.filter(step => step.order_id === order.id)
    : [];

  // Calculate progress
  const completedSteps = thisOrderSteps.filter(step => step.status === 'completed').length;
  const totalSteps = thisOrderSteps.length;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Get current step (latest created step that's in progress)
  const currentStep = thisOrderSteps
    .filter(step => step.status === 'in_progress')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'in_progress': return <Factory className="h-4 w-4" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Card 
        className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg overflow-hidden bg-gradient-to-br from-white to-gray-50 hover:scale-[1.02]"
        onClick={() => setDetailsOpen(true)}
      >
        <CardHeader className="pb-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-lg font-bold text-white">
                {order.product_configs?.product_code || 'No Product Code'}
              </CardTitle>
              <p className="text-sm text-blue-100 font-mono bg-blue-600/20 px-2 py-1 rounded">
                {order.order_number}
              </p>
            </div>
            <div className="flex gap-2 flex-col items-end">
              <Badge className={`text-xs border font-semibold ${getPriorityColor(order.priority)}`}>
                {order.priority}
              </Badge>
              <Badge className={`text-xs border font-semibold ${getStatusColor(order.status)}`}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(order.status)}
                  {order.status.replace('_', ' ')}
                </div>
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          {/* Progress Section */}
          {totalSteps > 0 && (
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Manufacturing Progress</span>
                <span className="font-bold text-lg text-blue-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span className="font-medium">{completedSteps} of {totalSteps} steps completed</span>
                {currentStep && (
                  <span className="font-semibold text-blue-600">Current: {currentStep.step_name}</span>
                )}
              </div>
            </div>
          )}

          {/* Order Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-blue-600 font-medium">Quantity</span>
              </div>
              <p className="font-bold text-lg text-blue-800">{order.quantity_required}</p>
            </div>

            {order.due_date && (
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span className="text-xs text-orange-600 font-medium">Due Date</span>
                </div>
                <p className="font-bold text-sm text-orange-800">
                  {format(new Date(order.due_date), 'MMM dd, yyyy')}
                </p>
              </div>
            )}
          </div>

          {/* Product Name */}
          {order.product_name && (
            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="text-xs text-gray-600 font-medium mb-1">Product Name</div>
              <div className="font-semibold text-gray-800">{order.product_name}</div>
            </div>
          )}

          {/* Special Instructions */}
          {order.special_instructions && (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-700 mb-1">Special Instructions</p>
                  <p className="text-sm text-amber-800 leading-relaxed">{order.special_instructions}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                setDetailsOpen(true);
              }}
              className="w-full bg-white hover:bg-blue-50 border-blue-200 text-blue-700 font-semibold hover:border-blue-300 transition-all duration-200"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      <ManufacturingOrderDetailsDialog
        order={order}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        getPriorityColor={getPriorityColor}
        getStatusColor={getStatusColor}
        onStatusUpdate={onStatusUpdate}
      />
    </>
  );
};

export default ManufacturingOrderCard;
