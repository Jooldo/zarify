
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import FinishedGoodsTableRow from './FinishedGoodsTableRow';
import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';

interface FinishedGoodsTableProps {
  products: any[];
  onViewProduct: (product: any) => void;
  onEditProduct: (product: any) => void;
  sortConfig: { field: string; direction: 'asc' | 'desc' } | null;
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
}

const FinishedGoodsTable = ({ 
  products, 
  onViewProduct, 
  onEditProduct,
  sortConfig,
  onSortChange 
}: FinishedGoodsTableProps) => {
  if (products.length === 0) {
    return (
      <TableSkeleton 
        rows={5} 
        columns={9} 
        columnWidths={[
          'w-32', 'w-24', 'w-20', 'w-20', 'w-20', 
          'w-28', 'w-24', 'w-24', 'w-20'
        ]}
      />
    );
  }

  const handleSort = (field: string) => {
    const direction = sortConfig?.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    onSortChange(field, direction);
  };

  const getSortIcon = (field: string) => {
    if (sortConfig?.field !== field) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="h-8 bg-gray-50">
            <TableHead className="py-1 px-2 text-xs font-medium">Product Code</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Category</TableHead>
            <TableHead 
              className="py-1 px-2 text-xs font-medium cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('current_stock')}
            >
              Current Stock {getSortIcon('current_stock')}
            </TableHead>
            <TableHead 
              className="py-1 px-2 text-xs font-medium cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('required_quantity')}
            >
              Remaining Orders {getSortIcon('required_quantity')}
            </TableHead>
            <TableHead 
              className="py-1 px-2 text-xs font-medium cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('in_manufacturing')}
            >
              In Manufacturing {getSortIcon('in_manufacturing')}
            </TableHead>
            <TableHead 
              className="py-1 px-2 text-xs font-medium cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('shortfall')}
            >
              Shortfall {getSortIcon('shortfall')}
            </TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Threshold</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Tag Enabled</TableHead>
            <TableHead className="py-1 px-2 text-xs font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <FinishedGoodsTableRow
              key={product.id}
              product={product}
              onViewProduct={onViewProduct}
              onEditProduct={onEditProduct}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FinishedGoodsTable;
