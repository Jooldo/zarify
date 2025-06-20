
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface SubOrderItemProps {
  item: {
    id: string;
    suborder_id: string;
    quantity: number;
    fulfilled_quantity: number;
    status: string;
    product_configs: {
      product_code: string;
    };
  };
  onSelect: (itemId: string) => void;
  isSelected: boolean;
}

const SubOrderItem = ({ item, onSelect, isSelected }: SubOrderItemProps) => {
  const pendingQuantity = item.quantity - item.fulfilled_quantity;
  const isFullyFulfilled = item.fulfilled_quantity >= item.quantity;
  const completionPercentage = Math.round((item.fulfilled_quantity / item.quantity) * 100);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created': return 'bg-blue-100 text-blue-800';
      case 'in progress': return 'bg-yellow-100 text-yellow-800';
      case 'partially fulfilled': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    if (isFullyFulfilled) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (item.fulfilled_quantity > 0) {
      return <Clock className="h-4 w-4 text-orange-600" />;
    } else {
      return <Package className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-sm ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      } ${isFullyFulfilled ? 'opacity-75' : ''}`}
      onClick={() => !isFullyFulfilled && onSelect(item.id)}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium text-sm">{item.suborder_id}</span>
          </div>
          <Badge className={`text-xs ${getStatusColor(item.status)}`}>
            {item.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <div className="text-muted-foreground">Product</div>
            <div className="font-medium">{item.product_configs.product_code}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Progress</div>
            <div className="font-medium">{completionPercentage}% complete</div>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">Ordered: <span className="font-medium text-gray-900">{item.quantity}</span></span>
              <span className="text-muted-foreground">Fulfilled: <span className="font-medium text-green-600">{item.fulfilled_quantity}</span></span>
            </div>
            <div className="flex items-center gap-1">
              {pendingQuantity > 0 ? (
                <>
                  <span className="text-muted-foreground">Need:</span>
                  <span className="font-medium text-orange-600">{pendingQuantity}</span>
                </>
              ) : (
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Complete
                </span>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isFullyFulfilled ? 'bg-green-500' : 'bg-orange-500'
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {isFullyFulfilled && (
          <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            This item is fully fulfilled
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubOrderItem;
