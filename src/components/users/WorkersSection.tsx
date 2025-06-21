
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Pen, Trash, ArrowUpDown, Hammer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';
import AddWorkerForm from './AddWorkerForm';

interface Worker {
  id: string;
  name: string;
  contact_number?: string;
  role?: string;
  joined_date?: string;
  status: string;
  created_at: string;
}

const WorkersSection = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredWorkers = workers.filter(worker =>
    worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.contact_number?.includes(searchTerm)
  );

  const fetchWorkers = async () => {
    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkers(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch workers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWorker = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWorkers(workers.filter(w => w.id !== id));
      toast({
        title: "Success",
        description: "Worker deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete worker",
        variant: "destructive",
      });
    }
  };

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    fetchWorkers();
  };

  useEffect(() => {
    fetchWorkers();
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
          rows={6} 
          columns={6}
          columnWidths={['w-32', 'w-24', 'w-24', 'w-20', 'w-20', 'w-24']}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search workers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 px-4 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Worker
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Worker</DialogTitle>
            </DialogHeader>
            <AddWorkerForm
              onSuccess={handleAddSuccess}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {filteredWorkers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="text-center py-12">
            <Hammer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">No workers found</div>
            <p className="text-gray-500">Get started by adding your first worker</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50/50">
                <TableHead className="h-14 px-6 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    Worker Name
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
                    Role
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  </div>
                </TableHead>
                <TableHead className="h-14 px-6 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    Status
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  </div>
                </TableHead>
                <TableHead className="h-14 px-6 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    Joined
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  </div>
                </TableHead>
                <TableHead className="h-14 px-6 text-sm font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkers.map((worker) => (
                <TableRow key={worker.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <TableCell className="h-16 px-6 py-4">
                    <span className="font-medium text-gray-900">{worker.name}</span>
                  </TableCell>
                  <TableCell className="h-16 px-6 py-4">
                    <span className="text-gray-900">{worker.contact_number || '-'}</span>
                  </TableCell>
                  <TableCell className="h-16 px-6 py-4">
                    <span className="text-gray-900">{worker.role || '-'}</span>
                  </TableCell>
                  <TableCell className="h-16 px-6 py-4">
                    <Badge 
                      variant={worker.status === 'Active' ? "default" : "secondary"}
                      className="text-sm px-3 py-1"
                    >
                      {worker.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="h-16 px-6 py-4">
                    <span className="text-gray-900">
                      {worker.joined_date ? new Date(worker.joined_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      }) : '-'}
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
                            <AlertDialogTitle>Delete Worker</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {worker.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteWorker(worker.id)}
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

export default WorkersSection;
