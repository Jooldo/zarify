
import { useState } from 'react';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import FinishedGoodsHeader from './inventory/FinishedGoodsHeader';
import FinishedGoodsTable from './inventory/FinishedGoodsTable';
import FinishedGoodsEmptyState from './inventory/FinishedGoodsEmptyState';
import ViewFinishedGoodDialog from './inventory/ViewFinishedGoodDialog';
import EditFinishedGoodDialog from './inventory/EditFinishedGoodDialog';
import DeleteFinishedGoodDialog from './inventory/DeleteFinishedGoodDialog';

const FinishedGoodsInventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleDeleteProduct = (product: any) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
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
        onDeleteProduct={handleDeleteProduct}
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

      <EditFinishedGoodDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        product={selectedProduct}
        onProductUpdated={refetch}
      />

      <DeleteFinishedGoodDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        product={selectedProduct}
        onProductDeleted={refetch}
      />
    </div>
  );
};

export default FinishedGoodsInventory;
