
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Pen, Trash, ArrowUpDown, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import AddSupplierForm from './AddSupplierForm';
import EditSupplierForm from './EditSupplierForm';
import ViewSupplierDialog from './ViewSupplierDialog';
import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';

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
}

const SuppliersSection = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const { rawMaterials } = useRawMaterials();
  const { toast } = useToast();

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.includes(searchTerm)
  );

  const fetchSuppliers = async () => {
    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false });

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
    if (!materialIds || materialIds.length === 0) return '-';
    
    const names = materialIds
      .map(id => {
        const material = rawMaterials.find(m => m.id === id);
        return material ? material.name : null;
      })
      .filter(Boolean);
    
    return names.length > 0 ? names.join(', ') : '-';
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
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <div className="h-10 w-full bg-muted rounded-md animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-muted rounded-md animate-pulse" />
        </div>
        <TableSkeleton 
          rows={8} 
          columns={7}
          columnWidths={['w-32', 'w-24', 'w-24', 'w-40', 'w-20', 'w-20', 'w-24']}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 px-4 flex items-center gap-2">
              <Plus className="h-4 w-4" />
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

      {filteredSuppliers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">No suppliers found</div>
            <p className="text-gray-500">Get started by adding your first supplier</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50/50">
                <TableHead className="h-14 px-6 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    Company Name
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  </div>
                </TableHead>
                <TableHead className="h-14 px-6 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    Contact Person
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  </div>
                </TableHead>
                <TableHead className="h-14 px-6 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    Phone
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  </div>
                </TableHead>
                <TableHead className="h-14 px-6 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    Materials Supplied
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  </div>
                </TableHead>
                <TableHead className="h-14 px-6 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    WhatsApp
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  </div>
                </TableHead>
                <TableHead className="h-14 px-6 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    Created
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  </div>
                </TableHead>
                <TableHead className="h-14 px-6 text-sm font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <TableCell className="h-16 px-6 py-4">
                    <span className="font-medium text-gray-900">{supplier.company_name}</span>
                  </TableCell>
                  <TableCell className="h-16 px-6 py-4">
                    <span className="text-gray-900">{supplier.contact_person || '-'}</span>
                  </TableCell>
                  <TableCell className="h-16 px-6 py-4">
                    <span className="text-gray-900">{supplier.phone || '-'}</span>
                  </TableCell>
                  <TableCell className="h-16 px-6 py-4">
                    <span className="text-gray-900">{getMaterialNames(supplier.materials_supplied)}</span>
                  </TableCell>
                  <TableCell className="h-16 px-6 py-4">
                    <Badge 
                      variant={supplier.whatsapp_enabled ? "default" : "secondary"} 
                      className="text-sm px-3 py-1"
                    >
                      {supplier.whatsapp_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell className="h-16 px-6 py-4">
                    <span className="text-gray-900">
                      {new Date(supplier.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="h-16 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-10 w-10 p-0 rounded-full border-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        onClick={() => handleViewSupplier(supplier)}
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-10 w-10 p-0 rounded-full border-2 hover:bg-green-50 hover:border-green-200 transition-colors"
                        onClick={() => handleEditSupplier(supplier)}
                      >
                        <Pen className="h-4 w-4 text-gray-600" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-10 w-10 p-0 rounded-full border-2 hover:bg-red-50 hover:border-red-200 transition-colors"
                          >
                            <Trash className="h-4 w-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-md">
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

export default SuppliersSection;
