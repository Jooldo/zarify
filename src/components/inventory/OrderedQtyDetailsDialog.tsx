import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Package, AlertTriangle, CheckCircle, ArrowUp, ArrowDown, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import ProductDetailsPopover from '@/components/ui/ProductDetailsPopover';
import { Button } from '@/components/ui/button';

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
  product_name: string;
  required_quantity: number;
  current_stock: number;
  in_manufacturing: number;
  threshold: number;
  shortfall: number;
  material_quantity_per_unit: number;
  total_material_required: number;
}

interface OrderedQtyDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productCode?: string;
  materialName?: string;
  materialUnit?: string;
  orderDetails?: OrderDetail[];
  productDetails?: ProductDetail[];
  totalQuantity: number;
  loading?: boolean;
  isRawMaterial?: boolean;
}

const OrderedQtyDetailsDialog = ({ 
  isOpen, 
  onClose, 
  productCode, 
  materialName, 
  materialUnit = '',
  orderDetails = [], 
  productDetails = [],
  totalQuantity,
  loading = false,
  isRawMaterial = false
}: OrderedQtyDetailsDialogProps) => {
  const formatIndianNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

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

  const getInventoryStatus = (currentStock: number, inManufacturing: number, requiredQuantity: number, threshold: number) => {
    const shortfall = Math.max(0, (requiredQuantity + threshold) - (currentStock + inManufacturing));
    
    if (shortfall > 0) {
      return { status: 'Critical', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (currentStock <= threshold) {
      return { status: 'Low', icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    } else {
      return { status: 'Good', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' };
    }
  };

  const getShortUnit = (unit: string) => {
    const unitMap: { [key: string]: string } = {
      'grams': 'g',
      'gram': 'g',
      'kilograms': 'kg',
      'kilogram': 'kg',
      'liters': 'l',
      'liter': 'l',
      'milliliters': 'ml',
      'milliliter': 'ml',
      'pieces': 'pcs',
      'piece': 'pc',
      'meters': 'm',
      'meter': 'm',
      'centimeters': 'cm',
      'centimeter': 'cm',
      'pounds': 'lbs',
      'pound': 'lb',
      'ounces': 'oz',
      'ounce': 'oz'
    };
    return unitMap[unit.toLowerCase()] || unit;
  };

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {isRawMaterial ? 'Product Requirements for Raw Material' : 'Ordered Quantity Details'}
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
                  <span className="text-gray-500">Raw Material:</span> 
                  <span className="font-medium ml-2">{materialName}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500">
                  {isRawMaterial ? 'Total Material Required:' : 'Total Ordered Quantity:'}
                </span> 
                <span className="font-bold text-blue-600 ml-2">
                  {formatIndianNumber(totalQuantity)}{materialUnit ? ` ${getShortUnit(materialUnit)}` : ''}
                </span>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-sm text-gray-500">
                  {isRawMaterial ? 'Loading product requirements...' : 'Loading order details...'}
                </div>
              </div>
            ) : isRawMaterial ? (
              // Product details table for raw materials
              productDetails.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No products found that require this raw material.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="h-8">
                      <TableHead className="py-1 px-2 text-xs font-medium">Product Code</TableHead>
                      <TableHead className="py-1 px-2 text-xs font-medium">Threshold</TableHead>
                      <TableHead className="py-1 px-2 text-xs font-medium text-center">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-blue-700 font-semibold text-xs leading-tight">Live Orders</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-blue-500 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Total quantity of this product required for all pending orders</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </TableHead>
                      <TableHead className="py-1 px-2 text-xs font-medium text-center">Current Stock</TableHead>
                      <TableHead className="py-1 px-2 text-xs font-medium text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span>In Manufacturing</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-gray-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Quantity of this product currently being manufactured</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableHead>
                      <TableHead className="py-1 px-2 text-xs font-medium text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span>Shortfall</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-gray-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Shortage calculation: (Live Orders + Threshold) - (Current Stock + In Manufacturing)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableHead>
                      <TableHead className="py-1 px-2 text-xs font-medium">
                        <div className="flex items-center gap-1">
                          <span>Status</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-gray-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Critical: Shortage exists; Low: Current stock below threshold; Good: Adequate stock levels</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableHead>
                      <TableHead className="py-1 px-2 text-xs font-medium text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span>Material Required</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-gray-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Quantity of raw material required based on product shortfall</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productDetails.map((product, index) => {
                      const statusInfo = getInventoryStatus(
                        product.current_stock,
                        product.in_manufacturing,
                        product.required_quantity,
                        product.threshold
                      );
                      const StatusIcon = statusInfo.icon;
                      
                      // Calculate material required based on shortfall
                      const materialRequiredFromShortfall = product.shortfall > 0 ? product.shortfall * product.material_quantity_per_unit : 0;

                      return (
                        <TableRow key={index} className="h-10">
                          <TableCell className="px-2 py-1 font-mono text-xs bg-gray-50">
                            <ProductDetailsPopover productCode={product.product_code}>
                              <Button variant="ghost" className="h-auto p-0 text-xs font-mono text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                                {product.product_code}
                              </Button>
                            </ProductDetailsPopover>
                          </TableCell>
                          <TableCell className="px-2 py-1 text-xs font-medium">
                            {formatIndianNumber(product.threshold)}
                          </TableCell>
                          <TableCell className="py-1 px-2 text-center">
                            <span className="text-sm font-bold text-blue-700">
                              {formatIndianNumber(product.required_quantity)}
                            </span>
                          </TableCell>
                          <TableCell className="px-2 py-1 text-sm font-bold text-center">
                            {formatIndianNumber(product.current_stock)}
                          </TableCell>
                          <TableCell className="px-2 py-1 text-sm font-medium text-center">
                            {formatIndianNumber(product.in_manufacturing)}
                          </TableCell>
                          <TableCell className="px-2 py-1 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className={`text-sm font-medium ${product.shortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatIndianNumber(Math.abs(product.shortfall))}
                              </span>
                              {product.shortfall > 0 ? (
                                <ArrowDown className="h-4 w-4 text-red-600" />
                              ) : (
                                <ArrowUp className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-2 py-1">
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusInfo.bgColor}`}>
                              <StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
                              <span className={`text-xs font-medium ${statusInfo.color}`}>
                                {statusInfo.status}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-2 py-1 text-center">
                            <div className="text-base">
                              <div className="font-bold text-blue-600">
                                {formatIndianNumber(materialRequiredFromShortfall)}{materialUnit ? ` ${getShortUnit(materialUnit)}` : ''}
                              </div>
                              <div className="text-gray-500 text-xs">
                                ({formatIndianNumber(product.material_quantity_per_unit)}{materialUnit ? ` ${getShortUnit(materialUnit)}` : ''} per unit)
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )
            ) : (
              // Original order details table for finished goods
              orderDetails.length === 0 ? (
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
                          {order.quantity}
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
              )
            )}
          </ScrollArea>

          {((isRawMaterial && productDetails.length > 0) || (!isRawMaterial && orderDetails.length > 0)) && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {isRawMaterial ? `Products: ${productDetails.length}` : `Total Orders: ${orderDetails.length}`}
                </span>
                <span className="font-bold">
                  {isRawMaterial ? `Total Material Required: ${formatIndianNumber(totalQuantity)}${materialUnit ? ` ${getShortUnit(materialUnit)}` : ''}` : `Total Quantity: ${formatIndianNumber(totalQuantity)}`}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default OrderedQtyDetailsDialog;
