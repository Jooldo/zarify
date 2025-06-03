
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, Eye } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const CustomersSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const customers = [
    {
      id: "CUST-001",
      name: "Priya Sharma",
      phone: "+91 98765 43210",
      email: "priya.sharma@email.com",
      address: "123 MG Road, Bangalore, Karnataka 560001",
      orderHistory: "5 orders",
      notes: "Prefers traditional designs, regular customer"
    },
    {
      id: "CUST-002",
      name: "Anjali Patel",
      phone: "+91 98765 43211",
      email: "anjali.patel@email.com",
      address: "456 Station Road, Ahmedabad, Gujarat 380001",
      orderHistory: "3 orders",
      notes: "Bulk orders for festivals"
    },
    {
      id: "CUST-003",
      name: "Meera Singh",
      phone: "+91 98765 43212",
      email: "meera.singh@email.com",
      address: "789 Market Street, Jaipur, Rajasthan 302001",
      orderHistory: "8 orders",
      notes: "VIP customer, prefers premium quality"
    },
    {
      id: "CUST-004",
      name: "Lakshmi Nair",
      phone: "+91 98765 43213",
      email: "lakshmi.nair@email.com",
      address: "321 Temple Road, Kochi, Kerala 682001",
      orderHistory: "2 orders",
      notes: "New customer, interested in modern designs"
    }
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-8"
          />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 h-8 px-3 text-xs">
              <Plus className="h-3 w-3" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName">Name</Label>
                <Input id="customerName" placeholder="Enter customer name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="customer@email.com" />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" placeholder="Enter complete address" />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Add any notes about the customer..." />
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1">Add Customer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="py-1 px-2 text-xs font-medium">Customer ID</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Name</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Phone Number</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Email</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Order History</TableHead>
              <TableHead className="py-1 px-2 text-xs font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id} className="h-8">
                <TableCell className="py-1 px-2 text-xs font-medium">{customer.id}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{customer.name}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{customer.phone}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{customer.email}</TableCell>
                <TableCell className="py-1 px-2 text-xs">{customer.orderHistory}</TableCell>
                <TableCell className="py-1 px-2">
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => handleViewCustomer(customer)}
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

      {/* View Customer Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details - {selectedCustomer?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input value={selectedCustomer?.name || ''} disabled />
              </div>
              <div>
                <Label>Customer ID</Label>
                <Input value={selectedCustomer?.id || ''} disabled />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone Number</Label>
                <Input value={selectedCustomer?.phone || ''} disabled />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={selectedCustomer?.email || ''} disabled />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Textarea value={selectedCustomer?.address || ''} disabled />
            </div>
            <div>
              <Label>Order History</Label>
              <Input value={selectedCustomer?.orderHistory || ''} disabled />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={selectedCustomer?.notes || ''} disabled />
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

export default CustomersSection;
