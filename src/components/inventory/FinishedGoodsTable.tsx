
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, AlertTriangle, CheckCircle, AlertCircle, Info, ArrowUp, ArrowDown, ChevronUp, ChevronDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import type { FinishedGood } from '@/hooks/useFinishedGoods';
import { useOrderedQtyDetails } from '@/hooks/useOrderedQtyDetails';
import OrderedQtyDetailsDialog from './OrderedQtyDetailsDialog';
import ProductDetailsPopover from '@/components/ui/ProductDetailsPopover';

interface FinishedGoodsTableProps {
  products: FinishedGood[];
  onViewProduct: (product: FinishedGood) => void;
  onEditProduct: (product: FinishedGood) => void;
  sortConfig?: { field: string; direction: 'asc' | 'desc' } | null;
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
}

const FinishedGoodsTable = ({ products, onViewProduct, onEditProduct, sortConfig, onSortChange }: FinishedGoodsTableProps) => {
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

  const handleProductCodeClick = (product: FinishedGood) => {
    onViewProduct(product);
  };

  const handleSort = (field: string) => {
    if (!onSortChange) return;
    
    const direction = sortConfig?.field === field && sortConfig?.direction === 'asc' ? 'desc' : 'asc';
    onSortChange(field, direction);
  };

  const getSortIcon = (field: string) => {
    if (sortConfig?.field !== field) return null;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-3 w-3 inline ml-1" /> : 
      <ChevronDown className="h-3 w-3 inline ml-1" />;
  };

  // Sort products based on sortConfig
  const sortedProducts = [...products].sort((a, b) => {
    if (!sortConfig) return 0;

    const { field, direction } = sortConfig;
    let aValue: number;
    let bValue: number;

    switch (field) {
      case 'ordered_qty':
        aValue = a.required_quantity || 0;
        bValue = b.required_quantity || 0;
        break;
      case 'current_stock':
        aValue = a.current_stock || 0;
        bValue = b.current_stock || 0;
        break;
      case 'in_manufacturing':
        aValue = a.in_manufacturing || 0;
        bValue = b.in_manufacturing || 0;
        break;
      case 'shortfall':
        aValue = calculateShortfall(a.current_stock, a.in_manufacturing, a.required_quantity, a.threshold);
        bValue = calculateShortfall(b.current_stock, b.in_manufacturing, b.required_quantity, b.threshold);
        break;
      default:
        return 0;
    }

    return direction === 'asc' ? aValue - bValue : bValue - aValue;
  });

  return (
    <TooltipProvider>
      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="h-10 bg-gray-50 border-b border-gray-200">
              <TableHead className="py-2 px-4 text-sm font-medium text-gray-700">Product Code</TableHead>
              <TableHead className="py-2 px-4 text-sm font-medium text-gray-700">Threshold</TableHead>
              <TableHead 
                className="py-2 px-4 text-sm font-medium text-gray-700 text-center cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('ordered_qty')}
              >
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-blue-700 font-semibold text-sm leading-tight">Live Orders</span>
                    {getSortIcon('ordered_qty')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Total quantity of this product required for all pending orders (Created + In Progress status)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </TableHead>
              <TableHead 
                className="py-2 px-4 text-sm font-medium text-gray-700 text-center cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('current_stock')}
              >
                Current Stock {getSortIcon('current_stock')}
              </TableHead>
              <TableHead 
                className="py-2 px-4 text-sm font-medium text-gray-700 text-center cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('in_manufacturing')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>In Manufacturing</span>
                  {getSortIcon('in_manufacturing')}
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
              <TableHead 
                className="py-2 px-4 text-sm font-medium text-gray-700 text-center cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('shortfall')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Shortfall</span>
                  {getSortIcon('shortfall')}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Shortage calculation: (Live Orders + Threshold) - (Current Stock + In Manufacturing). Positive values indicate shortage, negative indicate surplus.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableHead>
              <TableHead className="py-2 px-4 text-sm font-medium text-gray-700">
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
              <TableHead className="py-2 px-4 text-sm font-medium text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.map((product) => {
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
                <TableRow key={product.id} className="h-14 hover:bg-gray-50 border-b border-gray-100">
                  <TableCell className="px-4 py-2 font-mono text-sm bg-gray-50">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 text-sm font-mono text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      onClick={() => handleProductCodeClick(product)}
                    >
                      {product.product_code}
                    </Button>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-sm font-medium text-gray-900">
                    {formatIndianNumber(product.threshold)}
                  </TableCell>
                  <TableCell className="py-2 px-4 text-center">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 text-sm font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      onClick={() => handleOrderedQtyClick(product)}
                    >
                      {formatIndianNumber(product.required_quantity)}
                    </Button>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-sm font-medium text-center text-gray-900">
                    {formatIndianNumber(product.current_stock)}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
                    <span className="text-sm font-medium text-orange-600">
                      {formatIndianNumber(product.in_manufacturing)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
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
                  <TableCell className="px-4 py-2">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${statusInfo.bgColor}`}>
                      <StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
                      <span className={`text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-7 w-7 rounded-full border-gray-300 hover:bg-gray-50"
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
