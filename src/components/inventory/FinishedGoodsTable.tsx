
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

  const getSortIcon = (field: string) => {
    if (sortConfig?.field !== field) return null;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-3 w-3 ml-1" /> : 
      <ChevronDown className="h-3 w-3 ml-1" />;
  };

  return (
    <TooltipProvider>
      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="h-12 border-b border-gray-200">
              <TableHead className="py-3 px-4 text-sm font-medium text-gray-700">Product Code</TableHead>
              <TableHead className="py-3 px-4 text-sm font-medium text-gray-700">Threshold</TableHead>
              <TableHead className="py-3 px-4 text-sm font-medium text-gray-700 text-center">
                <div className="flex items-center justify-center">
                  <span>Live Orders</span>
                  {getSortIcon('ordered_qty')}
                </div>
              </TableHead>
              <TableHead className="py-3 px-4 text-sm font-medium text-gray-700 text-center">
                <div className="flex items-center justify-center">
                  <span>Current Stock</span>
                  {getSortIcon('current_stock')}
                </div>
              </TableHead>
              <TableHead className="py-3 px-4 text-sm font-medium text-gray-700 text-center">
                <div className="flex items-center justify-center">
                  <span>In Manufacturing</span>
                  {getSortIcon('in_manufacturing')}
                </div>
              </TableHead>
              <TableHead className="py-3 px-4 text-sm font-medium text-gray-700 text-center">
                <div className="flex items-center justify-center">
                  <span>Shortfall</span>
                  {getSortIcon('shortfall')}
                </div>
              </TableHead>
              <TableHead className="py-3 px-4 text-sm font-medium text-gray-700">Status</TableHead>
              <TableHead className="py-3 px-4 text-sm font-medium text-gray-700">Actions</TableHead>
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
                <TableRow key={product.id} className="h-16 border-b border-gray-100 hover:bg-gray-50/50">
                  <TableCell className="py-4 px-4 font-mono text-sm">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 text-sm font-mono text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      onClick={() => handleProductCodeClick(product)}
                    >
                      {product.product_code}
                    </Button>
                  </TableCell>
                  <TableCell className="py-4 px-4 text-sm text-gray-600">
                    {formatIndianNumber(product.threshold)}
                  </TableCell>
                  <TableCell className="py-4 px-4 text-center">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      onClick={() => handleOrderedQtyClick(product)}
                    >
                      {formatIndianNumber(product.required_quantity)}
                    </Button>
                  </TableCell>
                  <TableCell className="py-4 px-4 text-sm font-semibold text-center text-gray-900">
                    {formatIndianNumber(product.current_stock)}
                  </TableCell>
                  <TableCell className="py-4 px-4 text-center">
                    <span className="text-sm font-semibold text-orange-600">
                      {formatIndianNumber(product.in_manufacturing)}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-4 text-center">
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
                  <TableCell className="py-4 px-4">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusInfo.bgColor}`}>
                      <StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
                      <span className={`text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0 rounded-full border-gray-300 hover:bg-gray-50"
                        onClick={() => onEditProduct(product)}
                      >
                        <Edit className="h-3.5 w-3.5 text-gray-600" />
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
