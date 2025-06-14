import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { getPriorityColor, getStatusColor } from '@/utils/manufacturingColors';
import { ManufacturingOrder } from '@/types/manufacturing';

interface ManufacturingOrderCardProps {
  order: ManufacturingOrder;
  onViewDetails: (order: ManufacturingOrder) => void;
}

const ManufacturingOrderCard: React.FC<ManufacturingOrderCardProps> = ({ order, onViewDetails }) => {
  return (
    <Card
      className="shadow-md hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.01] cursor-pointer"
      onClick={() => onViewDetails(order)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-foreground">{order.product_name}</h2>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
            {order.priority}
          </span>
        </div>
        <div className="mb-2">
          <p className="text-sm text-muted-foreground">Order Number: {order.order_number}</p>
          <p className="text-sm text-muted-foreground">Quantity: {order.quantity_required}</p>
          {order.due_date && (
            <p className="text-sm text-muted-foreground">Due Date: {order.due_date}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
          {order.special_instructions && (
            <span className="text-xs text-muted-foreground" title={order.special_instructions}>
              Has Instructions
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ManufacturingOrderCard;
