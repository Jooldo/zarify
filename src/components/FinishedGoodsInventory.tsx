
import { useState } from 'react';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import FinishedGoodsHeader from './inventory/FinishedGoodsHeader';
import FinishedGoodsTable from './inventory/FinishedGoodsTable';
import FinishedGoodsEmptyState from './inventory/FinishedGoodsEmptyState';
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
  
  const { finishedGoods, loading, refetch } = useFinishedGoods();

  console.log('FinishedGoodsInventory rendered with:', finishedGoods.length, 'products');

  // Filter for active products only and apply search
  const filteredProducts = finishedGoods
    .filter(product => {
      // Only show active products
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

  const handleTagOperationComplete = () => {
    refetch();
  };

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
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory">Inventory Management</TabsTrigger>
          <TabsTrigger value="audit">Tag Audit Trail</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory" className="space-y-4 mt-4">
          <FinishedGoodsHeader
            onRefresh={handleRefresh}
            onTagOperationComplete={handleTagOperationComplete}
          />
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
          
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
