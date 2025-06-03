
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Package2, AlertCircle, Eye, Edit } from 'lucide-react';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import UpdateRawMaterialDialog from '@/components/inventory/UpdateRawMaterialDialog';
import ViewRawMaterialDialog from '@/components/inventory/ViewRawMaterialDialog';

const RawMaterialInventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { rawMaterials, loading, updateRawMaterial } = useRawMaterials();

  const filteredMaterials = rawMaterials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.supplier?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (currentStock: number, minimumStock: number) => {
    if (currentStock === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (currentStock <= minimumStock) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const getRequestStatus = (status: string) => {
    switch (status) {
      case 'None': return { label: 'None', variant: 'outline' as const };
      case 'Pending': return { label: 'Pending', variant: 'secondary' as const };
      case 'Approved': return { label: 'Approved', variant: 'default' as const };
      case 'Received': return { label: 'Received', variant: 'default' as const };
      default: return { label: status, variant: 'outline' as const };
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Raw Materials Inventory
          </h3>
        </div>
        <div className="text-center py-8">
          <div className="text-lg">Loading raw materials...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Package2 className="h-5 w-5" />
          Raw Materials Inventory
        </h3>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
          <Button className="flex items-center gap-2 h-8 px-3 text-xs">
            <Plus className="h-3 w-3" />
            Add Material
          </Button>
        </div>
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
              <TableHead className="py-1 px-2 text-xs font-medium">Required</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">In Procurement</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Unit</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Supplier</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Status</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Request Status</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMaterials.map((material) => {
              const status = getStockStatus(material.current_stock, material.minimum_stock);
              const requestStatus = getRequestStatus(material.request_status);
              return (
                <TableRow key={material.id} className="h-10">
                  <TableCell className="py-1 px-2 text-xs font-medium">{material.name}</TableCell>
                  <TableCell className="py-1 px-2 text-xs">{material.type}</TableCell>
                  <TableCell className="py-1 px-2 text-xs font-medium">{material.current_stock}</TableCell>
                  <TableCell className="py-1 px-2 text-xs">{material.minimum_stock}</TableCell>
                  <TableCell className="py-1 px-2 text-xs">{material.required}</TableCell>
                  <TableCell className="py-1 px-2 text-xs">{material.in_procurement}</TableCell>
                  <TableCell className="py-1 px-2 text-xs">{material.unit}</TableCell>
                  <TableCell className="py-1 px-2 text-xs">{material.supplier?.company_name || 'N/A'}</TableCell>
                  <TableCell className="py-1 px-2 text-xs">
                    <Badge variant={status.variant} className="text-xs px-1 py-0">
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1 px-2 text-xs">
                    <Badge variant={requestStatus.variant} className="text-xs px-1 py-0">
                      {requestStatus.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1 px-2">
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>View Material - {material.name}</DialogTitle>
                          </DialogHeader>
                          <ViewRawMaterialDialog material={material} />
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
                            <DialogTitle>Update Material - {material.name}</DialogTitle>
                          </DialogHeader>
                          <UpdateRawMaterialDialog material={material} onUpdate={updateRawMaterial} />
                        </DialogContent>
                      </Dialog>
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

      {filteredMaterials.length === 0 && !loading && (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">
            {rawMaterials.length === 0 ? 'No raw materials found. Add some materials to get started.' : 'No materials found matching your search.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default RawMaterialInventory;
