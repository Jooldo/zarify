
import { useState, useMemo } from 'react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import SupplierHeader from '@/components/procurement/headers/SupplierHeader';

const SupplierManagement = () => {
  const { suppliers, loading, refetch } = useSuppliers();
  const { rawMaterials } = useRawMaterials();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate supplier stats
  const supplierStats = useMemo(() => {
    const total = suppliers.length;
    const active = suppliers.filter(s => s.whatsapp_enabled !== false).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [suppliers]);

  // Filter suppliers based on search
  const filteredSuppliers = useMemo(() => {
    if (!searchTerm) return suppliers;
    return suppliers.filter(supplier =>
      supplier.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [suppliers, searchTerm]);

  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    whatsapp_number: '',
    address: '',
    materials_supplied: [],
    whatsapp_enabled: true,
    payment_terms: ''
  });

  const resetForm = () => {
    setFormData({
      company_name: '',
      contact_person: '',
      email: '',
      phone: '',
      whatsapp_number: '',
      address: '',
      materials_supplied: [],
      whatsapp_enabled: true,
      payment_terms: ''
    });
  };

  const handleAddSupplier = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      company_name: supplier.company_name || '',
      contact_person: supplier.contact_person || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      whatsapp_number: supplier.whatsapp_number || '',
      address: supplier.address || '',
      materials_supplied: supplier.materials_supplied || [],
      whatsapp_enabled: supplier.whatsapp_enabled ?? true,
      payment_terms: supplier.payment_terms || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      const supplierData = {
        ...formData,
        merchant_id: merchantId
      };

      if (selectedSupplier) {
        // Update existing supplier
        const { error } = await supabase
          .from('suppliers')
          .update(supplierData)
          .eq('id', selectedSupplier.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Supplier updated successfully',
        });
        setIsEditDialogOpen(false);
      } else {
        // Create new supplier
        const { error } = await supabase
          .from('suppliers')
          .insert([supplierData]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Supplier added successfully',
        });
        setIsAddDialogOpen(false);
      }

      resetForm();
      setSelectedSupplier(null);
      refetch();
    } catch (error) {
      console.error('Error saving supplier:', error);
      toast({
        title: 'Error',
        description: 'Failed to save supplier',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
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

  const handleMaterialToggle = (materialId) => {
    setFormData(prev => ({
      ...prev,
      materials_supplied: prev.materials_supplied.includes(materialId)
        ? prev.materials_supplied.filter(id => id !== materialId)
        : [...prev.materials_supplied, materialId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div>Loading suppliers...</div>
      </div>
    );
  }

  const SupplierForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name *</Label>
          <Input
            id="company_name"
            value={formData.company_name}
            onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input
            id="contact_person"
            value={formData.contact_person}
            onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
          <Input
            id="whatsapp_number"
            value={formData.whatsapp_number}
            onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="payment_terms">Payment Terms</Label>
          <Input
            id="payment_terms"
            value={formData.payment_terms}
            onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
            placeholder="e.g., 30 days"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Materials Supplied</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded p-2">
          {rawMaterials.map(material => (
            <div key={material.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`material-${material.id}`}
                checked={formData.materials_supplied.includes(material.id)}
                onChange={() => handleMaterialToggle(material.id)}
                className="rounded"
              />
              <Label htmlFor={`material-${material.id}`} className="text-sm">
                {material.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="whatsapp_enabled"
          checked={formData.whatsapp_enabled}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, whatsapp_enabled: checked }))}
        />
        <Label htmlFor="whatsapp_enabled">Enable WhatsApp Notifications</Label>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : selectedSupplier ? 'Update Supplier' : 'Add Supplier'}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="space-y-6">
      <SupplierHeader 
        onAddSupplier={handleAddSupplier}
        supplierStats={supplierStats}
      />

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Suppliers</CardTitle>
          <CardDescription>Find suppliers by name, contact person, or email</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Suppliers List</CardTitle>
          <CardDescription>Manage your supplier information and track performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Materials</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Payment Terms</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{supplier.company_name}</div>
                        {supplier.contact_person && (
                          <div className="text-sm text-gray-500">{supplier.contact_person}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {supplier.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {supplier.email}
                          </div>
                        )}
                        {supplier.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {supplier.phone}
                          </div>
                        )}
                        {supplier.address && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="h-3 w-3" />
                            {supplier.address.substring(0, 30)}...
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {supplier.materials_supplied?.slice(0, 2).map(materialId => {
                          const material = rawMaterials.find(m => m.id === materialId);
                          return material ? (
                            <Badge key={materialId} variant="secondary" className="text-xs">
                              {material.name}
                            </Badge>
                          ) : null;
                        })}
                        {supplier.materials_supplied?.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{supplier.materials_supplied.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.whatsapp_enabled ? "default" : "secondary"}>
                        {supplier.whatsapp_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {supplier.payment_terms || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSupplier(supplier)}
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
                ))}
                {filteredSuppliers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {searchTerm ? 'No suppliers found matching your search.' : 'No suppliers added yet.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Supplier Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>
              Add a new supplier to your network
            </DialogDescription>
          </DialogHeader>
          <SupplierForm />
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Update supplier information
            </DialogDescription>
          </DialogHeader>
          <SupplierForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierManagement;
