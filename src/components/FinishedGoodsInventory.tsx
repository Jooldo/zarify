
import { useState } from 'react';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import FinishedGoodsHeader from './inventory/FinishedGoodsHeader';
import FinishedGoodsTable from './inventory/FinishedGoodsTable';
import FinishedGoodsEmptyState from './inventory/FinishedGoodsEmptyState';
import SwiggyStyleFilters from './inventory/SwiggyStyleFilters';
import ViewFinishedGoodDialog from './inventory/ViewFinishedGoodDialog';
import StockUpdateDialog from './inventory/StockUpdateDialog';
import TagAuditTrail from './inventory/TagAuditTrail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FinishedGoodsInventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStockUpdateDialogOpen, setIsStockUpdateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    stockLevel: 'all',
    sizeRange: 'all',
    shortfallRange: 'all',
    inStock: false,
    critical: false,
    manufacturing: false
  });
  
  const { finishedGoods, loading, refetch } = useFinishedGoods();

  console.log('FinishedGoodsInventory rendered with:', finishedGoods.length, 'products');

  // Get unique categories for filter options
  const categories = [...new Set(finishedGoods.map(product => product.product_config?.category).filter(Boolean))];

  // Filter for active products only and apply search and filters
  const filteredProducts = finishedGoods
    .filter(product => {
      // Only show active products
      const isActive = product.product_config?.is_active !== false;
      
      const matchesSearch = product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.product_config?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.product_config?.subcategory?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filters.category === 'all' || product.product_config?.category === filters.category;
      
      // Calculate shortfall for filtering
      const shortfall = Math.max(product.required_quantity, product.threshold) - (product.current_stock + product.in_manufacturing);
      
      // Handle toggle filters
      if (filters.inStock && product.current_stock <= product.threshold) return false;
      if (filters.critical && shortfall <= 0) return false;
      if (filters.manufacturing && product.in_manufacturing === 0) return false;
      
      let matchesStatus = true;
      if (filters.status === 'Critical') {
        matchesStatus = shortfall > 0;
      } else if (filters.status === 'Low') {
        matchesStatus = product.current_stock <= product.threshold && shortfall <= 0;
      } else if (filters.status === 'Good') {
        matchesStatus = product.current_stock > product.threshold && shortfall <= 0;
      } else if (filters.status === 'Procurement Needed') {
        matchesStatus = shortfall > 0;
      } else if (filters.status !== 'all') {
        matchesStatus = false;
      }

      let matchesStockLevel = true;
      if (filters.stockLevel === 'critical') {
        matchesStockLevel = product.current_stock <= product.threshold;
      } else if (filters.stockLevel === 'low') {
        matchesStockLevel = product.current_stock <= product.threshold * 1.5 && product.current_stock > product.threshold;
      } else if (filters.stockLevel === 'normal') {
        matchesStockLevel = product.current_stock > product.threshold * 1.5;
      }

      let matchesSizeRange = true;
      if (filters.sizeRange === 'small') {
        matchesSizeRange = product.product_config?.size_value <= 12;
      } else if (filters.sizeRange === 'medium') {
        matchesSizeRange = product.product_config?.size_value >= 13 && product.product_config?.size_value <= 18;
      } else if (filters.sizeRange === 'large') {
        matchesSizeRange = product.product_config?.size_value > 18;
      }

      let matchesShortfallRange = true;
      if (filters.shortfallRange === 'surplus') {
        matchesShortfallRange = shortfall <= 0;
      } else if (filters.shortfallRange === 'low') {
        matchesShortfallRange = shortfall >= 1 && shortfall <= 50;
      } else if (filters.shortfallRange === 'medium') {
        matchesShortfallRange = shortfall >= 51 && shortfall <= 200;
      } else if (filters.shortfallRange === 'high') {
        matchesShortfallRange = shortfall > 200;
      }
      
      return isActive && matchesSearch && matchesCategory && matchesStatus && matchesStockLevel && matchesSizeRange && matchesShortfallRange;
    });

  const handleViewProduct = (product: any) => {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setIsStockUpdateDialogOpen(true);
  };

  const handleRefresh = async () => {
    console.log('Manual refresh triggered for finished goods');
    await refetch();
  };

  const handleTagOperationComplete = () => {
    refetch();
  };

  if (loading && activeTab === 'inventory') {
    return (
      <div className="space-y-4">
        <FinishedGoodsHeader
          searchTerm=""
          onSearchChange={() => {}}
          onRefresh={() => {}}
        />
        <div className="text-center py-8">
          <div className="text-lg">Loading finished goods...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory">Inventory Management</TabsTrigger>
          <TabsTrigger value="audit">Tag Audit Trail</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory" className="space-y-4 mt-4">
          <FinishedGoodsHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRefresh={handleRefresh}
            onTagOperationComplete={handleTagOperationComplete}
          />
          
          <SwiggyStyleFilters
            filters={filters}
            onFiltersChange={setFilters}
            categories={categories}
            filterType="finishedGoods"
          />
          
          <FinishedGoodsTable 
            products={filteredProducts}
            onViewProduct={handleViewProduct}
            onEditProduct={handleEditProduct}
          />

          <FinishedGoodsEmptyState 
            hasProducts={finishedGoods.length > 0}
            filteredCount={filteredProducts.length}
          />
        </TabsContent>
        
        <TabsContent value="audit" className="space-y-4 mt-4">
          <TagAuditTrail />
        </TabsContent>
      </Tabs>

      <ViewFinishedGoodDialog
        product={selectedProduct}
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
      />

      <StockUpdateDialog
        isOpen={isStockUpdateDialogOpen}
        onOpenChange={setIsStockUpdateDialogOpen}
        product={selectedProduct}
        onProductUpdated={refetch}
      />
    </div>
  );
};

export default FinishedGoodsInventory;
