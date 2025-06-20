
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Package, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface OrderItem {
  id: string;
  quantity: number;
  fulfilled_quantity: number;
  status: string;
  product_config_id: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  expected_delivery?: string;
  order_items: OrderItem[];
}

interface OrderCardProps {
  order: Order;
  productConfigId: string;
  onSelect: (orderId: string) => void;
  isSelected: boolean;
}

const OrderCard = ({ order, productConfigId, onSelect, isSelected }: OrderCardProps) => {
  // Calculate totals for the specific product
  const productItems = order.order_items.filter(item => item.product_config_id === productConfigId);
  const totalQuantity = productItems.reduce((sum, item) => sum + item.quantity, 0);
  const fulfilledQuantity = productItems.reduce((sum, item) => sum + item.fulfilled_quantity, 0);
  const pendingQuantity = totalQuantity - fulfilledQuantity;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created': return 'bg-blue-100 text-blue-800';
      case 'in progress': return 'bg-yellow-100 text-yellow-800';
      case 'partially fulfilled': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyIndicator = () => {
    if (order.expected_delivery) {
      const daysUntilDelivery = Math.ceil((new Date(order.expected_delivery).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilDelivery < 0) {
        return <Badge variant="destructive" className="text-xs"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>;
      } else if (daysUntilDelivery <= 3) {
        return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800"><Clock className="h-3 w-3 mr-1" />Urgent</Badge>;
      }
    }
    return null;
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
      onClick={() => onSelect(order.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{order.order_number}</CardTitle>
          <div className="flex items-center gap-2">
            {getUrgencyIndicator()}
            <Badge className={`text-xs ${getStatusColor(order.status)}`}>
              {order.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Created: {format(new Date(order.created_at), 'MMM dd, yyyy')}</span>
            </div>
            {order.expected_delivery && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Expected: {format(new Date(order.expected_delivery), 'MMM dd, yyyy')}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Package className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Total: </span>
              <span className="font-medium">{totalQuantity}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Fulfilled: </span>
              <span className="font-medium text-green-600">{fulfilledQuantity}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Pending: </span>
              <span className="font-medium text-orange-600">{pendingQuantity}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
