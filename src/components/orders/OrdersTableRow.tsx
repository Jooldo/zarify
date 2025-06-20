
import { useState } from 'react';
import { format } from 'date-fns';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, CheckCircle } from 'lucide-react';
import { Order } from '@/hooks/useOrders';
import { FinishedGood } from '@/hooks/useFinishedGoods';
import SuborderDetailsDialog from './SuborderDetailsDialog';
import EditOrderDialog from './EditOrderDialog';

interface OrdersTableRowProps {
  item: any;
  orders: Order[];
  finishedGoods: FinishedGood[];
  getOverallOrderStatus: (orderId: string) => string;
  getStatusVariant: (status: string) => "secondary" | "default" | "outline";
  getStockAvailable: (productCode: string) => number;
  onOrderUpdate: () => void;
  onFinishedGoodsUpdate?: () => void;
}

const OrdersTableRow = ({ 
  item, 
  orders,
  finishedGoods,
  getOverallOrderStatus, 
  getStatusVariant, 
  getStockAvailable, 
  onOrderUpdate,
  onFinishedGoodsUpdate 
}: OrdersTableRowProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleViewDetails = () => {
    setIsDetailsOpen(true);
  };

  const handleEditOrder = () => {
    setIsEditOpen(true);
  };

  const handleMarkReady = async () => {
    // Implementation for marking order as ready
    console.log('Mark as ready:', item.id);
  };

  const stockAvailable = getStockAvailable(item.productCode);
  const isStockSufficient = stockAvailable >= item.quantity;

  // Find the parent order for this suborder
  const parentOrder = orders.find(o => o.order_number === item.orderId);

  return (
    <>
      <TableRow className="h-16 border-b border-gray-100 hover:bg-gray-50/50">
        <TableCell className="py-4 px-4 font-mono text-sm">
          {item.orderId}
        </TableCell>
        <TableCell className="py-4 px-4 font-mono text-sm">
          {item.suborder_id}
        </TableCell>
        <TableCell className="py-4 px-4">
          <div className="flex flex-col">
            <span className="font-medium text-sm text-gray-900">{item.customer}</span>
          </div>
        </TableCell>
        <TableCell className="py-4 px-4 font-mono text-sm">
          {item.productCode}
        </TableCell>
        <TableCell className="py-4 px-4 text-center">
          <span className="text-sm font-semibold text-blue-600">
            {item.quantity}
          </span>
        </TableCell>
        <TableCell className="py-4 px-4">
          <span className="text-sm text-gray-600">
            {item.fulfillment_method || 'Standard'}
          </span>
        </TableCell>
        <TableCell className="py-4 px-4 text-sm text-gray-600">
          {format(new Date(item.createdDate), 'MMM dd')}
        </TableCell>
        <TableCell className="py-4 px-4 text-center">
          <span className={`text-sm font-medium ${isStockSufficient ? 'text-green-600' : 'text-red-600'}`}>
            {stockAvailable}
          </span>
        </TableCell>
        <TableCell className="py-4 px-4">
          <Badge variant={getStatusVariant(item.status)} className="text-xs">
            {item.status}
          </Badge>
        </TableCell>
        <TableCell className="py-4 px-4">
          <Badge variant={getStatusVariant(getOverallOrderStatus(item.orderId))} className="text-xs">
            {getOverallOrderStatus(item.orderId)}
          </Badge>
        </TableCell>
        <TableCell className="py-4 px-4 text-sm text-gray-600">
          {item.expectedDelivery ? format(new Date(item.expectedDelivery), 'MMM dd') : 'N/A'}
        </TableCell>
        <TableCell className="py-4 px-4">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-full border-gray-300 hover:bg-gray-50"
              onClick={handleViewDetails}
            >
              <Eye className="h-3.5 w-3.5 text-gray-600" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-full border-gray-300 hover:bg-gray-50"
              onClick={handleEditOrder}
            >
              <Edit className="h-3.5 w-3.5 text-gray-600" />
            </Button>
            {item.status !== 'Ready' && item.status !== 'Delivered' && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full border-gray-300 hover:bg-gray-50"
                onClick={handleMarkReady}
                disabled={!isStockSufficient}
              >
                <CheckCircle className="h-3.5 w-3.5 text-gray-600" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      {parentOrder && (
        <SuborderDetailsDialog
          suborderItem={item}
          parentOrder={parentOrder}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
        />
      )}

      <EditOrderDialog
        order={orders.find(o => o.order_number === item.orderId)}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onOrderUpdate={onOrderUpdate}
      />
    </>
  );
};

export default OrdersTableRow;
