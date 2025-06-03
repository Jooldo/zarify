
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Eye } from 'lucide-react';

interface ProcurementRequest {
  id: string;
  materialName: string;
  quantityRequested: number;
  unit: string;
  dateRequested: string;
  status: 'Pending' | 'Approved' | 'Fulfilled';
  supplier?: string;
  eta?: string;
  notes?: string;
}

interface MaterialRequirement {
  materialName: string;
  inStock: number;
  required: number;
  unit: string;
  shortfall: number;
  requestStatus: string;
}

const ProcurementRequestsSection = () => {
  const [isRaiseRequestOpen, setIsRaiseRequestOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialRequirement | null>(null);

  const procurementRequests: ProcurementRequest[] = [
    {
      id: "PR-001",
      materialName: "Cotton Thread",
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
      quantityRequested: 100,
      unit: "meters",
      dateRequested: "2024-05-30",
      status: "Approved",
      supplier: "Mumbai Silver Co.",
      eta: "2024-06-05"
    }
  ];

  const materialRequirements: MaterialRequirement[] = [
    {
      materialName: "Silver Chain",
      inStock: 15,
      required: 120,
      unit: "meters",
      shortfall: -105,
      requestStatus: "Approved"
    },
    {
      materialName: "Gold Kunda",
      inStock: 8,
      required: 50,
      unit: "pieces",
      shortfall: -42,
      requestStatus: "None"
    },
    {
      materialName: "Small Ghungroo",
      inStock: 25,
      required: 200,
      unit: "pieces",
      shortfall: -175,
      requestStatus: "None"
    },
    {
      materialName: "Cotton Thread",
      inStock: 5,
      required: 30,
      unit: "rolls",
      shortfall: -25,
      requestStatus: "Pending"
    },
    {
      materialName: "Brass Beads",
      inStock: 150,
      required: 100,
      unit: "pieces",
      shortfall: 50,
      requestStatus: "None"
    },
    {
      materialName: "Silk Thread",
      inStock: 12,
      required: 25,
      unit: "rolls",
      shortfall: -13,
      requestStatus: "None"
    }
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Pending': return "secondary" as const;
      case 'Approved': return "default" as const;
      case 'Fulfilled': return "outline" as const;
      default: return "outline" as const;
    }
  };

  const getShortfallColor = (shortfall: number) => {
    if (shortfall < 0) return "text-red-600 font-medium";
    return "text-green-600 font-medium";
  };

  const handleRaiseRequest = (material: MaterialRequirement) => {
    setSelectedMaterial(material);
    setIsRaiseRequestOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Active Procurement Requests */}
      <div>
        <h3 className="text-base font-semibold mb-3">Active Procurement Requests</h3>
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="h-8">
                <TableHead className="py-1 px-2 text-xs font-medium">Request ID</TableHead>
                <TableHead className="py-1 px-2 text-xs font-medium">Material</TableHead>
                <TableHead className="py-1 px-2 text-xs font-medium">Quantity</TableHead>
                <TableHead className="py-1 px-2 text-xs font-medium">Date Requested</TableHead>
                <TableHead className="py-1 px-2 text-xs font-medium">Status</TableHead>
                <TableHead className="py-1 px-2 text-xs font-medium">Supplier</TableHead>
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
                  <TableCell className="py-1 px-2 text-xs">{new Date(request.dateRequested).toLocaleDateString()}</TableCell>
                  <TableCell className="py-1 px-2">
                    <Badge variant={getStatusVariant(request.status)} className="text-xs px-1 py-0">
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1 px-2 text-xs">{request.supplier || '-'}</TableCell>
                  <TableCell className="py-1 px-2 text-xs">{request.eta ? new Date(request.eta).toLocaleDateString() : '-'}</TableCell>
                  <TableCell className="py-1 px-2">
                    <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Material Requirements Planning */}
      <div>
        <h3 className="text-base font-semibold mb-3">Material Requirements Planning</h3>
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="h-8">
                <TableHead className="py-1 px-2 text-xs font-medium">Raw Material</TableHead>
                <TableHead className="py-1 px-2 text-xs font-medium">In Stock</TableHead>
                <TableHead className="py-1 px-2 text-xs font-medium">Required</TableHead>
                <TableHead className="py-1 px-2 text-xs font-medium">Shortfall</TableHead>
                <TableHead className="py-1 px-2 text-xs font-medium">Request Status</TableHead>
                <TableHead className="py-1 px-2 text-xs font-medium">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materialRequirements.map((material, index) => (
                <TableRow key={index} className="h-8">
                  <TableCell className="py-1 px-2 text-xs font-medium">{material.materialName}</TableCell>
                  <TableCell className="py-1 px-2 text-xs">{material.inStock} {material.unit}</TableCell>
                  <TableCell className="py-1 px-2 text-xs">{material.required} {material.unit}</TableCell>
                  <TableCell className={`py-1 px-2 text-xs ${getShortfallColor(material.shortfall)}`}>
                    {material.shortfall > 0 ? '+' : ''}{material.shortfall} {material.unit}
                  </TableCell>
                  <TableCell className="py-1 px-2">
                    {material.requestStatus !== 'None' ? (
                      <Badge variant={getStatusVariant(material.requestStatus)} className="text-xs px-1 py-0">
                        {material.requestStatus}
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </TableCell>
                  <TableCell className="py-1 px-2">
                    {material.requestStatus === 'None' && material.shortfall < 0 ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6 px-2 text-xs"
                        onClick={() => handleRaiseRequest(material)}
                      >
                        Raise Request
                      </Button>
                    ) : material.requestStatus !== 'None' ? (
                      <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                        View Request
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Raise Procurement Request Dialog */}
      <Dialog open={isRaiseRequestOpen} onOpenChange={setIsRaiseRequestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise Procurement Request - {selectedMaterial?.materialName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Current Stock</Label>
                <Input value={`${selectedMaterial?.inStock || 0} ${selectedMaterial?.unit || ''}`} disabled />
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
                placeholder={Math.abs(selectedMaterial?.shortfall || 0).toString()}
                defaultValue={Math.abs(selectedMaterial?.shortfall || 0)}
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
    </div>
  );
};

export default ProcurementRequestsSection;
