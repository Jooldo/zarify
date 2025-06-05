
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Eye, Pen, Trash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Supplier {
  id: string;
  company_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  materials_supplied?: string[];
  created_at: string;
}

const SuppliersSection = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.includes(searchTerm)
  );

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
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

  useEffect(() => {
    fetchSuppliers();
  }, []);

  if (isLoading) {
    return <div className="text-center py-4 text-sm">Loading suppliers...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">Add New Supplier</DialogTitle>
            </DialogHeader>
            <p className="text-xs text-gray-500">Supplier form will be implemented here</p>
          </DialogContent>
        </Dialog>
      </div>

      {filteredSuppliers.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-sm text-gray-500">No suppliers found</div>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="h-8">
                <TableHead className="h-8 px-2 text-xs font-medium">Company</TableHead>
                <TableHead className="h-8 px-2 text-xs font-medium">Contact</TableHead>
                <TableHead className="h-8 px-2 text-xs font-medium">Phone</TableHead>
                <TableHead className="h-8 px-2 text-xs font-medium">Materials</TableHead>
                <TableHead className="h-8 px-2 text-xs font-medium">Created</TableHead>
                <TableHead className="h-8 px-2 text-xs font-medium w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id} className="h-8 hover:bg-gray-50">
                  <TableCell className="px-2 py-1 text-xs font-medium truncate max-w-24">{supplier.company_name}</TableCell>
                  <TableCell className="px-2 py-1 text-xs truncate max-w-20">{supplier.contact_person || '-'}</TableCell>
                  <TableCell className="px-2 py-1 text-xs truncate max-w-20">{supplier.phone || '-'}</TableCell>
                  <TableCell className="px-2 py-1 text-xs truncate max-w-32">
                    {supplier.materials_supplied ? supplier.materials_supplied.join(', ') : '-'}
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs">{new Date(supplier.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</TableCell>
                  <TableCell className="px-2 py-1">
                    <div className="flex items-center gap-0.5">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Pen className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600 hover:text-red-700">
                            <Trash className="h-3 w-3" />
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
                            <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteSupplier(supplier.id)}
                              className="h-8 text-xs"
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
    </div>
  );
};

export default SuppliersSection;
