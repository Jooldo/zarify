
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Package } from 'lucide-react';

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

  const getStockStatus = (stock) => {
    if (stock <= 2) return { status: "Low", variant: "destructive" };
    if (stock <= 5) return { status: "Medium", variant: "secondary" };
    return { status: "Good", variant: "default" };
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">{filteredGoods.reduce((sum, item) => sum + item.currentStock, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-500 p-3 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Product Types</p>
                <p className="text-2xl font-bold">{filteredGoods.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-500 p-3 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">₹{filteredGoods.reduce((sum, item) => sum + item.totalValue, 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGoods.map((item) => {
          const stockInfo = getStockStatus(item.currentStock);
          return (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{item.subcategory}</CardTitle>
                    <p className="text-sm text-gray-600">{item.category}</p>
                  </div>
                  <Badge variant={stockInfo.variant}>
                    {stockInfo.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Size</p>
                    <p className="font-medium">{item.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Stock</p>
                    <p className="font-medium">{item.currentStock} pieces</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Avg Price</p>
                    <p className="font-medium">₹{item.averagePrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="font-medium">₹{item.totalValue.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Last Produced</p>
                  <p className="text-sm">{new Date(item.lastProduced).toLocaleDateString()}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        Update Stock
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
              </CardContent>
            </Card>
          );
        })}
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
