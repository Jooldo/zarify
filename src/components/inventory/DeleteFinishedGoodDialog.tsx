
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DeleteFinishedGoodDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: any | null;
  onProductDeleted: () => void;
}

const DeleteFinishedGoodDialog = ({ isOpen, onOpenChange, product, onProductDeleted }: DeleteFinishedGoodDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!product) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('finished_goods')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Finished good deleted successfully',
      });

      onProductDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting finished good:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete finished good',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Finished Good
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this finished good? This action cannot be undone.
          </p>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <p><strong>Product Code:</strong> {product.product_code}</p>
            <p><strong>Category:</strong> {product.product_config?.category}</p>
            <p><strong>Current Stock:</strong> {product.current_stock}</p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteFinishedGoodDialog;
