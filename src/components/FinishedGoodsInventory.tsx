
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import FinishedGoodsHeader from './inventory/FinishedGoodsHeader';
import FinishedGoodsTable from './inventory/FinishedGoodsTable';
import FinishedGoodsEmptyState from './inventory/FinishedGoodsEmptyState';
import ViewFinishedGoodDialog from './inventory/ViewFinishedGoodDialog';
import StockUpdateDialog from './inventory/StockUpdateDialog';
import TagAuditTrail from './inventory/TagAuditTrail';
import FinishedGoodsFilter from './inventory/FinishedGoodsFilter';
import SortDropdown from './ui/sort-dropdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FinishedGoodsInventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStockUpdateDialogOpen, setIsStockUpdateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);
  
  const { finishedGoods, loading, refetch } = useFinishedGoods();
  const queryClient = useQueryClient();

  const sortOptions = [
    { value: 'ordered_qty', label: 'Live Orders' },
    { value: 'current_stock', label: 'Current Stock' },
    { value: 'in_manufacturing', label: 'In Manufacturing' },
    { value: 'shortfall', label: 'Shortfall' }
  ];

  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    setSortConfig({ field, direction });
  };

  console.log('FinishedGoodsInventory rendered with:', finishedGoods.length, 'products');

  const applyFilters = (products: any[], appliedFilters: any) => {
    return products.filter(product => {
      // Only show active products
      const isActive = product.product_config?.is_active !== false;
      
      const matchesSearch = product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.product_config?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.product_config?.subcategory?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!isActive || !matchesSearch) return false;

      // Category filter
      if (appliedFilters.category && product.product_config?.category !== appliedFilters.category) return false;
      
      // Subcategory filter
      if (appliedFilters.subcategory && product.product_config?.subcategory !== appliedFilters.subcategory) return false;
      
      // Size filter
      if (appliedFilters.size) {
        const sizeValue = product.product_config?.size_value?.toFixed(2) + 'm';
        if (sizeValue !== appliedFilters.size) return false;
      }
      
      // Stock level filter
      if (appliedFilters.stockLevel) {
        const currentStock = product.current_stock || 0;
        const threshold = product.threshold || 0;
        
        if (appliedFilters.stockLevel === 'In Stock' && currentStock <= 0) return false;
        if (appliedFilters.stockLevel === 'Low Stock' && (currentStock <= 0 || currentStock > threshold)) return false;
        if (appliedFilters.stockLevel === 'Out of Stock' && currentStock > 0) return false;
      }
      
      // Tag enabled filter
      if (appliedFilters.tagEnabled) {
        if (appliedFilters.tagEnabled === 'enabled' && !product.tag_enabled) return false;
        if (appliedFilters.tagEnabled === 'disabled' && product.tag_enabled) return false;
      }
      
      // Stock range filters
      if (appliedFilters.minStock && product.current_stock < parseInt(appliedFilters.minStock)) return false;
      if (appliedFilters.maxStock && product.current_stock > parseInt(appliedFilters.maxStock)) return false;
      
      // Quick filters
      if (appliedFilters.hasThreshold && (!product.threshold || product.threshold === 0)) return false;
      if (appliedFilters.lowStock && product.current_stock > (product.threshold || 0)) return false;
      if (appliedFilters.inManufacturing && (!product.in_manufacturing || product.in_manufacturing === 0)) return false;
      
      return true;
    });
  };

  // Filter for active products only and apply search/filters
  const filteredProducts = applyFilters(finishedGoods, filters);

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
    // Invalidate related queries to ensure all data is fresh
    queryClient.invalidateQueries({ queryKey: ['finished-goods'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['product-configs'] });
    queryClient.invalidateQueries({ queryKey: ['raw-materials'] }); // Also refresh raw materials
  };

  const handleTagOperationComplete = async () => {
    await refetch();
    queryClient.invalidateQueries({ queryKey: ['finished-goods'] });
    queryClient.invalidateQueries({ queryKey: ['inventory-tags'] });
    queryClient.invalidateQueries({ queryKey: ['raw-materials'] }); // Also refresh raw materials
  };

  const handleProductUpdate = async () => {
    await refetch();
    queryClient.invalidateQueries({ queryKey: ['finished-goods'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['raw-materials'] }); // Also refresh raw materials
  };

  const categories = [...new Set(finishedGoods.map(product => product.product_config?.category).filter(Boolean))];
  const subcategories = [...new Set(finishedGoods.map(product => product.product_config?.subcategory).filter(Boolean))];

  if (loading && activeTab === 'inventory') {
    return (
      <div className="space-y-4">
        <FinishedGoodsHeader
          onRefresh={() => {}}
        />
        <div className="text-center py-8">
          <div className="text-lg">Loading finished goods...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory">Inventory Management</TabsTrigger>
          <TabsTrigger value="audit">Tag Audit Trail</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory" className="space-y-4 mt-4">
           <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-heading">Finished Goods Inventory</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your final products, track stock levels, and handle inventory tagging.
            </p>
          </div>
          <FinishedGoodsHeader
            onRefresh={handleRefresh}
            onTagOperationComplete={handleTagOperationComplete}
          />
          
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-8"
              />
            </div>
            <FinishedGoodsFilter
              onFiltersChange={setFilters}
              categories={categories}
              subcategories={subcategories}
            />
            <SortDropdown
              options={sortOptions}
              onSortChange={handleSortChange}
              currentSort={sortConfig}
            />
          </div>
          
          <FinishedGoodsTable 
            products={filteredProducts}
            onViewProduct={handleViewProduct}
            onEditProduct={handleEditProduct}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
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
        onProductUpdated={handleProductUpdate}
      />
    </div>
  );
};

export default FinishedGoodsInventory;
