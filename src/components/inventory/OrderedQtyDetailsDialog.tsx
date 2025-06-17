
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import type { OrderDetail } from '@/hooks/useOrderedQtyDetails';

interface OrderedQtyDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productCode?: string;
  orderDetails: OrderDetail[];
  totalQuantity: number;
  loading: boolean;
}

const OrderedQtyDetailsDialog = ({ 
  isOpen, 
  onClose, 
  productCode, 
  orderDetails, 
  totalQuantity,
  loading 
}: OrderedQtyDetailsDialogProps) => {
  const formatIndianNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created':
        return 'default' as const;
      case 'in progress':
        return 'secondary' as const;
      case 'partially fulfilled':
        return 'secondary' as const;
      case 'completed':
        return 'default' as const;
      default:
        return 'outline' as const;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created':
        return 'text-blue-600';
      case 'in progress':
        return 'text-yellow-600';
      case 'partially fulfilled':
        return 'text-orange-600';
      case 'completed':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            Live Orders for {productCode}
            <Badge variant="outline" className="ml-2">
              Total: {formatIndianNumber(totalQuantity)}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading order details...
          </div>
        ) : orderDetails.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No pending orders found for this product.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Showing {orderDetails.length} order(s) with remaining quantities to fulfill
            </div>
            
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="h-10">
                    <TableHead className="py-2 text-xs">Order Number</TableHead>
                    <TableHead className="py-2 text-xs">Customer</TableHead>
                    <TableHead className="py-2 text-xs">Order Date</TableHead>
                    <TableHead className="py-2 text-xs text-center">Total Qty</TableHead>
                    <TableHead className="py-2 text-xs text-center">Fulfilled</TableHead>
                    <TableHead className="py-2 text-xs text-center">Remaining</TableHead>
                    <TableHead className="py-2 text-xs">Status</TableHead>
                    <TableHead className="py-2 text-xs">Suborder ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderDetails.map((detail, index) => (
                    <TableRow key={index} className="h-10">
                      <TableCell className="py-2 text-xs font-mono">
                        {detail.order_number}
                      </TableCell>
                      <TableCell className="py-2 text-xs">
                        {detail.customer_name}
                      </TableCell>
                      <TableCell className="py-2 text-xs">
                        {new Date(detail.order_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-2 text-xs text-center font-medium">
                        {formatIndianNumber(detail.quantity)}
                      </TableCell>
                      <TableCell className="py-2 text-xs text-center">
                        {formatIndianNumber(detail.fulfilled_quantity)}
                      </TableCell>
                      <TableCell className="py-2 text-xs text-center">
                        <span className="font-bold text-blue-600">
                          {formatIndianNumber(detail.remaining_quantity)}
                        </span>
                      </TableCell>
                      <TableCell className="py-2 text-xs">
                        <Badge 
                          variant={getStatusVariant(detail.status)}
                          className={`text-xs ${getStatusColor(detail.status)}`}
                        >
                          {detail.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-xs font-mono text-gray-500">
                        {detail.suborder_id}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-blue-900">
                Summary
              </div>
              <div className="text-xs text-blue-700 mt-1">
                Total remaining quantity across all orders: <span className="font-bold">{formatIndianNumber(totalQuantity)}</span>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                This includes orders with any status that have remaining quantities to fulfill
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderedQtyDetailsDialog;
