
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit } from 'lucide-react';

const FinishedGoodsInventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');

  const finishedGoods = [
    {
      id: 1,
      category: "Traditional",
      subcategory: "Meena Work",
      size: "0.25m",
      currentStock: 8,
      averagePrice: 800,
      lastProduced: "2024-05-30",
      totalValue: 6400
    },
    {
      id: 2,
      category: "Traditional",
      subcategory: "Kundan Work",
      size: "0.30m",
      currentStock: 5,
      averagePrice: 1200,
      lastProduced: "2024-05-28",
      totalValue: 6000
    },
    {
      id: 3,
      category: "Modern",
      subcategory: "Silver Chain",
      size: "0.20m",
      currentStock: 12,
      averagePrice: 600,
      lastProduced: "2024-06-01",
      totalValue: 7200
    },
    {
      id: 4,
      category: "Traditional",
      subcategory: "Temple Style",
      size: "0.35m",
      currentStock: 3,
      averagePrice: 1400,
      lastProduced: "2024-05-25",
      totalValue: 4200
    },
    {
      id: 5,
      category: "Modern",
      subcategory: "Beaded",
      size: "0.25m",
      currentStock: 15,
      averagePrice: 450,
      lastProduced: "2024-06-02",
      totalValue: 6750
    },
    {
      id: 6,
      category: "Bridal",
      subcategory: "Heavy Traditional",
      size: "0.40m",
      currentStock: 2,
      averagePrice: 2500,
      lastProduced: "2024-05-20",
      totalValue: 5000
    }
  ];

  const categories = ["all", "Traditional", "Modern", "Bridal"];
  const sizes = ["all", "0.20m", "0.25m", "0.30m", "0.35m", "0.40m"];

  const filteredGoods = finishedGoods.filter(item => {
    const matchesSearch = 
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSize = sizeFilter === 'all' || item.size === sizeFilter;
    return matchesSearch && matchesCategory && matchesSize;
  });

  const getStockStatusVariant = (stock: number) => {
    if (stock <= 2) return "destructive" as const;
    if (stock <= 5) return "secondary" as const;
    return "default" as const;
  };

  const getStockStatusText = (stock: number) => {
    if (stock <= 2) return "Low";
    if (stock <= 5) return "Medium";
    return "Good";
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search finished goods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
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
            <SelectTrigger className="w-32">
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
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
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
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" placeholder="0" />
                </div>
              </div>
              <div>
                <Label htmlFor="price">Average Price (₹)</Label>
                <Input id="price" type="number" placeholder="0" />
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
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Subcategory</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Average Price</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead>Last Produced</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGoods.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.category}</TableCell>
                <TableCell>{item.subcategory}</TableCell>
                <TableCell>{item.size}</TableCell>
                <TableCell>{item.currentStock} pieces</TableCell>
                <TableCell>
                  <Badge variant={getStockStatusVariant(item.currentStock)}>
                    {getStockStatusText(item.currentStock)}
                  </Badge>
                </TableCell>
                <TableCell>₹{item.averagePrice}</TableCell>
                <TableCell className="font-medium">₹{item.totalValue.toLocaleString()}</TableCell>
                <TableCell>{new Date(item.lastProduced).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Update
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Stock - {item.subcategory}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Current Stock: {item.currentStock} pieces</Label>
                          </div>
                          <div>
                            <Label htmlFor="newStock">New Stock Quantity</Label>
                            <Input id="newStock" type="number" placeholder={item.currentStock.toString()} />
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
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredGoods.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No finished goods found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default FinishedGoodsInventory;
