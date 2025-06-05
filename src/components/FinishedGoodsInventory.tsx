
import { useState } from 'react';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import FinishedGoodsHeader from './inventory/FinishedGoodsHeader';
import FinishedGoodsTable from './inventory/FinishedGoodsTable';
import FinishedGoodsEmptyState from './inventory/FinishedGoodsEmptyState';
import ViewFinishedGoodDialog from './inventory/ViewFinishedGoodDialog';

const FinishedGoodsInventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { finishedGoods, loading, refetch } = useFinishedGoods();

  console.log('FinishedGoodsInventory rendered with:', finishedGoods.length, 'products');

  const filteredProducts = finishedGoods.filter(product =>
    product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_config?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_config?.subcategory?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewProduct = (product: any) => {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
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
          onProductAdded={() => {}}
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
        onProductAdded={refetch}
      />
      
      <FinishedGoodsTable 
        products={filteredProducts}
        onViewProduct={handleViewProduct}
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
    </div>
  );
};

export default FinishedGoodsInventory;
