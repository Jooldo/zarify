
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, ArrowUp, ArrowDown } from 'lucide-react';

interface FinishedGoodsTableRowProps {
  product: any;
  onViewProduct: (product: any) => void;
  onEditProduct: (product: any) => void;
}

const FinishedGoodsTableRow = ({ product, onViewProduct, onEditProduct }: FinishedGoodsTableRowProps) => {
  const currentStock = product.current_stock || 0;
  const remainingOrders = product.required_quantity || 0; // This now represents remaining quantity after partial fulfillment
  const inManufacturing = product.in_manufacturing || 0;
  const threshold = product.threshold || 0;
  
  // Calculate shortfall: remaining orders + threshold - (current stock + in manufacturing)
  const shortfall = remainingOrders + threshold - (currentStock + inManufacturing);
  
  const getStockStatusColor = (stock: number, threshold: number) => {
    if (stock <= 0) return 'text-red-600';
    if (stock <= threshold) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getShortfallColor = (shortfall: number) => {
    if (shortfall > 0) return 'text-red-600';
    return 'text-green-600';
  };

  const formatIndianNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  return (
    <TableRow className="h-10 hover:bg-gray-50">
      <TableCell className="py-1 px-2 text-xs font-mono font-medium">
        {product.product_code}
      </TableCell>
      <TableCell className="py-1 px-2 text-xs">
        <div className="flex flex-col">
          <span className="font-medium">{product.product_config?.category || 'N/A'}</span>
          <span className="text-gray-500 text-[10px]">{product.product_config?.subcategory || ''}</span>
        </div>
      </TableCell>
      <TableCell className="py-1 px-2 text-xs">
        <span className={`font-medium ${getStockStatusColor(currentStock, threshold)}`}>
          {formatIndianNumber(currentStock)}
        </span>
      </TableCell>
      <TableCell className="py-1 px-2 text-xs">
        <div className="flex items-center gap-1">
          <span className={`font-medium ${remainingOrders > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
            {formatIndianNumber(remainingOrders)}
          </span>
          {remainingOrders > 0 && <span className="text-blue-500 text-[10px]">pending</span>}
        </div>
      </TableCell>
      <TableCell className="py-1 px-2 text-xs">
        <span className={`font-medium ${inManufacturing > 0 ? 'text-purple-600' : 'text-gray-500'}`}>
          {formatIndianNumber(inManufacturing)}
        </span>
      </TableCell>
      <TableCell className="py-1 px-2 text-xs">
        <div className="flex items-center gap-1">
          <span className={`font-medium ${getShortfallColor(shortfall)}`}>
            {formatIndianNumber(Math.abs(shortfall))}
          </span>
          {shortfall > 0 ? (
            <ArrowDown className="h-3 w-3 text-red-600" />
          ) : (
            <ArrowUp className="h-3 w-3 text-green-600" />
          )}
        </div>
      </TableCell>
      <TableCell className="py-1 px-2 text-xs">
        <span className="text-gray-600">{formatIndianNumber(threshold)}</span>
      </TableCell>
      <TableCell className="py-1 px-2">
        <Badge variant={product.tag_enabled ? "default" : "secondary"} className="text-xs px-2 py-0">
          {product.tag_enabled ? 'Yes' : 'No'}
        </Badge>
      </TableCell>
      <TableCell className="py-1 px-2">
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
};

export default FinishedGoodsTableRow;
