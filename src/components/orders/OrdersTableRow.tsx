import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TableCell, TableRow } from '@/components/ui/table';
import { Edit, Eye, Clock, CheckCircle, Package, Truck, Receipt, FileText, Info } from 'lucide-react';
import OrderDetails from '@/components/OrderDetails'; // Keep for full order view
import EditOrderDialog from './EditOrderDialog';
import CreateInvoiceDialog from './CreateInvoiceDialog';
import ViewInvoiceDialog from './ViewInvoiceDialog';
// ProductDetailsPopover is removed
import ViewFinishedGoodDialog from '@/components/inventory/ViewFinishedGoodDialog'; // For product code click
import SuborderDetailsDialog from './SuborderDetailsDialog'; // New dialog for suborder
import { useInvoices } from '@/hooks/useInvoices';
import { FinishedGood } from '@/hooks/useFinishedGoods'; // Import type
import { OrderItem as FullOrderItem } from '@/hooks/useOrders';
import { Order as FullOrder } from '@/hooks/useOrders';
import { OrderStatus } from '@/hooks/useOrders';

interface OrdersTableRowProps {
  item: { // This is a flattened order item
    id: string; // suborder_item id
    orderId: string; // parent order_number
    customer: string;
    productCode: string;
    category: string;
    subcategory: string;
    size: string;
    quantity: number;
    status: string; // suborder status
    price: number; // suborder total_price
    totalOrderAmount: number; // parent order total_amount
    createdDate: string;
    updatedDate: string;
    expectedDelivery: string;
    suborder_id: string; // suborder specific identifier
    // The original OrderItem fields are still needed for SuborderDetailsDialog
    fulfilled_quantity: number; 
    unit_price: number;
    product_config_id: string;
    product_config: {
      id: string;
      product_code: string;
      category: string;
      subcategory: string;
      size_value: number;
      weight_range: string | null;
    };
  };
  orders: FullOrder[]; // Full orders list to find the parent order
  finishedGoods: FinishedGood[]; // For product details on product code click
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
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isSuborderDetailsOpen, setIsSuborderDetailsOpen] = useState(false);
  const [isViewProductOpen, setIsViewProductOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateInvoiceDialogOpen, setIsCreateInvoiceDialogOpen] = useState(false);
  const [isViewInvoiceDialogOpen, setIsViewInvoiceDialogOpen] = useState(false);
  
  const { getInvoiceByOrderId, refetch: refetchInvoices } = useInvoices();
  const stockAvailable = getStockAvailable(item.productCode);
  const isStockLow = stockAvailable < item.quantity;

  // Find the correct parent order for dialogs
  const parentOrder = orders.find(o => o.order_number === item.orderId);
  const existingInvoice = parentOrder ? getInvoiceByOrderId(parentOrder.id) : null;
  const selectedFinishedGood = finishedGoods.find(fg => fg.product_code === item.productCode);

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

  const handleOrderUpdateAndCloseDialogs = async () => {
    await onOrderUpdate(); // This should refetch orders and invoices
    setIsOrderDetailsOpen(false);
    setIsSuborderDetailsOpen(false);
    setIsEditDialogOpen(false);
    // No need to refetchInvoices separately if onOrderUpdate handles it
  };

  const handleInvoiceCreated = async () => {
    await onOrderUpdate();
    // await refetchInvoices(); // Already handled by onOrderUpdate
    setIsCreateInvoiceDialogOpen(false);
  };

  // Construct the OrderItem from the flattened `item`
  const suborderItemForDialog: FullOrderItem = {
    id: item.id,
    suborder_id: item.suborder_id,
    quantity: item.quantity,
    fulfilled_quantity: item.fulfilled_quantity,
    unit_price: item.unit_price,
    total_price: item.price, // item.price is suborder total_price
    status: item.status as OrderStatus,
    product_config_id: item.product_config_id,
    product_config: item.product_config,
  };


  return (
    <>
      <TableRow className="h-10 hover:bg-gray-50">
        <TableCell className="py-1 px-2 text-xs font-medium">
          {parentOrder ? (
            <Button 
              variant="link" 
              className="h-auto p-0 text-xs font-medium text-blue-600 hover:text-blue-800"
              onClick={() => setIsOrderDetailsOpen(true)}
            >
              {item.orderId}
            </Button>
          ) : (
            item.orderId
          )}
        </TableCell>
        <TableCell className="py-1 px-2 text-xs text-blue-600 font-medium w-24">
          {parentOrder ? (
            <Button 
              variant="link" 
              className="h-auto p-0 text-xs font-medium text-blue-600 hover:text-blue-800 truncate block w-full text-left"
              onClick={() => setIsSuborderDetailsOpen(true)}
              title={item.suborder_id}
            >
              {item.suborder_id}
            </Button>
          ) : (
             <div className="truncate" title={item.suborder_id}>{item.suborder_id}</div>
          )}
        </TableCell>
        <TableCell className="py-1 px-2 text-xs">{item.customer}</TableCell>
        <TableCell className="py-1 px-2 text-xs font-mono">
          {selectedFinishedGood ? (
            <Button 
              variant="link" 
              className="h-auto p-0 text-xs font-mono text-blue-600 hover:text-blue-800"
              onClick={() => setIsViewProductOpen(true)}
            >
              {item.productCode}
            </Button>
          ) : (
            item.productCode
          )}
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
            {/* Original Eye button remains for full order details as an alternative or remove if OrderID click is sufficient */}
             {parentOrder && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setIsOrderDetailsOpen(true)} // Can also be triggered by Order ID click
                title="View Full Order"
              >
                <Eye className="h-3 w-3" />
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => setIsEditDialogOpen(true)}
              title="Edit Order Item"
            >
              <Edit className="h-3 w-3" />
            </Button>
            
            {/* Invoice Actions */}
            {parentOrder && (
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

      {/* Dialogs */}
      {parentOrder && (
        <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-sm">Order Details: {parentOrder.order_number}</DialogTitle>
            </DialogHeader>
            <OrderDetails 
              order={parentOrder} 
              onOrderUpdate={handleOrderUpdateAndCloseDialogs} // Ensure dialog closes
            />
          </DialogContent>
        </Dialog>
      )}

      {parentOrder && (
        <SuborderDetailsDialog
          isOpen={isSuborderDetailsOpen}
          onClose={() => setIsSuborderDetailsOpen(false)}
          suborderItem={suborderItemForDialog}
          parentOrder={parentOrder}
          onSuborderUpdate={handleOrderUpdateAndCloseDialogs}
        />
      )}
      
      {selectedFinishedGood && (
         <ViewFinishedGoodDialog
            isOpen={isViewProductOpen}
            onClose={() => setIsViewProductOpen(false)}
            product={selectedFinishedGood} // Pass the full FinishedGood object
          />
      )}

      {parentOrder && (
        <>
          <EditOrderDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            order={parentOrder} // EditOrderDialog might need to be adapted for single item editing or use SuborderDetailsDialog for edits too
            onOrderUpdate={handleOrderUpdateAndCloseDialogs}
          />
          
          {!existingInvoice && (
            <CreateInvoiceDialog
              isOpen={isCreateInvoiceDialogOpen}
              onClose={() => setIsCreateInvoiceDialogOpen(false)}
              order={parentOrder}
              onInvoiceCreated={handleInvoiceCreated}
            />
          )}
          
          {existingInvoice && (
            <ViewInvoiceDialog
              isOpen={isViewInvoiceDialogOpen}
              onClose={() => setIsViewInvoiceDialogOpen(false)}
              invoice={existingInvoice}
              order={parentOrder}
            />
          )}
        </>
      )}
    </>
  );
};

export default OrdersTableRow;
