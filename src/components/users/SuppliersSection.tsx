
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, Eye } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const SuppliersSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const suppliers = [
    {
      id: "SUP-001",
      companyName: "Mumbai Silver Co.",
      contactPerson: "Rajesh Kumar",
      phone: "+91 98765 54321",
      email: "rajesh@mumbaisilver.com",
      materialSupplied: "Silver Chains, Silver Beads",
      paymentTerms: "30 days"
    },
    {
      id: "SUP-002",
      companyName: "Rajasthan Crafts",
      contactPerson: "Anita Sharma",
      phone: "+91 98765 54322",
      email: "anita@rajasthancrafts.com",
      materialSupplied: "Kundas, Traditional Beads",
      paymentTerms: "15 days"
    },
    {
      id: "SUP-003",
      companyName: "Delhi Accessories",
      contactPerson: "Vikram Singh",
      phone: "+91 98765 54323",
      email: "vikram@delhiaccessories.com",
      materialSupplied: "Ghungroos, Bells",
      paymentTerms: "45 days"
    },
    {
      id: "SUP-004",
      companyName: "Textile Hub",
      contactPerson: "Meera Patel",
      phone: "+91 98765 54324",
      email: "meera@textilehub.com",
      materialSupplied: "Cotton Thread, Silk Thread",
      paymentTerms: "20 days"
    }
  ];

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewSupplier = (supplier: any) => {
    setSelectedSupplier(supplier);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-8"
          />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 h-8 px-3 text-xs">
              <Plus className="h-3 w-3" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" placeholder="Enter company name" />
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input id="contactPerson" placeholder="Enter contact person name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="supplier@email.com" />
                </div>
              </div>
              <div>
                <Label htmlFor="materialSupplied">Material Supplied</Label>
                <Input id="materialSupplied" placeholder="e.g., Silver Chains, Beads" />
              </div>
              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Input id="paymentTerms" placeholder="e.g., 30 days" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1">Add Supplier</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="py-1 px-2 text-xs font-medium">Supplier ID</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Company Name</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Contact Person</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Phone Number</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Material Supplied</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Payment Terms</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.map((supplier) => (
              <TableRow key={supplier.id} className="h-8">
                <TableCell className="py-1 px-2 text-xs font-medium">{supplier.id}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{supplier.companyName}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{supplier.contactPerson}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{supplier.phone}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{supplier.materialSupplied}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{supplier.paymentTerms}</TableCell>
                <TableCell className="py-1 px-2">
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => handleViewSupplier(supplier)}
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

      {/* View Supplier Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Supplier Details - {selectedSupplier?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Supplier ID</Label>
                <Input value={selectedSupplier?.id || ''} disabled />
              </div>
              <div>
                <Label>Company Name</Label>
                <Input value={selectedSupplier?.companyName || ''} disabled />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contact Person</Label>
                <Input value={selectedSupplier?.contactPerson || ''} disabled />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input value={selectedSupplier?.phone || ''} disabled />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input value={selectedSupplier?.email || ''} disabled />
            </div>
            <div>
              <Label>Material Supplied</Label>
              <Input value={selectedSupplier?.materialSupplied || ''} disabled />
            </div>
            <div>
              <Label>Payment Terms</Label>
              <Input value={selectedSupplier?.paymentTerms || ''} disabled />
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

export default SuppliersSection;
