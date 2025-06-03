
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, AlertTriangle, Eye } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const RawMaterialInventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isRaiseRequestOpen, setIsRaiseRequestOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [isViewRequestOpen, setIsViewRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Combined raw materials data with requirements
  const [rawMaterials, setRawMaterials] = useState([
    {
      id: 1,
      name: "Silver Chain",
      type: "Chain",
      currentStock: 15,
      minimumStock: 50,
      unit: "meters",
      lastUpdated: "2024-06-01",
      supplier: "Mumbai Silver Co.",
      costPerUnit: 120,
      required: 120,
      inProcurement: 100,
      requestStatus: "Approved"
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
      costPerUnit: 25,
      required: 50,
      inProcurement: 0,
      requestStatus: "None"
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
      costPerUnit: 5,
      required: 200,
      inProcurement: 0,
      requestStatus: "None"
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
      costPerUnit: 15,
      required: 30,
      inProcurement: 50,
      requestStatus: "Pending"
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
      costPerUnit: 2,
      required: 100,
      inProcurement: 0,
      requestStatus: "None"
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
      costPerUnit: 30,
      required: 25,
      inProcurement: 0,
      requestStatus: "None"
    }
  ]);

  const [procurementRequests, setProcurementRequests] = useState([
    {
      id: "PR-001",
      materialName: "Cotton Thread",
      materialId: 4,
      quantityRequested: 50,
      unit: "rolls",
      dateRequested: "2024-06-01",
      status: "Pending",
      supplier: "Local Supplier",
      eta: "2024-06-10",
      notes: "Urgent requirement for large orders"
    },
    {
      id: "PR-002",
      materialName: "Silver Chain",
      materialId: 1,
      quantityRequested: 100,
      unit: "meters",
      dateRequested: "2024-05-30",
      status: "Approved",
      supplier: "Mumbai Silver Co.",
      eta: "2024-06-05"
    }
  ]);

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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Pending': return "secondary" as const;
      case 'Approved': return "default" as const;
      case 'Received': return "outline" as const;
      default: return "outline" as const;
    }
  };

  // Status calculation: Required - Current Stock - Threshold
  const calculateStatus = (required: number, currentStock: number, threshold: number) => {
    return required - currentStock - threshold;
  };

  const getStatusDisplay = (status: number) => {
    if (status > 0) {
      return `Deficit of ${status}`;
    } else if (status < 0) {
      return `Surplus of ${Math.abs(status)}`;
    } else {
      return "Balanced";
    }
  };

  const getStatusTextColor = (status: number) => {
    if (status > 0) return "text-red-800 font-bold";
    if (status < 0) return "text-green-800 font-bold";
    return "text-gray-600 font-bold";
  };

  const handleRaiseRequest = (material: any) => {
    setSelectedMaterial(material);
    setIsRaiseRequestOpen(true);
  };

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
    setIsViewRequestOpen(true);
  };

  const handleUpdateRequestStatus = (requestId: string, newStatus: string) => {
    setProcurementRequests(prev => prev.map(request => {
      if (request.id === requestId && newStatus === 'Received') {
        // Update the corresponding raw material stock
        setRawMaterials(materials => materials.map(material => {
          if (material.id === request.materialId) {
            return {
              ...material,
              currentStock: material.currentStock + request.quantityRequested,
              inProcurement: Math.max(0, material.inProcurement - request.quantityRequested)
            };
          }
          return material;
        }));
      }
      return { ...request, status: newStatus };
    }));
    setIsViewRequestOpen(false);
  };

  return (
    <div className="space-y-6">
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

      {/* Combined Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Combined Raw Materials Inventory & Requirements - Takes 2 columns */}
        <div className="xl:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold">Raw Materials Inventory & Requirements</h3>
          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="h-8">
                  <TableHead className="py-1 px-2 text-xs font-medium">Material</TableHead>
                  <TableHead className="py-1 px-2 text-xs font-medium">Current Stock</TableHead>
                  <TableHead className="py-1 px-2 text-xs font-medium">Required</TableHead>
                  <TableHead className="py-1 px-2 text-xs font-medium">In Procurement</TableHead>
                  <TableHead className="py-1 px-2 text-xs font-medium">Status</TableHead>
                  <TableHead className="py-1 px-2 text-xs font-medium">Stock Status</TableHead>
                  <TableHead className="py-1 px-2 text-xs font-medium">Value</TableHead>
                  <TableHead className="py-1 px-2 text-xs font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map((material) => {
                  const status = calculateStatus(material.required, material.currentStock, material.minimumStock);
                  return (
                    <TableRow key={material.id} className="h-8">
                      <TableCell className="py-1 px-2 text-xs">
                        <div>
                          <div className="font-medium">{material.name}</div>
                          <div className="text-gray-500">{material.type}</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-1 px-2 text-xs">
                        <div>
                          <div>{material.currentStock} {material.unit}</div>
                          <div className="text-gray-500">Min: {material.minimumStock}</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-1 px-2 text-xs">
                        {material.required} {material.unit}
                      </TableCell>
                      <TableCell className="py-1 px-2 text-xs">
                        {material.inProcurement} {material.unit}
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <span className={`text-xs ${getStatusTextColor(status)}`}>
                          {getStatusDisplay(status)}
                        </span>
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <div className="flex flex-col gap-1">
                          <Badge variant={getStockStatusVariant(material.currentStock, material.minimumStock)} className="flex items-center gap-1 w-fit text-xs px-1 py-0">
                            {getStockStatusText(material.currentStock, material.minimumStock) === "Critical" && <AlertTriangle className="h-3 w-3" />}
                            {getStockStatusText(material.currentStock, material.minimumStock)}
                          </Badge>
                          {material.requestStatus !== 'None' && (
                            <Badge variant={getStatusVariant(material.requestStatus)} className="text-xs px-1 py-0">
                              {material.requestStatus}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-1 px-2 text-xs font-medium">₹{(material.currentStock * material.costPerUnit).toLocaleString()}</TableCell>
                      <TableCell className="py-1 px-2">
                        <div className="flex gap-1">
                          {material.requestStatus === 'None' && status > 0 ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-6 px-2 text-xs"
                              onClick={() => handleRaiseRequest(material)}
                            >
                              Raise Request
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                              Update
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Active Procurement Requests - Takes 1 column */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Procurement Requests</h3>
          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="h-8">
                  <TableHead className="py-1 px-2 text-xs font-medium">Request ID</TableHead>
                  <TableHead className="py-1 px-2 text-xs font-medium">Material</TableHead>
                  <TableHead className="py-1 px-2 text-xs font-medium">Quantity</TableHead>
                  <TableHead className="py-1 px-2 text-xs font-medium">Status</TableHead>
                  <TableHead className="py-1 px-2 text-xs font-medium">ETA</TableHead>
                  <TableHead className="py-1 px-2 text-xs font-medium">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {procurementRequests.map((request) => (
                  <TableRow key={request.id} className="h-8">
                    <TableCell className="py-1 px-2 text-xs font-medium">{request.id}</TableCell>
                    <TableCell className="py-1 px-2 text-xs">{request.materialName}</TableCell>
                    <TableCell className="py-1 px-2 text-xs">{request.quantityRequested} {request.unit}</TableCell>
                    <TableCell className="py-1 px-2">
                      <Badge variant={getStatusVariant(request.status)} className="text-xs px-1 py-0">
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-1 px-2 text-xs">{request.eta ? new Date(request.eta).toLocaleDateString() : '-'}</TableCell>
                    <TableCell className="py-1 px-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => handleViewRequest(request)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Raise Procurement Request Dialog */}
      <Dialog open={isRaiseRequestOpen} onOpenChange={setIsRaiseRequestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise Procurement Request - {selectedMaterial?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Current Stock</Label>
                <Input value={`${selectedMaterial?.currentStock || 0} ${selectedMaterial?.unit || ''}`} disabled />
              </div>
              <div>
                <Label>Required Quantity</Label>
                <Input value={`${selectedMaterial?.required || 0} ${selectedMaterial?.unit || ''}`} disabled />
              </div>
            </div>
            <div>
              <Label htmlFor="requestQuantity">Request Quantity</Label>
              <Input 
                id="requestQuantity" 
                type="number" 
                placeholder={calculateStatus(selectedMaterial?.required || 0, selectedMaterial?.currentStock || 0, selectedMaterial?.minimumStock || 0).toString()}
                defaultValue={Math.max(0, calculateStatus(selectedMaterial?.required || 0, selectedMaterial?.currentStock || 0, selectedMaterial?.minimumStock || 0))}
              />
            </div>
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mumbai-silver">Mumbai Silver Co.</SelectItem>
                  <SelectItem value="rajasthan-crafts">Rajasthan Crafts</SelectItem>
                  <SelectItem value="delhi-accessories">Delhi Accessories</SelectItem>
                  <SelectItem value="local-supplier">Local Supplier</SelectItem>
                  <SelectItem value="artisan-supplies">Artisan Supplies</SelectItem>
                  <SelectItem value="textile-hub">Textile Hub</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="eta">Expected Delivery Date</Label>
              <Input id="eta" type="date" />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Add any additional notes or requirements..." />
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1">Submit Request</Button>
              <Button variant="outline" onClick={() => setIsRaiseRequestOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Procurement Request Dialog */}
      <Dialog open={isViewRequestOpen} onOpenChange={setIsViewRequestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Procurement Request Details - {selectedRequest?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Material</Label>
                <Input value={selectedRequest?.materialName || ''} disabled />
              </div>
              <div>
                <Label>Quantity</Label>
                <Input value={`${selectedRequest?.quantityRequested || 0} ${selectedRequest?.unit || ''}`} disabled />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date Requested</Label>
                <Input value={selectedRequest?.dateRequested ? new Date(selectedRequest.dateRequested).toLocaleDateString() : ''} disabled />
              </div>
              <div>
                <Label>Expected Delivery</Label>
                <Input value={selectedRequest?.eta ? new Date(selectedRequest.eta).toLocaleDateString() : ''} disabled />
              </div>
            </div>
            <div>
              <Label>Supplier</Label>
              <Input value={selectedRequest?.supplier || ''} disabled />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={selectedRequest?.status || ''} 
                onValueChange={(value) => handleUpdateRequestStatus(selectedRequest?.id, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedRequest?.notes && (
              <div>
                <Label>Notes</Label>
                <Textarea value={selectedRequest.notes} disabled />
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsViewRequestOpen(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RawMaterialInventory;
