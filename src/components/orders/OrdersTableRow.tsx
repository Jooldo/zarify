
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TableCell, TableRow } from '@/components/ui/table';
import { Edit, Eye, Clock, CheckCircle, Package, Truck } from 'lucide-react';
import OrderDetails from '@/components/OrderDetails';
import EditOrderDialog from './EditOrderDialog';

interface OrdersTableRowProps {
  item: {
    id: string;
    orderId: string;
    customer: string;
    productCode: string;
    category: string;
    subcategory: string;
    size: string;
    quantity: number;
    status: string;
    price: number;
    totalOrderAmount: number;
    createdDate: string;
    updatedDate: string;
    expectedDelivery: string;
    suborder_id: string;
  };
  orders: any[];
  getOverallOrderStatus: (orderId: string) => string;
  getStatusVariant: (status: string) => "secondary" | "default" | "outline";
  getStockAvailable: (productCode: string) => number;
  onOrderUpdate: () => void;
  onFinishedGoodsUpdate?: () => void;
}

const OrdersTableRow = ({ item, orders, getOverallOrderStatus, getStatusVariant, getStockAvailable, onOrderUpdate, onFinishedGoodsUpdate }: OrdersTableRowProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const stockAvailable = getStockAvailable(item.productCode);
  const isStockLow = stockAvailable < item.quantity;

  // Find the correct order by order_number instead of id
  const order = orders.find(o => o.order_number === item.orderId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Created':
        return <Clock className="h-3 w-3" />;
      case 'In Progress':
        return <Package className="h-3 w-3" />;
      case 'Ready':
        return <CheckCircle className="h-3 w-3" />;
      case 'Delivered':
        return <Truck className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Created':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'Ready':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'Delivered':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const StatusBadge = ({ status }: { status: string }) => (
    <Badge className={`text-xs px-2 py-1 flex items-center gap-1 ${getStatusColor(status)}`}>
      {getStatusIcon(status)}
      {status}
    </Badge>
  );

  return (
    <>
      <TableRow className="h-10 hover:bg-gray-50">
        <TableCell className="py-1 px-2 text-xs font-medium">{item.orderId}</TableCell>
        <TableCell className="py-1 px-2 text-xs text-blue-600 font-medium">{item.suborder_id}</TableCell>
        <TableCell className="py-1 px-2 text-xs">{item.customer}</TableCell>
        <TableCell className="py-1 px-2 text-xs">{item.category}</TableCell>
        <TableCell className="py-1 px-2 text-xs">{item.subcategory}</TableCell>
        <TableCell className="py-1 px-2 text-xs">{item.size}</TableCell>
        <TableCell className="py-1 px-2 text-xs">{item.quantity}</TableCell>
        <TableCell className="py-1 px-2 text-xs">
          <span className={isStockLow ? "text-red-600 font-medium" : "text-green-600"}>
            {stockAvailable}
          </span>
        </TableCell>
        <TableCell className="py-1 px-2">
          <StatusBadge status={item.status} />
        </TableCell>
        <TableCell className="py-1 px-2">
          <StatusBadge status={getOverallOrderStatus(item.orderId)} />
        </TableCell>
        <TableCell className="py-1 px-2 text-xs">{new Date(item.createdDate).toLocaleDateString('en-IN')}</TableCell>
        <TableCell className="py-1 px-2 text-xs">{new Date(item.updatedDate).toLocaleDateString('en-IN')}</TableCell>
        <TableCell className="py-1 px-2">
          <div className="flex gap-1">
            {order && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                    <Eye className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-sm">Order Details</DialogTitle>
                  </DialogHeader>
                  <OrderDetails 
                    order={order} 
                    onOrderUpdate={onOrderUpdate}
                  />
                </DialogContent>
              </Dialog>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {order && (
        <EditOrderDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          order={order}
          onOrderUpdate={onOrderUpdate}
        />
      )}
    </>
  );
};

export default OrdersTableRow;
