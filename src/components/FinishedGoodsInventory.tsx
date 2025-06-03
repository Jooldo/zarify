
import { useState } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import InventoryHeader from './inventory/InventoryHeader';
import InventoryTableRow from './inventory/InventoryTableRow';

const FinishedGoodsInventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');

  const finishedGoods = [
    {
      id: 1,
      productCode: "TRD-MN-25",
      category: "Traditional",
      subcategory: "Meena Work",
      size: "0.25m",
      currentStock: 8,
      threshold: 10,
      requiredQuantity: 15,
      inManufacturing: 5,
      lastProduced: "2024-05-30"
    },
    {
      id: 2,
      productCode: "TRD-KN-30",
      category: "Traditional",
      subcategory: "Kundan Work",
      size: "0.30m",
      currentStock: 5,
      threshold: 8,
      requiredQuantity: 12,
      inManufacturing: 3,
      lastProduced: "2024-05-28"
    },
    {
      id: 3,
      productCode: "MOD-SC-20",
      category: "Modern",
      subcategory: "Silver Chain",
      size: "0.20m",
      currentStock: 12,
      threshold: 6,
      requiredQuantity: 10,
      inManufacturing: 2,
      lastProduced: "2024-06-01"
    },
    {
      id: 4,
      productCode: "TRD-TS-35",
      category: "Traditional",
      subcategory: "Temple Style",
      size: "0.35m",
      currentStock: 3,
      threshold: 5,
      requiredQuantity: 8,
      inManufacturing: 1,
      lastProduced: "2024-05-25"
    },
    {
      id: 5,
      productCode: "MOD-BD-25",
      category: "Modern",
      subcategory: "Beaded",
      size: "0.25m",
      currentStock: 15,
      threshold: 10,
      requiredQuantity: 12,
      inManufacturing: 0,
      lastProduced: "2024-06-02"
    },
    {
      id: 6,
      productCode: "BRD-HT-40",
      category: "Bridal",
      subcategory: "Heavy Traditional",
      size: "0.40m",
      currentStock: 2,
      threshold: 4,
      requiredQuantity: 6,
      inManufacturing: 2,
      lastProduced: "2024-05-20"
    }
  ];

  const filteredGoods = finishedGoods.filter(item => {
    const matchesSearch = 
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSize = sizeFilter === 'all' || item.size === sizeFilter;
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
                item={item}
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
