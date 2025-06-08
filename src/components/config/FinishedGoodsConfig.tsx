import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, AlertCircle, Edit, Eye } from 'lucide-react';
import CreateProductConfigForm from '@/components/CreateProductConfigForm';
import ViewProductConfigDialog from '@/components/inventory/ViewProductConfigDialog';
import EditProductConfigDialog from '@/components/inventory/EditProductConfigDialog';
import FinishedGoodsConfigFilter from '@/components/config/FinishedGoodsConfigFilter';
import { useProductConfigs } from '@/hooks/useProductConfigs';

const FinishedGoodsConfig = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateConfigOpen, setIsCreateConfigOpen] = useState(false);
  const [isViewConfigOpen, setIsViewConfigOpen] = useState(false);
  const [isEditConfigOpen, setIsEditConfigOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [filters, setFilters] = useState({});
  const { productConfigs, loading, createProductConfig, deleteProductConfig, refetch } = useProductConfigs();

  const applyFilters = (configs: any[], appliedFilters: any) => {
    return configs.filter(config => {
      const matchesSearch = config.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           config.subcategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           config.product_code?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // Category filter
      if (appliedFilters.category && config.category !== appliedFilters.category) return false;
      
      // Subcategory filter
      if (appliedFilters.subcategory && config.subcategory !== appliedFilters.subcategory) return false;
      
      // Size range filter
      if (appliedFilters.sizeRange) {
        const sizeValue = config.size_value || 0;
        const range = appliedFilters.sizeRange;
        
        if (range === '0.15-0.25m' && (sizeValue < 0.15 || sizeValue > 0.25)) return false;
        if (range === '0.26-0.35m' && (sizeValue < 0.26 || sizeValue > 0.35)) return false;
        if (range === '0.36-0.45m' && (sizeValue < 0.36 || sizeValue > 0.45)) return false;
        if (range === '0.46m+' && sizeValue < 0.46) return false;
      }
      
      // Status filter
      if (appliedFilters.status) {
        const status = config.is_active ? 'Active' : 'Inactive';
        if (status !== appliedFilters.status) return false;
      }
      
      // Active status filter
      if (appliedFilters.isActive) {
        if (appliedFilters.isActive === 'active' && !config.is_active) return false;
        if (appliedFilters.isActive === 'inactive' && config.is_active) return false;
      }
      
      // Quick filters
      if (appliedFilters.hasThreshold && (!config.threshold || config.threshold === 0)) return false;
      
      return true;
    });
  };

  const filteredConfigs = applyFilters(productConfigs, filters);

  const handleCreateConfig = async (configData: any) => {
    try {
      await createProductConfig(configData);
      setIsCreateConfigOpen(false);
    } catch (error) {
      console.error('Failed to create product config:', error);
    }
  };

  const handleViewConfig = (config: any) => {
    setSelectedConfig(config);
    setIsViewConfigOpen(true);
  };

  const handleEditConfig = (config: any) => {
    setSelectedConfig(config);
    setIsEditConfigOpen(true);
  };

  const handleConfigUpdate = () => {
    refetch();
    setIsEditConfigOpen(false);
  };

  const getDisplaySize = (config: any) => {
    // Display size_value directly as inches and weight_range as stored
    const sizeInInches = config.size_value?.toFixed(2) || 'N/A';
    if (config.weight_range) {
      return `${sizeInInches}" / ${config.weight_range}`;
    }
    return `${sizeInInches}"`;
  };

  const categories = [...new Set(productConfigs.map(config => config.category).filter(Boolean))];
  const subcategories = [...new Set(productConfigs.map(config => config.subcategory).filter(Boolean))];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="text-lg">Loading product configurations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search product configurations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
          <FinishedGoodsConfigFilter
            onFiltersChange={setFilters}
            categories={categories}
            subcategories={subcategories}
          />
        </div>
        <Dialog open={isCreateConfigOpen} onOpenChange={setIsCreateConfigOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 h-8 px-3 text-xs">
              <Plus className="h-3 w-3" />
              Add Product Config
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-sm">Create Product Configuration</DialogTitle>
            </DialogHeader>
            <CreateProductConfigForm 
              onClose={() => setIsCreateConfigOpen(false)}
              onSubmit={handleCreateConfig}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Product Configurations Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="py-1 px-2 text-xs font-medium">Product Code</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Category</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Subcategory</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Size & Weight</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Threshold</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Status</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConfigs.map((config) => (
              <TableRow key={config.id} className="h-10">
                <TableCell className="py-1 px-2 text-xs font-mono bg-gray-50">
                  {config.product_code}
                </TableCell>
                <TableCell className="py-1 px-2 text-xs font-medium">
                  {config.category}
                </TableCell>
                <TableCell className="py-1 px-2 text-xs">
                  {config.subcategory}
                </TableCell>
                <TableCell className="py-1 px-2 text-xs">
                  {getDisplaySize(config)}
                </TableCell>
                <TableCell className="py-1 px-2 text-xs font-medium">
                  {config.threshold || 'N/A'}
                </TableCell>
                <TableCell className="py-1 px-2 text-xs">
                  <Badge 
                    variant={config.is_active ? "default" : "secondary"} 
                    className="text-xs px-1 py-0"
                  >
                    {config.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="py-1 px-2 text-xs">
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => handleViewConfig(config)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => handleEditConfig(config)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Config Dialog */}
      <Dialog open={isViewConfigOpen} onOpenChange={setIsViewConfigOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Product Configuration Details</DialogTitle>
          </DialogHeader>
          {selectedConfig && (
            <ViewProductConfigDialog config={selectedConfig} />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Config Dialog */}
      <EditProductConfigDialog 
        config={selectedConfig}
        isOpen={isEditConfigOpen}
        onClose={() => setIsEditConfigOpen(false)}
        onUpdate={handleConfigUpdate}
        onDelete={deleteProductConfig}
      />

      {/* Empty state */}
      {filteredConfigs.length === 0 && !loading && (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">
            {productConfigs.length === 0 ? 'No product configurations found. Add some configurations to get started.' : 'No configurations found matching your search or filters.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default FinishedGoodsConfig;
