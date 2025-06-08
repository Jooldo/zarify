
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Eye, Pen, Trash, Building2, Phone, Mail, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { useProcurementRequests } from '@/hooks/useProcurementRequests';
import AddSupplierForm from '../users/AddSupplierForm';
import EditSupplierForm from '../users/EditSupplierForm';
import ViewSupplierDialog from '../users/ViewSupplierDialog';

interface Supplier {
  id: string;
  company_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  payment_terms?: string;
  whatsapp_number?: string;
  whatsapp_enabled?: boolean;
  materials_supplied?: string[];
  created_at: string;
  updated_at: string;
}

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const { rawMaterials } = useRawMaterials();
  const { requests } = useProcurementRequests();
  const { toast } = useToast();

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.includes(searchTerm)
  );

  // Calculate supplier performance metrics
  const supplierMetrics = useMemo(() => {
    return suppliers.map(supplier => {
      const supplierRequests = requests.filter(req => req.supplier_id === supplier.id);
      const completedRequests = supplierRequests.filter(req => req.status === 'Received');
      
      const avgLeadTime = completedRequests.length > 0 ? 
        completedRequests.reduce((sum, req) => {
          if (req.eta) {
            const leadTime = new Date(req.eta).getTime() - new Date(req.date_requested).getTime();
            return sum + leadTime / (1000 * 60 * 60 * 24);
          }
          return sum;
        }, 0) / completedRequests.length : 0;

      const fulfillmentRate = supplierRequests.length > 0 ? 
        (completedRequests.length / supplierRequests.length) * 100 : 0;

      return {
        ...supplier,
        totalRequests: supplierRequests.length,
        avgLeadTime,
        fulfillmentRate,
        lastOrderDate: supplierRequests.length > 0 ? 
          Math.max(...supplierRequests.map(req => new Date(req.date_requested).getTime())) : null
      };
    });
  }, [suppliers, requests]);

  const fetchSuppliers = async () => {
    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('company_name', { ascending: true });

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch suppliers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSupplierStatus = async (supplierId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({ whatsapp_enabled: !currentStatus })
        .eq('id', supplierId);

      if (error) throw error;

      setSuppliers(suppliers.map(s => 
        s.id === supplierId ? { ...s, whatsapp_enabled: !currentStatus } : s
      ));

      toast({
        title: "Success",
        description: `Supplier ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update supplier status",
        variant: "destructive",
      });
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSuppliers(suppliers.filter(s => s.id !== id));
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      });
    }
  };

  const getMaterialNames = (materialIds?: string[]) => {
    if (!materialIds || materialIds.length === 0) return [];
    
    return materialIds
      .map(id => {
        const material = rawMaterials.find(m => m.id === id);
        return material ? material.name : null;
      })
      .filter(Boolean);
  };

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    fetchSuppliers();
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedSupplier(null);
    fetchSuppliers();
  };

  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsViewDialogOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditDialogOpen(true);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Loading suppliers...</div>;
  }

  const activeSuppliers = filteredSuppliers.filter(s => s.whatsapp_enabled !== false);
  const inactiveSuppliers = filteredSuppliers.filter(s => s.whatsapp_enabled === false);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Total Suppliers</p>
                <p className="text-lg font-semibold">{suppliers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Active Suppliers</p>
                <p className="text-lg font-semibold">{activeSuppliers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Avg Response Time</p>
                <p className="text-lg font-semibold">
                  {supplierMetrics.length > 0 ? 
                    (supplierMetrics.reduce((sum, s) => sum + s.avgLeadTime, 0) / supplierMetrics.length).toFixed(1) : 0
                  } days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">WhatsApp Enabled</p>
                <p className="text-lg font-semibold">{suppliers.filter(s => s.whatsapp_enabled).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-9 text-sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
            </DialogHeader>
            <AddSupplierForm
              onSuccess={handleAddSuccess}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Suppliers Table */}
      {filteredSuppliers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <CardTitle className="text-lg mb-2">No suppliers found</CardTitle>
            <CardDescription>
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first supplier'}
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Supplier Directory</CardTitle>
            <CardDescription>Manage your supplier relationships and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Materials</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Order</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierMetrics.filter(supplier => 
                    supplier.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    supplier.phone?.includes(searchTerm)
                  ).map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{supplier.company_name}</p>
                          <p className="text-sm text-gray-600">{supplier.contact_person || '-'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {supplier.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {supplier.phone}
                            </div>
                          )}
                          {supplier.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {supplier.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {getMaterialNames(supplier.materials_supplied).slice(0, 2).map((material, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {material}
                            </Badge>
                          ))}
                          {getMaterialNames(supplier.materials_supplied).length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{getMaterialNames(supplier.materials_supplied).length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{supplier.avgLeadTime.toFixed(1)} days</p>
                          <p className="text-xs text-gray-600">{supplier.fulfillmentRate.toFixed(1)}% fulfilled</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={supplier.whatsapp_enabled ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {supplier.whatsapp_enabled ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            onClick={() => toggleSupplierStatus(supplier.id, supplier.whatsapp_enabled || false)}
                          >
                            {supplier.whatsapp_enabled ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {supplier.lastOrderDate ? 
                            new Date(supplier.lastOrderDate).toLocaleDateString() : 
                            'Never'
                          }
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0"
                            onClick={() => handleViewSupplier(supplier)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0"
                            onClick={() => handleEditSupplier(supplier)}
                          >
                            <Pen className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600 hover:text-red-700">
                                <Trash className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {supplier.company_name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteSupplier(supplier.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <EditSupplierForm
              supplier={selectedSupplier}
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedSupplier(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <ViewSupplierDialog
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        supplier={selectedSupplier}
      />
    </div>
  );
};

export default SupplierManagement;
