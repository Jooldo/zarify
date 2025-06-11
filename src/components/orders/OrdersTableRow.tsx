import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TableCell, TableRow } from '@/components/ui/table';
import { Edit, Eye, Clock, CheckCircle, Package, Truck, Receipt, FileText } from 'lucide-react';
import OrderDetails from '@/components/OrderDetails';
import EditOrderDialog from './EditOrderDialog';
import CreateInvoiceDialog from './CreateInvoiceDialog';
import ViewInvoiceDialog from './ViewInvoiceDialog';
import ProductDetailsPopover from '@/components/ui/ProductDetailsPopover';
import { useInvoices } from '@/hooks/useInvoices';

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
  const [isCreateInvoiceDialogOpen, setIsCreateInvoiceDialogOpen] = useState(false);
  const [isViewInvoiceDialogOpen, setIsViewInvoiceDialogOpen] = useState(false);
  const { getInvoiceByOrderId, refetch: refetchInvoices } = useInvoices();
  const stockAvailable = getStockAvailable(item.productCode);
  const isStockLow = stockAvailable < item.quantity;

  // Find the correct order by order_number instead of id
  const order = orders.find(o => o.order_number === item.orderId);
  const existingInvoice = order ? getInvoiceByOrderId(order.id) : null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Created':
        return <Clock className="h-3 w-3" />;
      case 'Progress':
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
      case 'Progress':
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

  const handleOrderUpdate = async () => {
    await onOrderUpdate();
    await refetchInvoices(); // Refresh invoices when order updates
  };

  const handleInvoiceCreated = async () => {
    await onOrderUpdate();
    await refetchInvoices();
    setIsCreateInvoiceDialogOpen(false);
  };

  return (
    <>
      <TableRow className="h-10 hover:bg-gray-50">
        <TableCell className="py-1 px-2 text-xs font-medium">{item.orderId}</TableCell>
        <TableCell className="py-1 px-2 text-xs text-blue-600 font-medium w-24">
          <div 
            className="truncate cursor-pointer" 
            title={item.suborder_id}
          >
            {item.suborder_id}
          </div>
        </TableCell>
        <TableCell className="py-1 px-2 text-xs">{item.customer}</TableCell>
        <TableCell className="py-1 px-2 text-xs font-mono">
          <ProductDetailsPopover productCode={item.productCode}>
            <Button variant="ghost" className="h-auto p-0 text-xs font-mono text-blue-600 hover:text-blue-800 hover:bg-blue-50">
              <div className="flex flex-col items-start">
                <span>{item.productCode}</span>
                <span className="text-xs text-gray-500 font-normal">{item.category}</span>
              </div>
            </Button>
          </ProductDetailsPopover>
        </TableCell>
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
        <TableCell className="py-1 px-2 text-xs">
          {item.expectedDelivery ? new Date(item.expectedDelivery).toLocaleDateString('en-IN') : '-'}
        </TableCell>
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
                    onOrderUpdate={handleOrderUpdate}
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
            
            {/* Invoice Actions */}
            {order && (
              <>
                {existingInvoice ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={() => setIsViewInvoiceDialogOpen(true)}
                    title="View Invoice"
                  >
                    <FileText className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={() => setIsCreateInvoiceDialogOpen(true)}
                    title="Create Invoice"
                  >
                    <Receipt className="h-3 w-3" />
                  </Button>
                )}
              </>
            )}
          </div>
        </TableCell>
      </TableRow>

      {order && (
        <>
          <EditOrderDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            order={order}
            onOrderUpdate={handleOrderUpdate}
          />
          
          {!existingInvoice && (
            <CreateInvoiceDialog
              isOpen={isCreateInvoiceDialogOpen}
              onClose={() => setIsCreateInvoiceDialogOpen(false)}
              order={order}
              onInvoiceCreated={handleInvoiceCreated}
            />
          )}
          
          {existingInvoice && (
            <ViewInvoiceDialog
              isOpen={isViewInvoiceDialogOpen}
              onClose={() => setIsViewInvoiceDialogOpen(false)}
              invoice={existingInvoice}
              order={order}
            />
          )}
        </>
      )}
    </>
  );
};

export default OrdersTableRow;
