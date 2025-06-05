
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TableCell, TableRow } from '@/components/ui/table';
import { Edit, Eye } from 'lucide-react';
import OrderDetails from '@/components/OrderDetails';

interface OrdersTableRowProps {
  item: {
    id: string;
    orderId: string;
    customer: string;
    productCode: string;
    quantity: number;
    status: string;
    price: number;
    totalOrderAmount: number;
    createdDate: string;
    updatedDate: string;
    expectedDelivery: string;
  };
  orders: any[];
  getOverallOrderStatus: (orderId: string) => string;
  getStatusVariant: (status: string) => "secondary" | "default" | "outline";
  getStockAvailable: (productCode: string) => number;
  onOrderUpdate: () => void;
}

const OrdersTableRow = ({ item, orders, getOverallOrderStatus, getStatusVariant, getStockAvailable, onOrderUpdate }: OrdersTableRowProps) => {
  const stockAvailable = getStockAvailable(item.productCode);
  const isStockLow = stockAvailable < item.quantity;

  // Find the correct order by order_number instead of id
  const order = orders.find(o => o.order_number === item.orderId);

  return (
    <TableRow className="h-10 hover:bg-gray-50">
      <TableCell className="py-1 px-2 text-xs font-medium">{item.orderId}</TableCell>
      <TableCell className="py-1 px-2 text-xs text-blue-600 font-medium">{item.id}</TableCell>
      <TableCell className="py-1 px-2 text-xs">{item.customer}</TableCell>
      <TableCell className="py-1 px-2 text-xs font-mono bg-gray-50">{item.productCode}</TableCell>
      <TableCell className="py-1 px-2 text-xs">{item.quantity}</TableCell>
      <TableCell className="py-1 px-2 text-xs">
        <span className={isStockLow ? "text-red-600 font-medium" : "text-green-600"}>
          {stockAvailable}
        </span>
      </TableCell>
      <TableCell className="py-1 px-2">
        <Badge variant={getStatusVariant(item.status)} className="text-xs px-1 py-0">
          {item.status}
        </Badge>
      </TableCell>
      <TableCell className="py-1 px-2">
        <Badge variant={getStatusVariant(getOverallOrderStatus(item.orderId))} className="text-xs px-1 py-0">
          {getOverallOrderStatus(item.orderId)}
        </Badge>
      </TableCell>
      <TableCell className="py-1 px-2 text-xs font-medium">₹{item.price.toLocaleString()}</TableCell>
      <TableCell className="py-1 px-2 text-xs font-medium">₹{item.totalOrderAmount.toLocaleString()}</TableCell>
      <TableCell className="py-1 px-2 text-xs">{new Date(item.createdDate).toLocaleDateString('en-IN')}</TableCell>
      <TableCell className="py-1 px-2 text-xs">{new Date(item.updatedDate).toLocaleDateString('en-IN')}</TableCell>
      <TableCell className="py-1 px-2 text-xs">{new Date(item.expectedDelivery).toLocaleDateString('en-IN')}</TableCell>
      <TableCell className="py-1 px-2">
        <div className="flex gap-1">
          {order && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                  <Eye className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Order Details</DialogTitle>
                </DialogHeader>
                <OrderDetails order={order} onOrderUpdate={onOrderUpdate} />
              </DialogContent>
            </Dialog>
          )}
          <Button variant="outline" size="sm" className="h-6 w-6 p-0">
            <Edit className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default OrdersTableRow;
