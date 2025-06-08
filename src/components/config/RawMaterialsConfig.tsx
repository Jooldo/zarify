
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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2 } from 'lucide-react';
import ConfigHeader from '@/components/procurement/headers/ConfigHeader';
import MaterialTypeSelector from '@/components/inventory/MaterialTypeSelector';

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
    minimum_stock: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      unit: '',
      minimum_stock: ''
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
      minimum_stock: material.minimum_stock?.toString() || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.unit) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields (Name, Type, Unit)',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      const materialData = {
        name: formData.name.trim(),
        type: formData.type.trim(),
        unit: formData.unit,
        minimum_stock: parseInt(formData.minimum_stock) || 0,
        current_stock: 0,
        merchant_id: merchantId,
        required: 0,
        in_procurement: 0,
        last_updated: new Date().toISOString()
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
      <div className="min-h-[400px] flex items-center justify-center bg-card rounded-lg border border-border">
        <div className="text-muted-foreground">Loading materials configuration...</div>
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
            placeholder="Enter material name"
            required
          />
        </div>
        <div className="space-y-2">
          <MaterialTypeSelector
            value={formData.type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            placeholder="Select or create material type"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="unit">Unit *</Label>
          <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grams">Grams (g)</SelectItem>
              <SelectItem value="pieces">Pieces</SelectItem>
              <SelectItem value="meters">Meters (m)</SelectItem>
              <SelectItem value="rolls">Rolls</SelectItem>
              <SelectItem value="kg">Kilograms (kg)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="minimum_stock">Minimum Stock Level</Label>
          <Input
            id="minimum_stock"
            type="number"
            value={formData.minimum_stock}
            onChange={(e) => setFormData(prev => ({ ...prev, minimum_stock: e.target.value }))}
            placeholder="0"
            min="0"
          />
        </div>
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

      
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Raw Materials Configuration</CardTitle>
              <CardDescription className="text-muted-foreground">Manage your raw material catalog and settings</CardDescription>
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

      
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="min-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-foreground">Material</TableHead>
                  <TableHead className="text-foreground">Type</TableHead>
                  <TableHead className="text-foreground">Unit</TableHead>
                  <TableHead className="text-foreground">Min Stock</TableHead>
                  <TableHead className="text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map((material) => (
                  <TableRow key={material.id} className="border-border">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">{material.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {material.type && (
                        <Badge variant="secondary">{material.type}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-foreground">{material.unit || '-'}</TableCell>
                    <TableCell className="text-foreground">{material.minimum_stock || 0}</TableCell>
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
                  <TableRow className="border-border">
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add New Raw Material</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add a new raw material to your catalog. You can assign suppliers later through the Users section.
            </DialogDescription>
          </DialogHeader>
          <MaterialForm />
        </DialogContent>
      </Dialog>

      {/* Edit Material Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Raw Material</DialogTitle>
            <DialogDescription className="text-muted-foreground">
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
