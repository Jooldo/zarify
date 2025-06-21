
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Users, Eye, Pen, Trash, ArrowUpDown } from 'lucide-react';
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <div className="h-10 w-full bg-muted rounded-md animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-muted rounded-md animate-pulse" />
        </div>
        <TableSkeleton 
          rows={8} 
          columns={6}
          columnWidths={['w-32', 'w-24', 'w-40', 'w-40', 'w-20', 'w-24']}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 px-4 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-500">Customer form will be implemented here</p>
          </DialogContent>
        </Dialog>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">No customers found</div>
            <p className="text-gray-500">Get started by adding your first customer</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50/50">
                <TableHead className="h-14 px-6 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    Customer Name
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
                    Email
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  </div>
                </TableHead>
                <TableHead className="h-14 px-6 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    Address
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
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <TableCell className="h-16 px-6 py-4">
                    <span className="font-medium text-gray-900">{customer.name}</span>
                  </TableCell>
                  <TableCell className="h-16 px-6 py-4">
                    <span className="text-gray-900">{customer.phone || '-'}</span>
                  </TableCell>
                  <TableCell className="h-16 px-6 py-4">
                    <span className="text-gray-900">{customer.email || '-'}</span>
                  </TableCell>
                  <TableCell className="h-16 px-6 py-4">
                    <span className="text-gray-900">{customer.address || '-'}</span>
                  </TableCell>
                  <TableCell className="h-16 px-6 py-4">
                    <span className="text-gray-900">
                      {new Date(customer.created_at).toLocaleDateString('en-US', { 
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
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-10 w-10 p-0 rounded-full border-2 hover:bg-green-50 hover:border-green-200 transition-colors"
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
                            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {customer.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteCustomer(customer.id)}
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
