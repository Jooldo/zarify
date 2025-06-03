
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import CreateProductConfigForm from '@/components/CreateProductConfigForm';

const ProductConfigTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateConfigOpen, setIsCreateConfigOpen] = useState(false);
  const [isUpdateConfigOpen, setIsUpdateConfigOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [isViewMaterialsOpen, setIsViewMaterialsOpen] = useState(false);

  const productConfigs = [
    {
      id: "PC-001",
      category: "Traditional",
      subcategory: "Meena Work",
      size: "Small (0.20m)",
      productCode: "TRD-MEE-SM",
      isActive: true,
      rawMaterials: [
        { name: "Silver Chain", quantity: 0.3, unit: "meters" },
        { name: "Gold Kunda", quantity: 2, unit: "pieces" },
        { name: "Cotton Thread", quantity: 0.1, unit: "rolls" }
      ]
    },
    {
      id: "PC-002", 
      category: "Traditional",
      subcategory: "Meena Work",
      size: "Medium (0.25m)",
      productCode: "TRD-MEE-MD",
      isActive: true,
      rawMaterials: [
        { name: "Silver Chain", quantity: 0.4, unit: "meters" },
        { name: "Gold Kunda", quantity: 3, unit: "pieces" },
        { name: "Cotton Thread", quantity: 0.15, unit: "rolls" }
      ]
    },
    {
      id: "PC-003",
      category: "Traditional",
      subcategory: "Kundan Work", 
      size: "Large (0.30m)",
      productCode: "TRD-KUN-LG",
      isActive: true,
      rawMaterials: [
        { name: "Silver Chain", quantity: 0.5, unit: "meters" },
        { name: "Gold Kunda", quantity: 5, unit: "pieces" },
        { name: "Small Ghungroo", quantity: 8, unit: "pieces" }
      ]
    },
    {
      id: "PC-004",
      category: "Modern",
      subcategory: "Silver Chain",
      size: "Small (0.20m)",
      productCode: "MOD-SIL-SM",
      isActive: true,
      rawMaterials: [
        { name: "Silver Chain", quantity: 0.25, unit: "meters" },
        { name: "Brass Beads", quantity: 6, unit: "pieces" }
      ]
    },
    {
      id: "PC-005",
      category: "Bridal",
      subcategory: "Heavy Traditional",
      size: "Extra Large (0.35m)",
      productCode: "BRD-HEA-XL",
      isActive: false,
      rawMaterials: [
        { name: "Silver Chain", quantity: 0.7, unit: "meters" },
        { name: "Gold Kunda", quantity: 8, unit: "pieces" },
        { name: "Small Ghungroo", quantity: 12, unit: "pieces" },
        { name: "Silk Thread", quantity: 0.2, unit: "rolls" }
      ]
    }
  ];

  const filteredConfigs = productConfigs.filter(config => 
    config.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.productCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewMaterials = (config: any) => {
    setSelectedConfig(config);
    setIsViewMaterialsOpen(true);
  };

  const handleUpdate = (config: any) => {
    setSelectedConfig(config);
    setIsUpdateConfigOpen(true);
  };

  const handleDelete = (configId: string) => {
    console.log('Deleting product config:', configId);
    // Here you would typically make an API call to delete the config
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search product configurations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-8"
          />
        </div>
        <Dialog open={isCreateConfigOpen} onOpenChange={setIsCreateConfigOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 h-8 px-3 text-xs">
              <Plus className="h-3 w-3" />
              Add Product Config
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Product Configuration</DialogTitle>
            </DialogHeader>
            <CreateProductConfigForm onClose={() => setIsCreateConfigOpen(false)} />
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
              <TableHead className="py-1 px-2 text-xs font-medium">Size</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Status</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConfigs.map((config) => (
              <TableRow key={config.id} className="h-10">
                <TableCell className="py-1 px-2 text-xs font-mono bg-gray-50">{config.productCode}</TableCell>
                <TableCell className="py-1 px-2 text-xs font-medium">{config.category}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{config.subcategory}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{config.size}</TableCell>
                <TableCell className="py-1 px-2 text-xs">
                  <Badge variant={config.isActive ? "default" : "secondary"} className="text-xs px-1 py-0">
                    {config.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="py-1 px-2">
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => handleViewMaterials(config)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => handleUpdate(config)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 w-6 p-0 hover:bg-red-50 hover:border-red-200"
                      onClick={() => handleDelete(config.id)}
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredConfigs.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No product configurations found matching your search.</p>
        </div>
      )}

      {/* Update Product Config Dialog */}
      <Dialog open={isUpdateConfigOpen} onOpenChange={setIsUpdateConfigOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Product Configuration</DialogTitle>
          </DialogHeader>
          <CreateProductConfigForm 
            onClose={() => setIsUpdateConfigOpen(false)}
            initialData={selectedConfig}
            isUpdate={true}
          />
        </DialogContent>
      </Dialog>

      {/* Raw Materials Dialog */}
      <Dialog open={isViewMaterialsOpen} onOpenChange={setIsViewMaterialsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raw Materials Required - {selectedConfig?.productCode}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium">Product</div>
                <div className="text-xs text-gray-600">{selectedConfig?.category} - {selectedConfig?.subcategory}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Size</div>
                <div className="text-xs text-gray-600">{selectedConfig?.size}</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-3">Raw Materials per Unit</h4>
              <Table>
                <TableHeader>
                  <TableRow className="h-8">
                    <TableHead className="py-1 px-2 text-xs font-medium">Material</TableHead>
                    <TableHead className="py-1 px-2 text-xs font-medium">Quantity per Unit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedConfig?.rawMaterials?.map((material: any, index: number) => (
                    <TableRow key={index} className="h-8">
                      <TableCell className="py-1 px-2 text-xs font-medium">{material.name}</TableCell>
                      <TableCell className="py-1 px-2 text-xs">{material.quantity} {material.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsViewMaterialsOpen(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductConfigTab;
