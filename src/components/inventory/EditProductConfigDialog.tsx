
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProductConfig {
  id: string;
  category: string;
  subcategory: string;
  size_value: number;
  weight_range: string | null;
  product_code: string;
  is_active: boolean;
}

interface EditProductConfigDialogProps {
  config: ProductConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: (configId: string) => Promise<void>;
}

const EditProductConfigDialog = ({ config, isOpen, onClose, onUpdate, onDelete }: EditProductConfigDialogProps) => {
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    sizeValue: '',
    weightRange: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (config) {
      const sizeInInches = config.size_value ? (config.size_value * 39.3701).toFixed(2) : '';
      setFormData({
        category: config.category,
        subcategory: config.subcategory,
        sizeValue: sizeInInches,
        weightRange: config.weight_range || '',
        isActive: config.is_active,
      });
    }
  }, [config]);

  const generateProductCode = () => {
    if (!formData.category || !formData.subcategory) return '';
    
    const categoryCode = formData.category.slice(0, 3).toUpperCase();
    const subcategoryCode = formData.subcategory.replace(/\s+/g, '').slice(0, 3).toUpperCase();
    const weightCode = formData.weightRange ? formData.weightRange.split('-')[0] + 'G' : '';
    
    return `${categoryCode}-${subcategoryCode}${weightCode ? '-' + weightCode : ''}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setLoading(true);
    try {
      // Convert inches back to meters for storage
      const sizeValueInMeters = parseFloat(formData.sizeValue) / 39.3701;

      const { error } = await supabase
        .from('product_configs')
        .update({
          category: formData.category,
          subcategory: formData.subcategory,
          size_value: sizeValueInMeters,
          weight_range: formData.weightRange || null,
          is_active: formData.isActive,
        })
        .eq('id', config.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Product configuration updated successfully',
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating product config:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product configuration',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!config) return;

    setDeleteLoading(true);
    try {
      await onDelete(config.id);
      toast({
        title: 'Success',
        description: 'Product configuration deleted successfully',
      });
      onClose();
    } catch (error) {
      console.error('Error deleting product config:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product configuration',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!config) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">Edit Product Configuration</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Product Code Display */}
          <div className="p-2 bg-blue-50 rounded text-xs">
            <Label className="text-xs font-medium">Product Code:</Label>
            <div className="text-sm font-bold text-blue-700">{generateProductCode()}</div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fabric">Fabric</SelectItem>
                  <SelectItem value="Leather">Leather</SelectItem>
                  <SelectItem value="Synthetic">Synthetic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Subcategory *</Label>
              <Select value={formData.subcategory} onValueChange={(value) => setFormData(prev => ({...prev, subcategory: value}))}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Belt">Belt</SelectItem>
                  <SelectItem value="Strap">Strap</SelectItem>
                  <SelectItem value="Band">Band</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Size (inches) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.sizeValue}
                onChange={(e) => setFormData(prev => ({...prev, sizeValue: e.target.value}))}
                className="h-7 text-xs"
                required
              />
            </div>
            <div>
              <Label className="text-xs">Weight Range</Label>
              <Input
                value={formData.weightRange}
                onChange={(e) => setFormData(prev => ({...prev, weightRange: e.target.value}))}
                placeholder="e.g., 50-100g"
                className="h-7 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({...prev, isActive: checked}))}
              className="scale-75"
            />
            <Label className="text-xs">Active</Label>
            <Badge variant={formData.isActive ? "default" : "secondary"} className="text-xs h-4 px-1">
              {formData.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1 h-7 text-xs" disabled={loading}>
              {loading ? 'Updating...' : 'Update'}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  type="button" 
                  variant="destructive" 
                  className="h-7 w-7 p-0" 
                  disabled={deleteLoading}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Product Configuration</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this product configuration? This action cannot be undone and will also delete all associated raw material requirements.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={deleteLoading}>
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button type="button" variant="outline" onClick={onClose} className="h-7 text-xs">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductConfigDialog;
