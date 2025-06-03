
import { useState } from 'react';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import InventoryHeader from './inventory/InventoryHeader';
import InventoryTableRow from './inventory/InventoryTableRow';

const FinishedGoodsInventory = () => {
  const { finishedGoods, loading } = useFinishedGoods();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');

  const filteredGoods = finishedGoods.filter(item => {
    const matchesSearch = 
      item.product_config?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_config?.subcategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.product_config?.category === categoryFilter;
    const matchesSize = sizeFilter === 'all' || item.product_config?.size === sizeFilter;
    return matchesSearch && matchesCategory && matchesSize;
  });

  const getStockStatusVariant = (stock: number, threshold: number) => {
    if (stock > threshold) return "default" as const;
    if (stock === threshold) return "secondary" as const;
    return "destructive" as const;
  };

  const getShortfallStyles = (shortfall: number) => {
    if (shortfall < 0) return "bg-red-800 text-white hover:bg-red-800";
    if (shortfall > 0) return "bg-green-800 text-white hover:bg-green-800";
    return "bg-gray-500 text-white hover:bg-gray-500";
  };

  const calculateShortfall = (currentStock: number, inManufacturing: number, requiredQuantity: number, threshold: number) => {
    return currentStock + inManufacturing - (requiredQuantity + threshold);
  };

  const getShortfallDisplay = (shortfall: number) => {
    if (shortfall < 0) {
      return `Deficit of ${Math.abs(shortfall)}`;
    } else if (shortfall > 0) {
      return `Surplus of ${shortfall}`;
    } else {
      return "Balanced";
    }
  };

  const getShortfallTextColor = (shortfall: number) => {
    if (shortfall < 0) return "text-red-800 font-bold";
    if (shortfall > 0) return "text-green-800 font-bold";
    return "text-gray-600 font-bold";
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <InventoryHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        sizeFilter={sizeFilter}
        setSizeFilter={setSizeFilter}
      />

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="px-2 py-1 text-xs font-medium">Product Code</TableHead>
              <TableHead className="px-2 py-1 text-xs font-medium">Category</TableHead>
              <TableHead className="px-2 py-1 text-xs font-medium">Subcategory</TableHead>
              <TableHead className="px-2 py-1 text-xs font-medium">Size</TableHead>
              <TableHead className="px-2 py-1 text-xs font-medium">Current Stock</TableHead>
              <TableHead className="px-2 py-1 text-xs font-medium">Threshold</TableHead>
              <TableHead className="px-2 py-1 text-xs font-medium">Required Qty</TableHead>
              <TableHead className="px-2 py-1 text-xs font-medium">In Manufacturing</TableHead>
              <TableHead className="px-2 py-1 text-xs font-medium">Status</TableHead>
              <TableHead className="px-2 py-1 text-xs font-medium">Last Produced</TableHead>
              <TableHead className="px-2 py-1 text-xs font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGoods.map((item) => (
              <InventoryTableRow
                key={item.id}
                item={{
                  id: item.id,
                  productCode: item.product_code,
                  category: item.product_config?.category || '',
                  subcategory: item.product_config?.subcategory || '',
                  size: item.product_config?.size || '',
                  currentStock: item.current_stock,
                  threshold: item.threshold,
                  requiredQuantity: item.required_quantity,
                  inManufacturing: item.in_manufacturing,
                  lastProduced: item.last_produced || ''
                }}
                getStockStatusVariant={getStockStatusVariant}
                getShortfallStyles={getShortfallStyles}
                calculateShortfall={calculateShortfall}
                getShortfallDisplay={getShortfallDisplay}
                getShortfallTextColor={getShortfallTextColor}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredGoods.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No finished goods found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default FinishedGoodsInventory;
