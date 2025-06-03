
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, Eye } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const WorkersSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const workers = [
    {
      id: "WOR-001",
      name: "Kamala Devi",
      role: "Artisan",
      contactNumber: "+91 98765 11111",
      joinedDate: "2023-01-15",
      currentStatus: "Active",
      notes: "Expert in traditional meena work, 15 years experience"
    },
    {
      id: "WOR-002",
      name: "Ravi Kumar",
      role: "Packer",
      contactNumber: "+91 98765 22222",
      joinedDate: "2023-03-20",
      currentStatus: "Active",
      notes: "Efficient in packaging and quality control"
    },
    {
      id: "WOR-003",
      name: "Sunita Sharma",
      role: "Artisan",
      contactNumber: "+91 98765 33333",
      joinedDate: "2022-11-10",
      currentStatus: "On Leave",
      notes: "Specializes in kundan work, currently on maternity leave"
    },
    {
      id: "WOR-004",
      name: "Mohan Singh",
      role: "Quality Controller",
      contactNumber: "+91 98765 44444",
      joinedDate: "2023-05-01",
      currentStatus: "Active",
      notes: "Ensures quality standards, attention to detail"
    },
    {
      id: "WOR-005",
      name: "Priya Nair",
      role: "Artisan",
      contactNumber: "+91 98765 55555",
      joinedDate: "2023-07-12",
      currentStatus: "Active",
      notes: "New joiner, learning traditional techniques"
    }
  ];

  const roles = ["all", "Artisan", "Packer", "Quality Controller"];

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || worker.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active': return "default" as const;
      case 'On Leave': return "secondary" as const;
      default: return "outline" as const;
    }
  };

  const handleViewWorker = (worker: any) => {
    setSelectedWorker(worker);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search workers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40 h-8">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role === 'all' ? 'All Roles' : role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 h-8 px-3 text-xs">
              <Plus className="h-3 w-3" />
              Add Worker
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Worker</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="workerName">Name</Label>
                <Input id="workerName" placeholder="Enter worker name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.slice(1).map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input id="contactNumber" placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="joinedDate">Joined Date</Label>
                  <Input id="joinedDate" type="date" />
                </div>
                <div>
                  <Label htmlFor="status">Current Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Add any notes about the worker..." />
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1">Add Worker</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workers Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="py-1 px-2 text-xs font-medium">Worker ID</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Name</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Role</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Contact Number</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Joined Date</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Current Status</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkers.map((worker) => (
              <TableRow key={worker.id} className="h-8">
                <TableCell className="py-1 px-2 text-xs font-medium">{worker.id}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{worker.name}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{worker.role}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{worker.contactNumber}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{new Date(worker.joinedDate).toLocaleDateString()}</TableCell>
                <TableCell className="py-1 px-2">
                  <Badge variant={getStatusVariant(worker.currentStatus)} className="text-xs px-1 py-0">
                    {worker.currentStatus}
                  </Badge>
                </TableCell>
                <TableCell className="py-1 px-2">
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => handleViewWorker(worker)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Worker Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Worker Details - {selectedWorker?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Worker ID</Label>
                <Input value={selectedWorker?.id || ''} disabled />
              </div>
              <div>
                <Label>Name</Label>
                <Input value={selectedWorker?.name || ''} disabled />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Role</Label>
                <Input value={selectedWorker?.role || ''} disabled />
              </div>
              <div>
                <Label>Contact Number</Label>
                <Input value={selectedWorker?.contactNumber || ''} disabled />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Joined Date</Label>
                <Input value={selectedWorker?.joinedDate ? new Date(selectedWorker.joinedDate).toLocaleDateString() : ''} disabled />
              </div>
              <div>
                <Label>Current Status</Label>
                <Input value={selectedWorker?.currentStatus || ''} disabled />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={selectedWorker?.notes || ''} disabled />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkersSection;
