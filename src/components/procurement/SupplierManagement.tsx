
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Eye, Phone, Mail } from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useProcurementRequests } from '@/hooks/useProcurementRequests';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SupplierManagement = () => {
  const { suppliers, loading, refetch } = useSuppliers();
  const { requests } = useProcurementRequests();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    whatsapp_number: '',
    materials_supplied: '',
    payment_terms: '',
    whatsapp_enabled: true
  });

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSupplierStats = (supplierId) => {
    const supplierRequests = requests.filter(req => req.supplier_id === supplierId);
    const totalOrders = supplierRequests.length;
    const completedOrders = supplierRequests.filter(req => req.status === 'Received').length;
    const avgLeadTime = supplierRequests.filter(req => req.eta).length > 0 ?
      supplierRequests.filter(req => req.eta).reduce((sum, req) => {
        const leadTime = Math.abs(new Date(req.eta).getTime() - new Date(req.date_requested).getTime()) / (1000 * 60 * 60 * 24);
        return sum + leadTime;
      }, 0) / supplierRequests.filter(req => req.eta).length : 0;
    
    return { totalOrders, completedOrders, avgLeadTime: avgLeadTime.toFixed(1) };
  };

  const handleAddSupplier = async () => {
    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      const materialsArray = formData.materials_supplied 
        ? formData.materials_supplied.split(',').map(m => m.trim()).filter(m => m)
        : [];

      const { error } = await supabase
        .from('suppliers')
        .insert([{
          ...formData,
          materials_supplied: materialsArray,
          merchant_id: merchantId
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Supplier added successfully',
      });

      setIsAddDialogOpen(false);
      setFormData({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        whatsapp_number: '',
        materials_supplied: '',
        payment_terms: '',
        whatsapp_enabled: true
      });
      refetch();
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast({
        title: 'Error',
        description: 'Failed to add supplier',
        variant: 'destructive',
      });
    }
  };

  const handleEditSupplier = async () => {
    try {
      const materialsArray = formData.materials_supplied 
        ? formData.materials_supplied.split(',').map(m => m.trim()).filter(m => m)
        : [];

      const { error } = await supabase
        .from('suppliers')
        .update({
          ...formData,
          materials_supplied: materialsArray
        })
        .eq('id', selectedSupplier.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Supplier updated successfully',
      });

      setIsEditDialogOpen(false);
      setSelectedSupplier(null);
      refetch();
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast({
        title: 'Error',
        description: 'Failed to update supplier',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;

    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplierId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Supplier deleted successfully',
      });

      refetch();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete supplier',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      company_name: supplier.company_name,
      contact_person: supplier.contact_person || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      whatsapp_number: supplier.whatsapp_number || '',
      materials_supplied: supplier.materials_supplied?.join(', ') || '',
      payment_terms: supplier.payment_terms || '',
      whatsapp_enabled: supplier.whatsapp_enabled ?? true
    });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return <div>Loading suppliers...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
              <DialogDescription>Enter the supplier details below</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                <Input
                  id="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({...formData, whatsapp_number: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="materials_supplied">Materials Supplied (comma-separated)</Label>
                <Textarea
                  id="materials_supplied"
                  value={formData.materials_supplied}
                  onChange={(e) => setFormData({...formData, materials_supplied: e.target.value})}
                  placeholder="Silver, Gold, Copper..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Input
                  id="payment_terms"
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
                  placeholder="Net 30, COD, etc."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="whatsapp_enabled"
                  checked={formData.whatsapp_enabled}
                  onCheckedChange={(checked) => setFormData({...formData, whatsapp_enabled: checked})}
                />
                <Label htmlFor="whatsapp_enabled">WhatsApp Notifications Enabled</Label>
              </div>
              <Button onClick={handleAddSupplier} className="w-full">
                Add Supplier
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Suppliers Directory</CardTitle>
          <CardDescription>Manage your supplier database and track performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Materials</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => {
                const stats = getSupplierStats(supplier.id);
                return (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{supplier.company_name}</div>
                        <div className="text-sm text-gray-500">{supplier.contact_person}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {supplier.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1" />
                            {supplier.phone}
                          </div>
                        )}
                        {supplier.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {supplier.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {supplier.materials_supplied?.slice(0, 2).map((material, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {material}
                          </Badge>
                        ))}
                        {supplier.materials_supplied?.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{supplier.materials_supplied.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Orders: {stats.totalOrders}</div>
                        <div>Completed: {stats.completedOrders}</div>
                        <div>Avg Lead: {stats.avgLeadTime}d</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.whatsapp_enabled ? "default" : "secondary"}>
                        {supplier.whatsapp_enabled ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(supplier)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSupplier(supplier.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredSuppliers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No suppliers found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>Update the supplier details below</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_company_name">Company Name *</Label>
              <Input
                id="edit_company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_contact_person">Contact Person</Label>
              <Input
                id="edit_contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_phone">Phone</Label>
              <Input
                id="edit_phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_whatsapp_number">WhatsApp Number</Label>
              <Input
                id="edit_whatsapp_number"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({...formData, whatsapp_number: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_materials_supplied">Materials Supplied (comma-separated)</Label>
              <Textarea
                id="edit_materials_supplied"
                value={formData.materials_supplied}
                onChange={(e) => setFormData({...formData, materials_supplied: e.target.value})}
                placeholder="Silver, Gold, Copper..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_payment_terms">Payment Terms</Label>
              <Input
                id="edit_payment_terms"
                value={formData.payment_terms}
                onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
                placeholder="Net 30, COD, etc."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_whatsapp_enabled"
                checked={formData.whatsapp_enabled}
                onCheckedChange={(checked) => setFormData({...formData, whatsapp_enabled: checked})}
              />
              <Label htmlFor="edit_whatsapp_enabled">WhatsApp Notifications Enabled</Label>
            </div>
            <Button onClick={handleEditSupplier} className="w-full">
              Update Supplier
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierManagement;
