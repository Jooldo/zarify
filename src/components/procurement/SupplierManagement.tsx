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
import { Building2, Edit, Trash2, Phone, Mail, MapPin, Search, Plus } from 'lucide-react';
import SupplierHeader from '@/components/procurement/headers/SupplierHeader';
import TableSkeleton from '@/components/ui/skeletons/TableSkeleton';

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
      <div className="space-y-6">
        <div className="bg-card border-b border-border">
          <div className="flex items-center justify-between py-6">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted rounded-md animate-pulse" />
              <div className="h-4 w-64 bg-muted rounded-md animate-pulse" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <div className="h-8 w-full bg-muted rounded-md animate-pulse" />
          </div>
          <div className="h-8 w-24 bg-muted rounded-md animate-pulse" />
        </div>

        <TableSkeleton 
          rows={10} 
          columns={6}
          columnWidths={['w-24', 'w-28', 'w-24', 'w-16', 'w-16', 'w-20']}
        />
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
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-8"
          />
        </div>
        <Button onClick={handleAddSupplier} size="sm" className="h-8 text-xs px-3">
          <Plus className="h-3 w-3 mr-1" />
          Add Supplier
        </Button>
      </div>

      {/* Compact Suppliers Table */}
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="h-8 px-2 text-xs font-medium">Company</TableHead>
              <TableHead className="h-8 px-2 text-xs font-medium">Contact</TableHead>
              <TableHead className="h-8 px-2 text-xs font-medium">Materials</TableHead>
              <TableHead className="h-8 px-2 text-xs font-medium">WhatsApp</TableHead>
              <TableHead className="h-8 px-2 text-xs font-medium">Payment</TableHead>
              <TableHead className="h-8 px-2 text-xs font-medium w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.map((supplier) => (
              <TableRow key={supplier.id} className="h-10 hover:bg-gray-50">
                <TableCell className="px-2 py-1 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-medium truncate max-w-24">{supplier.company_name}</div>
                    {supplier.contact_person && (
                      <div className="text-xs text-gray-500 truncate max-w-24">{supplier.contact_person}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-2 py-1 text-xs">
                  <div className="space-y-0.5">
                    {supplier.email && (
                      <div className="flex items-center gap-1 text-xs truncate max-w-28">
                        <Mail className="h-2.5 w-2.5 flex-shrink-0" />
                        <span className="truncate">{supplier.email}</span>
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center gap-1 text-xs truncate max-w-28">
                        <Phone className="h-2.5 w-2.5 flex-shrink-0" />
                        <span className="truncate">{supplier.phone}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-2 py-1 text-xs">
                  <div className="flex flex-wrap gap-0.5">
                    {supplier.materials_supplied?.slice(0, 2).map(materialId => {
                      const material = rawMaterials.find(m => m.id === materialId);
                      return material ? (
                        <Badge key={materialId} variant="secondary" className="text-xs h-4 px-1">
                          {material.name.substring(0, 8)}...
                        </Badge>
                      ) : null;
                    })}
                    {supplier.materials_supplied?.length > 2 && (
                      <Badge variant="outline" className="text-xs h-4 px-1">
                        +{supplier.materials_supplied.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-2 py-1">
                  <Badge 
                    variant={supplier.whatsapp_enabled ? "default" : "secondary"} 
                    className="text-xs h-4 px-1"
                  >
                    {supplier.whatsapp_enabled ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell className="px-2 py-1 text-xs truncate max-w-16">
                  {supplier.payment_terms || "-"}
                </TableCell>
                <TableCell className="px-2 py-1">
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleEditSupplier(supplier)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteSupplier(supplier.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredSuppliers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-gray-500">
                  {searchTerm ? 'No suppliers found matching your search.' : 'No suppliers added yet.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
