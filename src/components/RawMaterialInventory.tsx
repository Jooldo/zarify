import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Edit, AlertTriangle, ClipboardList, Package } from 'lucide-react';
import ProcurementRequestsSection from '@/components/ProcurementRequestsSection';

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

  const getStockStatusVariant = (current: number, minimum: number) => {
    if (current <= minimum / 2) return "destructive" as const;
    if (current <= minimum) return "secondary" as const;
    return "default" as const;
  };

  const getStockStatusText = (current: number, minimum: number) => {
    if (current <= minimum / 2) return "Critical";
    if (current <= minimum) return "Low";
    return "Good";
  };

  return (
    <div className="space-y-4">
      {/* Main Tabs for Inventory and Procurement */}
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Raw Materials Inventory
          </TabsTrigger>
          <TabsTrigger value="procurement" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Procurement Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {/* Header with Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-8"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40 h-8">
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
                <Button className="flex items-center gap-2 h-8 px-3 text-xs">
                  <Plus className="h-3 w-3" />
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

          {/* Materials Table */}
          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="h-8">
                  <TableHead className="py-1 px-2 text-xs font-medium">Material Name</TableHead>
                  <TableHead className="py-1 px-2 text-xs font-medium">Type</TableHead>
                  <TableHead className="py-1 px-2 text-xs font-medium">Current Stock</TableHead>
                  <TableHead className="py-1 px-2 text-xs font-medium">Min Stock</TableHead>
                  <TableHead className="py-1 px-2 text-xs font-medium">Status</TableHead>
                  <TableHead className="py-1 px-2 text-xs font-medium">Cost/Unit</TableHead>
                  <TableHead className="py-1 px-2 text-xs font-medium">Total Value</TableHead>
                  <TableHead className="py-1 px-2 text-xs font-medium">Supplier</TableHead>
                  <TableHead className="py-1 px-2 text-xs font-medium">Updated</TableHead>
                  <TableHead className="py-1 px-2 text-xs font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map((material) => (
                  <TableRow key={material.id} className="h-10">
                    <TableCell className="py-1 px-2 text-xs font-medium">{material.name}</TableCell>
                    <TableCell className="py-1 px-2 text-xs">{material.type}</TableCell>
                    <TableCell className="py-1 px-2 text-xs">{material.currentStock} {material.unit}</TableCell>
                    <TableCell className="py-1 px-2 text-xs">{material.minimumStock} {material.unit}</TableCell>
                    <TableCell className="py-1 px-2">
                      <Badge variant={getStockStatusVariant(material.currentStock, material.minimumStock)} className="flex items-center gap-1 w-fit text-xs px-1 py-0">
                        {getStockStatusText(material.currentStock, material.minimumStock) === "Critical" && <AlertTriangle className="h-3 w-3" />}
                        {getStockStatusText(material.currentStock, material.minimumStock)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-1 px-2 text-xs">₹{material.costPerUnit}</TableCell>
                    <TableCell className="py-1 px-2 text-xs font-medium">₹{(material.currentStock * material.costPerUnit).toLocaleString()}</TableCell>
                    <TableCell className="py-1 px-2 text-xs">{material.supplier}</TableCell>
                    <TableCell className="py-1 px-2 text-xs">{new Date(material.lastUpdated).toLocaleDateString()}</TableCell>
                    <TableCell className="py-1 px-2">
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                              Update
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

          {filteredMaterials.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No materials found matching your search.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="procurement">
          <ProcurementRequestsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RawMaterialInventory;
