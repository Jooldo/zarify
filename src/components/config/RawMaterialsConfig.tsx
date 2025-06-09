
import { useState, useEffect, useCallback } from 'react';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useMaterialTypes } from '@/hooks/useMaterialTypes';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import ConfigHeader from '@/components/procurement/headers/ConfigHeader';
import RawMaterialsConfigFilter from '@/components/config/RawMaterialsConfigFilter';
import MaterialForm from '@/components/config/MaterialForm';

interface MaterialFormData {
  name: string;
  type: string;
  unit: string;
  minimum_stock: string;
}

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
  const [filters, setFilters] = useState({});

  const [formData, setFormData] = useState<MaterialFormData>({
    name: '',
    type: '',
    unit: '',
    minimum_stock: ''
  });

  const applyFilters = (materials: any[], appliedFilters: any) => {
    return materials.filter(material => {
      // Search term filter
      const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           material.type?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // Type filter
      if (appliedFilters.type && material.type !== appliedFilters.type) return false;
      
      // Unit filter
      if (appliedFilters.unit && material.unit !== appliedFilters.unit) return false;
      
      // Min stock range filter
      if (appliedFilters.minStockRange) {
        const minStock = material.minimum_stock || 0;
        const range = appliedFilters.minStockRange;
        
        if (range === '0-10' && (minStock < 0 || minStock > 10)) return false;
        if (range === '11-50' && (minStock < 11 || minStock > 50)) return false;
        if (range === '51-100' && (minStock < 51 || minStock > 100)) return false;
        if (range === '101-500' && (minStock < 101 || minStock > 500)) return false;
        if (range === '500+' && minStock <= 500) return false;
      }
      
      // Quick filters
      if (appliedFilters.hasMinStock && (!material.minimum_stock || material.minimum_stock === 0)) return false;
      if (appliedFilters.noMinStock && material.minimum_stock && material.minimum_stock > 0) return false;
      
      return true;
    });
  };

  const filteredMaterials = applyFilters(rawMaterials, filters);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      type: '',
      unit: '',
      minimum_stock: ''
    });
  }, []);

  const handleAddMaterial = useCallback(() => {
    resetForm();
    setIsAddDialogOpen(true);
  }, [resetForm]);

  const handleEditMaterial = useCallback((material) => {
    setSelectedMaterial(material);
    setFormData({
      name: material.name || '',
      type: material.type || '',
      unit: material.unit || '',
      minimum_stock: material.minimum_stock?.toString() || ''
    });
    setIsEditDialogOpen(true);
  }, []);

  const handleFormDataChange = useCallback((newFormData: MaterialFormData) => {
    setFormData(newFormData);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
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

  const uniqueTypes = [...new Set(materialTypes.map(type => type.name))];

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-card rounded-lg border border-border">
        <div className="text-muted-foreground">Loading materials configuration...</div>
      </div>
    );
  }

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
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <RawMaterialsConfigFilter
              onFiltersChange={setFilters}
              materialTypes={uniqueTypes}
            />
          </div>
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
                      {searchTerm || Object.keys(filters).some(key => filters[key]) ? 'No materials found matching your search or filters.' : 'No materials configured yet.'}
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
          <MaterialForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isEditing={false}
          />
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
          <MaterialForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RawMaterialsConfig;
