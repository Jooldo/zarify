
import { useState, useEffect } from 'react';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useMaterialTypes } from '@/hooks/useMaterialTypes';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import ConfigHeader from '@/components/procurement/headers/ConfigHeader';

const RawMaterialsConfig = () => {
  const { rawMaterials, loading, refetch } = useRawMaterials();
  const { suppliers } = useSuppliers();
  const { materialTypes } = useMaterialTypes();
  const { toast } = useToast();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    unit: '',
    cost_per_unit: '',
    minimum_stock_level: '',
    description: '',
    supplier_ids: []
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      unit: '',
      cost_per_unit: '',
      minimum_stock_level: '',
      description: '',
      supplier_ids: []
    });
  };

  const handleAddMaterial = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditMaterial = (material) => {
    setSelectedMaterial(material);
    setFormData({
      name: material.name || '',
      type: material.type || '',
      unit: material.unit || '',
      cost_per_unit: material.cost_per_unit?.toString() || '',
      minimum_stock_level: material.minimum_stock_level?.toString() || '',
      description: material.description || '',
      supplier_ids: material.supplier_ids || []
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

      const materialData = {
        ...formData,
        cost_per_unit: parseFloat(formData.cost_per_unit) || 0,
        minimum_stock_level: parseInt(formData.minimum_stock_level) || 0,
        merchant_id: merchantId
      };

      if (selectedMaterial) {
        // Update existing material
        const { error } = await supabase
          .from('raw_materials')
          .update(materialData)
          .eq('id', selectedMaterial.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Raw material updated successfully',
        });
        setIsEditDialogOpen(false);
      } else {
        // Create new material
        const { error } = await supabase
          .from('raw_materials')
          .insert([materialData]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Raw material added successfully',
        });
        setIsAddDialogOpen(false);
      }

      resetForm();
      setSelectedMaterial(null);
      refetch();
    } catch (error) {
      console.error('Error saving material:', error);
      toast({
        title: 'Error',
        description: 'Failed to save material',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      const { error } = await supabase
        .from('raw_materials')
        .delete()
        .eq('id', materialId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Raw material deleted successfully',
      });
      refetch();
    } catch (error) {
      console.error('Error deleting material:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete material',
        variant: 'destructive',
      });
    }
  };

  const filteredMaterials = rawMaterials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const uniqueTypes = [...new Set(materialTypes.map(type => type.name))];

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div>Loading materials configuration...</div>
      </div>
    );
  }

  const MaterialForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Material Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Material Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {uniqueTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            value={formData.unit}
            onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
            placeholder="kg, pcs, meters, etc."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cost_per_unit">Cost per Unit</Label>
          <Input
            id="cost_per_unit"
            type="number"
            step="0.01"
            value={formData.cost_per_unit}
            onChange={(e) => setFormData(prev => ({ ...prev, cost_per_unit: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minimum_stock_level">Minimum Stock Level</Label>
          <Input
            id="minimum_stock_level"
            type="number"
            value={formData.minimum_stock_level}
            onChange={(e) => setFormData(prev => ({ ...prev, minimum_stock_level: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : selectedMaterial ? 'Update Material' : 'Add Material'}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="space-y-6">
      <ConfigHeader 
        materialCount={rawMaterials.length}
        typeCount={uniqueTypes.length}
        supplierCount={suppliers.length}
      />

      {/* Search and Add */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Raw Materials Configuration</CardTitle>
              <CardDescription>Manage your raw material catalog and settings</CardDescription>
            </div>
            <Button onClick={handleAddMaterial} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Material
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      {/* Materials Table */}
      <Card>
        <CardContent>
          <div className="min-h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Cost per Unit</TableHead>
                  <TableHead>Min Stock</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{material.name}</div>
                        {material.description && (
                          <div className="text-sm text-gray-500">{material.description.substring(0, 50)}...</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {material.type && (
                        <Badge variant="secondary">{material.type}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{material.unit || '-'}</TableCell>
                    <TableCell>₹{material.cost_per_unit || 0}</TableCell>
                    <TableCell>{material.minimum_stock_level || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditMaterial(material)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMaterial(material.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMaterials.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {searchTerm ? 'No materials found matching your search.' : 'No materials configured yet.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Material Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Raw Material</DialogTitle>
            <DialogDescription>
              Add a new raw material to your catalog
            </DialogDescription>
          </DialogHeader>
          <MaterialForm />
        </DialogContent>
      </Dialog>

      {/* Edit Material Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Raw Material</DialogTitle>
            <DialogDescription>
              Update raw material information
            </DialogDescription>
          </DialogHeader>
          <MaterialForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RawMaterialsConfig;
