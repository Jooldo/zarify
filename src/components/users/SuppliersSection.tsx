import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Pen, Trash } from 'lucide-react';
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
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <div className="h-7 w-full bg-muted rounded-md animate-pulse" />
          </div>
          <div className="h-7 w-24 bg-muted rounded-md animate-pulse" />
        </div>
        <TableSkeleton 
          rows={8} 
          columns={7}
          columnWidths={['w-20', 'w-16', 'w-16', 'w-24', 'w-12', 'w-16', 'w-16']}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-7 text-xs"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-7 text-xs px-2">
              <Plus className="h-3 w-3 mr-1" />
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
        <div className="text-center py-4">
          <div className="text-xs text-gray-500">No suppliers found</div>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="h-6">
                <TableHead className="h-6 px-1 text-xs font-medium">Company</TableHead>
                <TableHead className="h-6 px-1 text-xs font-medium">Contact</TableHead>
                <TableHead className="h-6 px-1 text-xs font-medium">Phone</TableHead>
                <TableHead className="h-6 px-1 text-xs font-medium">Materials</TableHead>
                <TableHead className="h-6 px-1 text-xs font-medium">WhatsApp</TableHead>
                <TableHead className="h-6 px-1 text-xs font-medium">Created</TableHead>
                <TableHead className="h-6 px-1 text-xs font-medium w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id} className="h-6 hover:bg-gray-50">
                  <TableCell className="px-1 py-0.5 text-xs font-medium truncate max-w-20">{supplier.company_name}</TableCell>
                  <TableCell className="px-1 py-0.5 text-xs truncate max-w-16">{supplier.contact_person || '-'}</TableCell>
                  <TableCell className="px-1 py-0.5 text-xs truncate max-w-16">{supplier.phone || '-'}</TableCell>
                  <TableCell className="px-1 py-0.5 text-xs truncate max-w-24">
                    {getMaterialNames(supplier.materials_supplied)}
                  </TableCell>
                  <TableCell className="px-1 py-0.5">
                    <Badge 
                      variant={supplier.whatsapp_enabled ? "default" : "secondary"} 
                      className="text-xs h-3 px-1"
                    >
                      {supplier.whatsapp_enabled ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-1 py-0.5 text-xs">{new Date(supplier.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</TableCell>
                  <TableCell className="px-1 py-0.5">
                    <div className="flex items-center gap-0.5">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-5 w-5 p-0"
                        onClick={() => handleViewSupplier(supplier)}
                      >
                        <Eye className="h-2.5 w-2.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-5 w-5 p-0"
                        onClick={() => handleEditSupplier(supplier)}
                      >
                        <Pen className="h-2.5 w-2.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-red-600 hover:text-red-700">
                            <Trash className="h-2.5 w-2.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-base">Delete Supplier</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm">
                              Are you sure you want to delete {supplier.company_name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="h-7 text-xs">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteSupplier(supplier.id)}
                              className="h-7 text-xs"
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
