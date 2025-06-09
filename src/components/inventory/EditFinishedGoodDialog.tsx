
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EditFinishedGoodDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: any | null;
  onProductUpdated: () => void;
}

const EditFinishedGoodDialog = ({ isOpen, onOpenChange, product, onProductUpdated }: EditFinishedGoodDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    current_stock: 0,
    threshold: 0,
    required_quantity: 0,
    in_manufacturing: 0,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        current_stock: product.current_stock || 0,
        threshold: product.threshold || 0,
        required_quantity: product.required_quantity || 0,
        in_manufacturing: product.in_manufacturing || 0,
      });
    }
  }, [product, isOpen]);

  const handleUpdate = async () => {
    if (!product) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('finished_goods')
        .update({
          current_stock: formData.current_stock,
          threshold: formData.threshold,
          required_quantity: formData.required_quantity,
          in_manufacturing: formData.in_manufacturing,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Finished good updated successfully',
      });

      // Auto refresh related data
      await onProductUpdated();
      queryClient.invalidateQueries({ queryKey: ['finished-goods'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating finished good:', error);
      toast({
        title: 'Error',
        description: 'Failed to update finished good',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Finished Good</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p><strong>Product Code:</strong> {product.product_code}</p>
            <p><strong>Category:</strong> {product.product_config?.category}</p>
            <p><strong>Subcategory:</strong> {product.product_config?.subcategory}</p>
          </div>
          
          <div>
            <Label htmlFor="currentStock">Current Stock</Label>
            <Input 
              id="currentStock" 
              type="number" 
              value={formData.current_stock}
              onChange={(e) => handleInputChange('current_stock', parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>
          
          <div>
            <Label htmlFor="threshold">Threshold</Label>
            <Input 
              id="threshold" 
              type="number" 
              value={formData.threshold}
              onChange={(e) => handleInputChange('threshold', parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>

          <div>
            <Label htmlFor="requiredQuantity">Required Quantity</Label>
            <Input 
              id="requiredQuantity" 
              type="number" 
              value={formData.required_quantity}
              onChange={(e) => handleInputChange('required_quantity', parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>

          <div>
            <Label htmlFor="inManufacturing">In Manufacturing</Label>
            <Input 
              id="inManufacturing" 
              type="number" 
              value={formData.in_manufacturing}
              onChange={(e) => handleInputChange('in_manufacturing', parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>

          <Button 
            className="w-full" 
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Product'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditFinishedGoodDialog;
