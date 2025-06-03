
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import CreateProductConfigForm from '@/components/CreateProductConfigForm';

const ProductConfigTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateConfigOpen, setIsCreateConfigOpen] = useState(false);

  const productConfigs = [
    {
      id: "PC-001",
      category: "Traditional",
      subcategory: "Meena Work",
      size: "Small (0.20m)",
      productCode: "TRD-MNA-SM",
      basePrice: 800,
      materialCost: 300,
      laborCost: 200,
      isActive: true
    },
    {
      id: "PC-002", 
      category: "Traditional",
      subcategory: "Meena Work",
      size: "Medium (0.25m)",
      productCode: "TRD-MNA-MD",
      basePrice: 1000,
      materialCost: 400,
      laborCost: 250,
      isActive: true
    },
    {
      id: "PC-003",
      category: "Traditional",
      subcategory: "Kundan Work", 
      size: "Large (0.30m)",
      productCode: "TRD-KND-LG",
      basePrice: 1600,
      materialCost: 600,
      laborCost: 400,
      isActive: true
    },
    {
      id: "PC-004",
      category: "Modern",
      subcategory: "Silver Chain",
      size: "Small (0.20m)",
      productCode: "MOD-SLV-SM",
      basePrice: 450,
      materialCost: 200,
      laborCost: 100,
      isActive: true
    },
    {
      id: "PC-005",
      category: "Bridal",
      subcategory: "Heavy Traditional",
      size: "Extra Large (0.35m)",
      productCode: "BRD-HVY-XL",
      basePrice: 2500,
      materialCost: 1000,
      laborCost: 800,
      isActive: false
    }
  ];

  const filteredConfigs = productConfigs.filter(config => 
    config.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.productCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <TableHead className="py-1 px-2 text-xs font-medium">Config ID</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Product Code</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Category</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Subcategory</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Size</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Base Price</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Material Cost</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Labor Cost</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Status</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConfigs.map((config) => (
              <TableRow key={config.id} className="h-10">
                <TableCell className="py-1 px-2 text-xs font-medium">{config.id}</TableCell>
                <TableCell className="py-1 px-2 text-xs font-mono bg-gray-50">{config.productCode}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{config.category}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{config.subcategory}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{config.size}</TableCell>
                <TableCell className="py-1 px-2 text-xs font-medium">₹{config.basePrice.toLocaleString()}</TableCell>
                <TableCell className="py-1 px-2 text-xs">₹{config.materialCost.toLocaleString()}</TableCell>
                <TableCell className="py-1 px-2 text-xs">₹{config.laborCost.toLocaleString()}</TableCell>
                <TableCell className="py-1 px-2">
                  <Badge variant={config.isActive ? "default" : "secondary"} className="text-xs px-1 py-0">
                    {config.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="py-1 px-2">
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                      <Trash2 className="h-3 w-3" />
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
    </div>
  );
};

export default ProductConfigTab;
