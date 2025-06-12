
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Eye, Pen, Trash } from 'lucide-react';
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
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <div className="h-8 w-full bg-muted rounded-md animate-pulse" />
          </div>
          <div className="h-8 w-24 bg-muted rounded-md animate-pulse" />
        </div>
        <TableSkeleton 
          rows={6} 
          columns={6}
          columnWidths={['w-24', 'w-20', 'w-20', 'w-16', 'w-16', 'w-20']}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search workers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Add Worker
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-base">Add New Worker</DialogTitle>
            </DialogHeader>
            <AddWorkerForm
              onSuccess={handleAddSuccess}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {filteredWorkers.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-sm text-gray-500">No workers found</div>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="h-8">
                <TableHead className="h-8 px-2 text-xs font-medium">Name</TableHead>
                <TableHead className="h-8 px-2 text-xs font-medium">Phone</TableHead>
                <TableHead className="h-8 px-2 text-xs font-medium">Role</TableHead>
                <TableHead className="h-8 px-2 text-xs font-medium">Status</TableHead>
                <TableHead className="h-8 px-2 text-xs font-medium">Joined</TableHead>
                <TableHead className="h-8 px-2 text-xs font-medium w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkers.map((worker) => (
                <TableRow key={worker.id} className="h-8 hover:bg-gray-50">
                  <TableCell className="px-2 py-1 text-xs font-medium truncate max-w-24">{worker.name}</TableCell>
                  <TableCell className="px-2 py-1 text-xs truncate max-w-20">{worker.contact_number || '-'}</TableCell>
                  <TableCell className="px-2 py-1 text-xs truncate max-w-20">{worker.role || '-'}</TableCell>
                  <TableCell className="px-2 py-1">
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                      worker.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {worker.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs">
                    {worker.joined_date ? new Date(worker.joined_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                  </TableCell>
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
                            <AlertDialogTitle className="text-base">Delete Worker</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm">
                              Are you sure you want to delete {worker.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteWorker(worker.id)}
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

export default WorkersSection;
