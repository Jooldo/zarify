
import { useState } from 'react';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import FinishedGoodsHeader from './inventory/FinishedGoodsHeader';
import FinishedGoodsTable from './inventory/FinishedGoodsTable';
import FinishedGoodsEmptyState from './inventory/FinishedGoodsEmptyState';
import ViewFinishedGoodDialog from './inventory/ViewFinishedGoodDialog';
import StockUpdateDialog from './inventory/StockUpdateDialog';

const FinishedGoodsInventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStockUpdateDialogOpen, setIsStockUpdateDialogOpen] = useState(false);
  const { finishedGoods, loading, refetch } = useFinishedGoods();

  console.log('FinishedGoodsInventory rendered with:', finishedGoods.length, 'products');

  // Filter for active products only and apply search
  const filteredProducts = finishedGoods
    .filter(product => {
      // Only show active products (assuming product_config has is_active field)
      const isActive = product.product_config?.is_active !== false;
      const matchesSearch = product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.product_config?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.product_config?.subcategory?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return isActive && matchesSearch;
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

  if (loading) {
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
      <FinishedGoodsHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={handleRefresh}
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
