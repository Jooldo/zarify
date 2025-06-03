
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, Eye } from 'lucide-react';

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
      shortfall: 2, // currentStock + inManufacturing - requiredQuantity = 8 + 5 - 15 = -2
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
      shortfall: -4, // 5 + 3 - 12 = -4
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
      shortfall: 4, // 12 + 2 - 10 = 4
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
      shortfall: -4, // 3 + 1 - 8 = -4
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
      shortfall: 3, // 15 + 0 - 12 = 3
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
      shortfall: -2, // 2 + 2 - 6 = -2
      lastProduced: "2024-05-20"
    }
  ];

  // Mock raw materials data for demonstration
  const rawMaterialsRequired = {
    1: [
      { material: "Gold Wire (22K)", required: 20, available: 150, unit: "grams" },
      { material: "Meena Enamel", required: 10, available: 50, unit: "grams" },
      { material: "Silver Base", required: 40, available: 200, unit: "grams" }
    ],
    2: [
      { material: "Gold Wire (22K)", required: 32, available: 150, unit: "grams" },
      { material: "Kundan Stones", required: 8, available: 25, unit: "pieces" },
      { material: "Silver Base", required: 48, available: 200, unit: "grams" }
    ],
    3: [
      { material: "Silver Chain", required: 16, available: 80, unit: "meters" },
      { material: "Silver Clasps", required: 4, available: 20, unit: "pieces" }
    ]
  };

  const categories = ["all", "Traditional", "Modern", "Bridal"];
  const sizes = ["all", "0.20m", "0.25m", "0.30m", "0.35m", "0.40m"];

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
    if (stock <= threshold * 0.5) return "destructive" as const;
    if (stock <= threshold) return "secondary" as const;
    return "default" as const;
  };

  const getShortfallVariant = (shortfall: number) => {
    if (shortfall < 0) return "destructive" as const;
    if (shortfall === 0) return "secondary" as const;
    return "default" as const;
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search finished goods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 h-8">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sizeFilter} onValueChange={setSizeFilter}>
            <SelectTrigger className="w-28 h-8">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size === 'all' ? 'All Sizes' : size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 h-8 px-3 text-xs">
              <Plus className="h-3 w-3" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Finished Goods</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input id="subcategory" placeholder="Enter subcategory" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="size">Size</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.slice(1).map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Current Stock</Label>
                  <Input id="quantity" type="number" placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="threshold">Threshold</Label>
                  <Input id="threshold" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="required">Required Quantity</Label>
                  <Input id="required" type="number" placeholder="0" />
                </div>
              </div>
              <Button className="w-full">Add to Inventory</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Finished Goods Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="px-2 py-1 text-xs font-medium">Product Code</TableHead>
              <TableHead className="px-2 py-1 text-xs font-medium">Category</TableHead>
              <TableHead className="px-2 py-1 text-xs font-medium">Subcategory</TableHead>
              <TableHead className="px-2 py-1 text-xs font-medium">Size</TableHead>
              <TableHead className="px-2 py-1 text-xs font-medium bg-blue-50">Current Stock</TableHead>
              <TableHead className="px-2 py-1 text-xs font-medium bg-blue-50">Threshold</TableHead>
              <TableHead className="px-2 py-1 text-xs font-medium bg-blue-50">Required Qty</TableHead>
              <TableHead className="px-2 py-1 text-xs font-medium bg-blue-50">In Manufacturing</TableHead>
              <TableHead className="px-2 py-1 text-xs font-medium bg-blue-50">Shortfall</TableHead>
              <TableHead className="px-2 py-1 text-xs font-medium">Last Produced</TableHead>
              <TableHead className="px-2 py-1 text-xs font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGoods.map((item) => (
              <TableRow key={item.id} className="h-10">
                <TableCell className="px-2 py-1 font-mono text-xs bg-gray-50">{item.productCode}</TableCell>
                <TableCell className="px-2 py-1 text-xs">{item.category}</TableCell>
                <TableCell className="px-2 py-1 text-xs">{item.subcategory}</TableCell>
                <TableCell className="px-2 py-1 text-xs">{item.size}</TableCell>
                <TableCell className="px-2 py-1 bg-blue-50">
                  <Badge variant={getStockStatusVariant(item.currentStock, item.threshold)} className="text-xs px-2 py-1 font-bold">
                    {item.currentStock}
                  </Badge>
                </TableCell>
                <TableCell className="px-2 py-1 text-xs bg-blue-50 font-medium">{item.threshold}</TableCell>
                <TableCell className="px-2 py-1 text-xs bg-blue-50 font-medium">{item.requiredQuantity}</TableCell>
                <TableCell className="px-2 py-1 text-xs bg-blue-50 font-medium">{item.inManufacturing}</TableCell>
                <TableCell className="px-2 py-1 bg-blue-50">
                  <Badge variant={getShortfallVariant(item.shortfall)} className="text-xs px-2 py-1 font-bold">
                    {item.shortfall > 0 ? `+${item.shortfall}` : item.shortfall}
                  </Badge>
                </TableCell>
                <TableCell className="px-2 py-1 text-xs">{new Date(item.lastProduced).toLocaleDateString()}</TableCell>
                <TableCell className="px-2 py-1">
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Raw Materials Required - {item.productCode}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="font-medium">Shortfall Quantity:</Label>
                              <div className="text-lg font-bold text-red-600">
                                {Math.abs(item.shortfall)} units needed
                              </div>
                            </div>
                            <div>
                              <Label className="font-medium">Current Stock:</Label>
                              <div className="text-lg font-bold text-blue-600">
                                {item.currentStock} units
                              </div>
                            </div>
                          </div>
                          
                          {item.shortfall < 0 && (
                            <div className="space-y-3">
                              <h4 className="font-medium text-sm">Raw Materials Required for Production:</h4>
                              <div className="border rounded-lg">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="h-8">
                                      <TableHead className="text-xs">Material</TableHead>
                                      <TableHead className="text-xs">Required per Unit</TableHead>
                                      <TableHead className="text-xs">Total Required</TableHead>
                                      <TableHead className="text-xs">Available</TableHead>
                                      <TableHead className="text-xs">Status</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {(rawMaterialsRequired[item.id] || []).map((material, index) => {
                                      const totalRequired = material.required * Math.abs(item.shortfall);
                                      const shortage = Math.max(0, totalRequired - material.available);
                                      return (
                                        <TableRow key={index} className="h-8">
                                          <TableCell className="text-xs">{material.material}</TableCell>
                                          <TableCell className="text-xs">{material.required} {material.unit}</TableCell>
                                          <TableCell className="text-xs font-medium">{totalRequired} {material.unit}</TableCell>
                                          <TableCell className="text-xs">{material.available} {material.unit}</TableCell>
                                          <TableCell className="text-xs">
                                            {shortage > 0 ? (
                                              <Badge variant="destructive" className="text-xs">
                                                Need {shortage} {material.unit}
                                              </Badge>
                                            ) : (
                                              <Badge variant="default" className="text-xs">
                                                Sufficient
                                              </Badge>
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          )}
                          
                          {item.shortfall >= 0 && (
                            <div className="text-center py-4 text-green-600 font-medium">
                              ✓ Stock levels are sufficient. No additional production needed.
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                          Update
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Stock - {item.productCode}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Current Stock: {item.currentStock} pieces</Label>
                            </div>
                            <div>
                              <Label>Threshold: {item.threshold} pieces</Label>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="newStock">New Stock Quantity</Label>
                              <Input id="newStock" type="number" placeholder={item.currentStock.toString()} />
                            </div>
                            <div>
                              <Label htmlFor="newThreshold">New Threshold</Label>
                              <Input id="newThreshold" type="number" placeholder={item.threshold.toString()} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="requiredQty">Required Quantity</Label>
                              <Input id="requiredQty" type="number" placeholder={item.requiredQuantity.toString()} />
                            </div>
                            <div>
                              <Label htmlFor="inManufacturing">In Manufacturing</Label>
                              <Input id="inManufacturing" type="number" placeholder={item.inManufacturing.toString()} />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="updateReason">Reason for Update</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select reason" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="production">New Production</SelectItem>
                                <SelectItem value="sale">Sold/Dispatched</SelectItem>
                                <SelectItem value="damage">Damaged/Defective</SelectItem>
                                <SelectItem value="correction">Stock Correction</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button className="w-full">Update Stock</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
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
