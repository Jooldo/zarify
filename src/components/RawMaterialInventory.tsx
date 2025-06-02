
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, AlertTriangle } from 'lucide-react';

const RawMaterialInventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const rawMaterials = [
    {
      id: 1,
      name: "Silver Chain",
      type: "Chain",
      currentStock: 15,
      minimumStock: 50,
      unit: "meters",
      lastUpdated: "2024-06-01",
      supplier: "Mumbai Silver Co.",
      costPerUnit: 120
    },
    {
      id: 2,
      name: "Gold Kunda",
      type: "Kunda",
      currentStock: 8,
      minimumStock: 20,
      unit: "pieces",
      lastUpdated: "2024-05-30",
      supplier: "Rajasthan Crafts",
      costPerUnit: 25
    },
    {
      id: 3,
      name: "Small Ghungroo",
      type: "Ghungroo",
      currentStock: 25,
      minimumStock: 100,
      unit: "pieces",
      lastUpdated: "2024-06-02",
      supplier: "Delhi Accessories",
      costPerUnit: 5
    },
    {
      id: 4,
      name: "Cotton Thread",
      type: "Thread",
      currentStock: 5,
      minimumStock: 10,
      unit: "rolls",
      lastUpdated: "2024-05-29",
      supplier: "Local Supplier",
      costPerUnit: 15
    },
    {
      id: 5,
      name: "Brass Beads",
      type: "Beads",
      currentStock: 150,
      minimumStock: 100,
      unit: "pieces",
      lastUpdated: "2024-06-01",
      supplier: "Artisan Supplies",
      costPerUnit: 2
    },
    {
      id: 6,
      name: "Silk Thread",
      type: "Thread",
      currentStock: 12,
      minimumStock: 15,
      unit: "rolls",
      lastUpdated: "2024-05-31",
      supplier: "Textile Hub",
      costPerUnit: 30
    }
  ];

  const materialTypes = ["all", "Chain", "Kunda", "Ghungroo", "Thread", "Beads"];

  const filteredMaterials = rawMaterials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || material.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStockStatus = (current, minimum) => {
    if (current <= minimum / 2) return { status: "Critical", variant: "destructive" };
    if (current <= minimum) return { status: "Low", variant: "secondary" };
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
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {materialTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Material
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Raw Material</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="materialName">Material Name</Label>
                <Input id="materialName" placeholder="Enter material name" />
              </div>
              <div>
                <Label htmlFor="materialType">Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {materialTypes.slice(1).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentStock">Current Stock</Label>
                  <Input id="currentStock" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="minStock">Minimum Stock</Label>
                  <Input id="minStock" type="number" placeholder="0" />
                </div>
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="meters">Meters</SelectItem>
                    <SelectItem value="rolls">Rolls</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1">Add Material</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => {
          const stockInfo = getStockStatus(material.currentStock, material.minimumStock);
          return (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{material.name}</CardTitle>
                    <p className="text-sm text-gray-600">{material.type}</p>
                  </div>
                  <Badge variant={stockInfo.variant} className="flex items-center gap-1">
                    {stockInfo.status === "Critical" && <AlertTriangle className="h-3 w-3" />}
                    {stockInfo.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Current Stock</p>
                    <p className="font-medium">{material.currentStock} {material.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Minimum Stock</p>
                    <p className="font-medium">{material.minimumStock} {material.unit}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Cost/Unit</p>
                    <p className="font-medium">₹{material.costPerUnit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="font-medium">₹{(material.currentStock * material.costPerUnit).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Supplier</p>
                  <p className="font-medium text-sm">{material.supplier}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="text-sm">{new Date(material.lastUpdated).toLocaleDateString()}</p>
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
                        <DialogTitle>Update Stock - {material.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Current Stock: {material.currentStock} {material.unit}</Label>
                        </div>
                        <div>
                          <Label htmlFor="newStock">New Stock Quantity</Label>
                          <Input id="newStock" type="number" placeholder={material.currentStock.toString()} />
                        </div>
                        <div>
                          <Label htmlFor="reason">Reason for Update</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="purchase">New Purchase</SelectItem>
                              <SelectItem value="consumption">Material Used</SelectItem>
                              <SelectItem value="wastage">Wastage/Loss</SelectItem>
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

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No materials found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default RawMaterialInventory;
