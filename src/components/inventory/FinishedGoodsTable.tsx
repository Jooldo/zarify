
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Eye, AlertTriangle, CheckCircle, AlertCircle, Info, ArrowUp, ArrowDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import type { FinishedGood } from '@/hooks/useFinishedGoods';
import { useOrderedQtyDetails } from '@/hooks/useOrderedQtyDetails';
import OrderedQtyDetailsDialog from './OrderedQtyDetailsDialog';
import ProductDetailsPopover from '@/components/ui/ProductDetailsPopover';

interface FinishedGoodsTableProps {
  products: FinishedGood[];
  onViewProduct: (product: FinishedGood) => void;
  onEditProduct: (product: FinishedGood) => void;
}

const FinishedGoodsTable = ({ products, onViewProduct, onEditProduct }: FinishedGoodsTableProps) => {
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<FinishedGood | null>(null);
  const [orderDetails, setOrderDetails] = useState<any[]>([]);
  const { loading, fetchFinishedGoodOrderDetails } = useOrderedQtyDetails();

  const formatIndianNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  const getStockStatusVariant = (stock: number, threshold: number) => {
    if (stock <= threshold) return "destructive" as const;
    if (stock <= threshold * 1.5) return "secondary" as const;
    return "default" as const;
  };

  const calculateShortfall = (currentStock: number, inManufacturing: number, requiredQuantity: number, threshold: number) => {
    const totalAvailable = currentStock + inManufacturing;
    const totalNeeded = requiredQuantity + threshold;
    return totalNeeded - totalAvailable;
  };

  const getInventoryStatus = (currentStock: number, inManufacturing: number, requiredQuantity: number, threshold: number) => {
    const shortfall = calculateShortfall(currentStock, inManufacturing, requiredQuantity, threshold);
    const totalAvailable = currentStock + inManufacturing;
    
    if (shortfall > 0) {
      return { status: 'Critical', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (currentStock <= threshold) {
      return { status: 'Low', icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    } else {
      return { status: 'Good', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' };
    }
  };

  const handleOrderedQtyClick = async (product: FinishedGood) => {
    setSelectedProduct(product);
    setIsOrderDetailsOpen(true);
    const details = await fetchFinishedGoodOrderDetails(product.product_code);
    setOrderDetails(details);
  };

  return (
    <TooltipProvider>
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="py-1 px-2 text-xs font-medium">Product Code</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Threshold</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium bg-blue-50 border-l-2 border-r-2 border-blue-200 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-blue-700 font-semibold">Ordered Qty</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-blue-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Total quantity of this product required for all pending orders (Created + In Progress status)</p>
                    </TooltipContent>
                  </Tooltip>
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
                      <p className="max-w-xs">Shortage calculation: (Ordered Qty + Threshold) - (Current Stock + In Manufacturing). Positive values indicate shortage, negative indicate surplus.</p>
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
              <TableHead className="py-1 px-2 text-xs font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const shortfall = calculateShortfall(
                product.current_stock,
                product.in_manufacturing,
                product.required_quantity,
                product.threshold
              );

              const statusInfo = getInventoryStatus(
                product.current_stock,
                product.in_manufacturing,
                product.required_quantity,
                product.threshold
              );

              const StatusIcon = statusInfo.icon;

              return (
                <TableRow key={product.id} className="h-10">
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
                  <TableCell className="py-1 px-2 bg-blue-50 border-l-2 border-r-2 border-blue-200 text-center">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 text-sm font-bold text-blue-700 hover:text-blue-900 hover:bg-blue-50"
                      onClick={() => handleOrderedQtyClick(product)}
                    >
                      {formatIndianNumber(product.required_quantity)}
                    </Button>
                  </TableCell>
                  <TableCell className="px-2 py-1 text-sm font-bold text-center">
                    {formatIndianNumber(product.current_stock)}
                  </TableCell>
                  <TableCell className="px-2 py-1 text-sm font-medium text-center">
                    {formatIndianNumber(product.in_manufacturing)}
                  </TableCell>
                  <TableCell className="px-2 py-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className={`text-sm font-medium ${shortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatIndianNumber(Math.abs(shortfall))}
                      </span>
                      {shortfall > 0 ? (
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
                  <TableCell className="px-2 py-1">
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => onViewProduct(product)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => onEditProduct(product)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <OrderedQtyDetailsDialog
        isOpen={isOrderDetailsOpen}
        onClose={() => setIsOrderDetailsOpen(false)}
        productCode={selectedProduct?.product_code}
        orderDetails={orderDetails}
        totalQuantity={selectedProduct?.required_quantity || 0}
        loading={loading}
      />
    </TooltipProvider>
  );
};

export default FinishedGoodsTable;
