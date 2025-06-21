
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TableCell, TableRow } from '@/components/ui/table';
import { Edit, Eye, Clock, CheckCircle, Package, Truck, Receipt, FileText, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import OrderDetails from '@/components/OrderDetails'; // Keep for full order view
import EditOrderDialog from './EditOrderDialog';
import CreateInvoiceDialog from './CreateInvoiceDialog';
import ViewInvoiceDialog from './ViewInvoiceDialog';
// ProductDetailsPopover is removed
import ViewFinishedGoodDialog from '@/components/inventory/ViewFinishedGoodDialog'; // For product code click
import SuborderDetailsDialog from './SuborderDetailsDialog'; // New dialog for suborder
import { useInvoices } from '@/hooks/useInvoices';
import { FinishedGood } from '@/hooks/useFinishedGoods'; // Import type
import { OrderItem as FullOrderItem, ProductConfig } from '@/hooks/useOrders';
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
    product_configs: ProductConfig;
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
  const fulfillmentPercentage = item.quantity > 0 ? (item.fulfilled_quantity / item.quantity) * 100 : 0;

  // Find the correct parent order for dialogs
  const parentOrder = orders.find(o => o.order_number === item.orderId);
  const existingInvoice = parentOrder ? getInvoiceByOrderId(parentOrder.id) : null;
  const selectedFinishedGood = finishedGoods.find(fg => fg.product_code === item.productCode);

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

  const handleOrderUpdateAndCloseDialogs = async () => {
    await onOrderUpdate();
    setIsOrderDetailsOpen(false);
    setIsSuborderDetailsOpen(false);
    setIsEditDialogOpen(false);
  };

  const handleInvoiceCreated = async () => {
    await onOrderUpdate();
    setIsCreateInvoiceDialogOpen(false);
  };

  // Construct the OrderItem from the flattened `item`
  const suborderItemForDialog: FullOrderItem = {
    id: item.id,
    suborder_id: item.suborder_id,
    quantity: item.quantity,
    fulfilled_quantity: item.fulfilled_quantity,
    unit_price: item.unit_price,
    total_price: item.price,
    status: item.status as OrderStatus,
    product_config_id: item.product_config_id,
    product_configs: item.product_configs,
    updated_at: item.updatedDate,
    // @ts-ignore
    created_at: item.createdDate,
    // @ts-ignore
    order_id: item.order_id,
    // @ts-ignore
    merchant_id: item.merchant_id,
  };

  return (
    <>
      <TableRow className="h-16 hover:bg-gray-50/50 border-b border-gray-100">
        <TableCell className="py-4 px-4 text-sm font-medium">
          {parentOrder ? (
            <Button 
              variant="link" 
              className="h-auto p-0 text-sm font-medium text-blue-600 hover:text-blue-800"
              onClick={() => setIsOrderDetailsOpen(true)}
            >
              {item.orderId}
            </Button>
          ) : (
            item.orderId
          )}
        </TableCell>
        <TableCell className="py-4 px-4 text-sm text-blue-600 font-medium w-24">
          {parentOrder ? (
            <Button 
              variant="link" 
              className="h-auto p-0 text-sm font-medium text-blue-600 hover:text-blue-800 truncate block w-full text-left"
              onClick={() => setIsSuborderDetailsOpen(true)}
              title={item.suborder_id}
            >
              {item.suborder_id}
            </Button>
          ) : (
             <div className="truncate" title={item.suborder_id}>{item.suborder_id}</div>
          )}
        </TableCell>
        <TableCell className="py-4 px-4 text-sm text-gray-900">{item.customer}</TableCell>
        <TableCell className="py-4 px-4 text-sm font-mono">
          {selectedFinishedGood ? (
            <Button 
              variant="link" 
              className="h-auto p-0 text-sm font-mono text-blue-600 hover:text-blue-800"
              onClick={() => setIsViewProductOpen(true)}
            >
              {item.productCode}
            </Button>
          ) : (
            item.productCode
          )}
        </TableCell>
        <TableCell className="py-4 px-4 text-sm font-medium text-gray-900">{item.quantity}</TableCell>
        <TableCell className="py-4 px-4 text-sm">
          <div className="flex items-center gap-2">
            <Progress value={fulfillmentPercentage} className="h-2 w-16" />
            <span className="text-muted-foreground text-xs">{fulfillmentPercentage.toFixed(0)}%</span>
          </div>
        </TableCell>
        <TableCell className="py-4 px-4 text-sm text-gray-600">
          {item.createdDate ? new Date(item.createdDate).toLocaleDateString('en-IN') : '-'}
        </TableCell>
        <TableCell className="py-4 px-4 text-sm font-medium">
          <span className={isStockLow ? "text-red-600" : "text-green-600"}>
            {stockAvailable}
          </span>
        </TableCell>
        <TableCell className="py-4 px-4">
          <StatusBadge status={item.status} />
        </TableCell>
        <TableCell className="py-4 px-4">
          <StatusBadge status={getOverallOrderStatus(item.orderId)} />
        </TableCell>
        <TableCell className="py-4 px-4 text-sm text-gray-600">
          {item.expectedDelivery ? new Date(item.expectedDelivery).toLocaleDateString('en-IN') : '-'}
        </TableCell>
        <TableCell className="py-4 px-4">
          <div className="flex items-center gap-3">
            {/* Original Eye button remains for full order details as an alternative or remove if OrderID click is sufficient */}
             {parentOrder && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full border-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                onClick={() => setIsOrderDetailsOpen(true)} // Can also be triggered by Order ID click
                title="View Full Order"
              >
                <Eye className="h-4 w-4 text-gray-600" />
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-full border-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
              onClick={() => setIsEditDialogOpen(true)}
              title="Edit Order Item"
            >
              <Edit className="h-4 w-4 text-gray-600" />
            </Button>
            
            {/* Invoice Actions */}
            {parentOrder && (
              <>
                {existingInvoice ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-full border-2 hover:bg-green-50 hover:border-green-200 transition-colors"
                    onClick={() => setIsViewInvoiceDialogOpen(true)}
                    title="View Invoice"
                  >
                    <FileText className="h-4 w-4 text-gray-600" />
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-full border-2 hover:bg-green-50 hover:border-green-200 transition-colors"
                    onClick={() => setIsCreateInvoiceDialogOpen(true)}
                    title="Create Invoice"
                  >
                    <Receipt className="h-4 w-4 text-gray-600" />
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
            <OrderDetails order={parentOrder} />
          </DialogContent>
        </Dialog>
      )}

      {parentOrder && (
        <SuborderDetailsDialog
          isOpen={isSuborderDetailsOpen}
          onClose={() => setIsSuborderDetailsOpen(false)}
          suborderItem={suborderItemForDialog}
          parentOrder={parentOrder}
        />
      )}
      
      {selectedFinishedGood && (
         <ViewFinishedGoodDialog
            isOpen={isViewProductOpen}
            onClose={() => setIsViewProductOpen(false)}
            product={selectedFinishedGood}
          />
      )}

      {parentOrder && (
        <>
          <EditOrderDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            order={parentOrder}
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
