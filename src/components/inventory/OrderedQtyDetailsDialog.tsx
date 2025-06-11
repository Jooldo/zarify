
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Package, Factory, ShoppingCart } from 'lucide-react';

interface OrderDetail {
  order_number: string;
  customer_name: string;
  quantity: number;
  status: string;
  suborder_id: string;
  created_date: string;
}

interface ProductDetail {
  product_code: string;
  product_shortfall: number;
  material_quantity_per_unit: number;
  total_material_needed: number;
  current_stock: number;
  in_manufacturing: number;
  required_quantity: number;
  threshold: number;
}

interface OrderedQtyDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productCode?: string;
  materialName?: string;
  orderDetails: OrderDetail[];
  productDetails?: ProductDetail[];
  totalQuantity: number;
  loading?: boolean;
}

const OrderedQtyDetailsDialog = ({ 
  isOpen, 
  onClose, 
  productCode, 
  materialName, 
  orderDetails, 
  productDetails = [],
  totalQuantity,
  loading = false 
}: OrderedQtyDetailsDialogProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Created':
        return 'bg-gray-100 text-gray-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Ready':
        return 'bg-yellow-100 text-yellow-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {materialName ? 'Raw Material Requirements' : 'Ordered Quantity Details'}
          </DialogTitle>
          <div className="text-sm text-gray-600 mt-2 space-y-1">
            {productCode && (
              <div>
                <span className="text-gray-500">Product Code:</span> 
                <span className="font-medium ml-2 font-mono text-blue-600">{productCode}</span>
              </div>
            )}
            {materialName && (
              <div>
                <span className="text-gray-500">Material:</span> 
                <span className="font-medium ml-2">{materialName}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500">Total Required Quantity:</span> 
              <span className="font-bold text-blue-600 ml-2">{formatNumber(totalQuantity)}</span>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-sm text-gray-500">Loading details...</div>
          </div>
        ) : materialName ? (
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Factory className="h-4 w-4" />
                Products Requiring Material ({productDetails.length})
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Order Details ({orderDetails.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <ScrollArea className="max-h-[50vh]">
                {productDetails.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">No products with shortfall require this material.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Product Code</TableHead>
                        <TableHead className="text-xs">Current Stock</TableHead>
                        <TableHead className="text-xs">In Manufacturing</TableHead>
                        <TableHead className="text-xs">Required Qty</TableHead>
                        <TableHead className="text-xs">Threshold</TableHead>
                        <TableHead className="text-xs">Product Shortfall</TableHead>
                        <TableHead className="text-xs">Material/Unit</TableHead>
                        <TableHead className="text-xs">Total Material Needed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productDetails.map((product, index) => (
                        <TableRow key={index} className="h-10">
                          <TableCell className="py-1 px-2 text-xs font-mono text-blue-600">
                            {product.product_code}
                          </TableCell>
                          <TableCell className="py-1 px-2 text-xs">
                            {formatNumber(product.current_stock)}
                          </TableCell>
                          <TableCell className="py-1 px-2 text-xs">
                            {formatNumber(product.in_manufacturing)}
                          </TableCell>
                          <TableCell className="py-1 px-2 text-xs">
                            {formatNumber(product.required_quantity)}
                          </TableCell>
                          <TableCell className="py-1 px-2 text-xs">
                            {formatNumber(product.threshold)}
                          </TableCell>
                          <TableCell className="py-1 px-2 text-xs font-bold text-red-600">
                            {formatNumber(product.product_shortfall)}
                          </TableCell>
                          <TableCell className="py-1 px-2 text-xs">
                            {product.material_quantity_per_unit}
                          </TableCell>
                          <TableCell className="py-1 px-2 text-xs font-bold text-blue-600">
                            {formatNumber(product.total_material_needed)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="orders">
              <ScrollArea className="max-h-[50vh]">
                {orderDetails.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">No pending orders found for this material.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Order #</TableHead>
                        <TableHead className="text-xs">Suborder ID</TableHead>
                        <TableHead className="text-xs">Customer</TableHead>
                        <TableHead className="text-xs">Material Quantity</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Order Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderDetails.map((order, index) => (
                        <TableRow key={index} className="h-10">
                          <TableCell className="py-1 px-2 text-xs font-medium">
                            {order.order_number}
                          </TableCell>
                          <TableCell className="py-1 px-2 text-xs text-blue-600">
                            {order.suborder_id}
                          </TableCell>
                          <TableCell className="py-1 px-2 text-xs">
                            {order.customer_name}
                          </TableCell>
                          <TableCell className="py-1 px-2 text-xs font-bold">
                            {formatNumber(order.quantity)}
                          </TableCell>
                          <TableCell className="py-1 px-2">
                            <Badge className={`text-xs px-2 py-1 ${getStatusColor(order.status)}`}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-1 px-2 text-xs">
                            {new Date(order.created_date).toLocaleDateString('en-IN')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            {orderDetails.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No pending orders found for this item.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Order #</TableHead>
                    <TableHead className="text-xs">Suborder ID</TableHead>
                    <TableHead className="text-xs">Customer</TableHead>
                    <TableHead className="text-xs">Quantity</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Order Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderDetails.map((order, index) => (
                    <TableRow key={index} className="h-10">
                      <TableCell className="py-1 px-2 text-xs font-medium">
                        {order.order_number}
                      </TableCell>
                      <TableCell className="py-1 px-2 text-xs text-blue-600">
                        {order.suborder_id}
                      </TableCell>
                      <TableCell className="py-1 px-2 text-xs">
                        {order.customer_name}
                      </TableCell>
                      <TableCell className="py-1 px-2 text-xs font-bold">
                        {formatNumber(order.quantity)}
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <Badge className={`text-xs px-2 py-1 ${getStatusColor(order.status)}`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-1 px-2 text-xs">
                        {new Date(order.created_date).toLocaleDateString('en-IN')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        )}

        {(orderDetails.length > 0 || productDetails.length > 0) && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-sm">
              {materialName ? (
                <>
                  <span className="text-gray-600">
                    Products with shortfall: {productDetails.length} | Orders: {orderDetails.length}
                  </span>
                  <span className="font-bold">Total Material Required: {formatNumber(totalQuantity)}</span>
                </>
              ) : (
                <>
                  <span className="text-gray-600">Total Orders: {orderDetails.length}</span>
                  <span className="font-bold">Total Quantity: {formatNumber(totalQuantity)}</span>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderedQtyDetailsDialog;
