import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Users, Eye, Pen, Trash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: string;
}

const CustomersSection = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCustomers(customers.filter(c => c.id !== id));
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <div className="h-8 w-full bg-muted rounded-md animate-pulse" />
          </div>
          <div className="h-8 w-24 bg-muted rounded-md animate-pulse" />
        </div>
        <TableSkeleton 
          rows={8} 
          columns={6}
          columnWidths={['w-24', 'w-20', 'w-32', 'w-32', 'w-16', 'w-20']}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">Add New Customer</DialogTitle>
            </DialogHeader>
            <p className="text-xs text-gray-500">Customer form will be implemented here</p>
          </DialogContent>
        </Dialog>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-sm text-gray-500">No customers found</div>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="h-8">
                <TableHead className="h-8 px-2 text-xs font-medium">Name</TableHead>
                <TableHead className="h-8 px-2 text-xs font-medium">Phone</TableHead>
                <TableHead className="h-8 px-2 text-xs font-medium">Email</TableHead>
                <TableHead className="h-8 px-2 text-xs font-medium">Address</TableHead>
                <TableHead className="h-8 px-2 text-xs font-medium">Created</TableHead>
                <TableHead className="h-8 px-2 text-xs font-medium w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="h-8 hover:bg-gray-50">
                  <TableCell className="px-2 py-1 text-xs font-medium truncate max-w-24">{customer.name}</TableCell>
                  <TableCell className="px-2 py-1 text-xs truncate max-w-20">{customer.phone || '-'}</TableCell>
                  <TableCell className="px-2 py-1 text-xs truncate max-w-32">{customer.email || '-'}</TableCell>
                  <TableCell className="px-2 py-1 text-xs truncate max-w-32">{customer.address || '-'}</TableCell>
                  <TableCell className="px-2 py-1 text-xs">{new Date(customer.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</TableCell>
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
                            <AlertDialogTitle className="text-base">Delete Customer</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm">
                              Are you sure you want to delete {customer.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteCustomer(customer.id)}
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

export default CustomersSection;
