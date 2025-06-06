
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { FinishedGood } from '@/hooks/useFinishedGoods';

interface StockUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: FinishedGood | null;
  onProductUpdated: () => void;
}

const StockUpdateDialog = ({ isOpen, onOpenChange, product, onProductUpdated }: StockUpdateDialogProps) => {
  const [actionType, setActionType] = useState<'tag-in' | 'tag-out' | ''>('');
  const [quantity, setQuantity] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleActionSelect = (action: 'tag-in' | 'tag-out') => {
    setActionType(action);
    setQuantity('');
  };

  const handleQuantitySubmit = () => {
    if (!quantity || parseInt(quantity) <= 0) {
      toast({
        title: 'Invalid Quantity',
        description: 'Please enter a valid quantity greater than 0',
        variant: 'destructive',
      });
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmUpdate = async () => {
    if (!product || !actionType || !quantity) return;

    setLoading(true);
    try {
      const quantityNum = parseInt(quantity);
      const newStock = actionType === 'tag-in' 
        ? product.current_stock + quantityNum
        : product.current_stock - quantityNum;

      if (newStock < 0) {
        toast({
          title: 'Invalid Operation',
          description: 'Cannot reduce stock below zero',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('finished_goods')
        .update({
          current_stock: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Stock ${actionType === 'tag-in' ? 'added' : 'removed'} successfully`,
      });

      onProductUpdated();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: 'Error',
        description: 'Failed to update stock',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setActionType('');
    setQuantity('');
    setShowConfirmation(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  if (!product) return null;

  if (showConfirmation) {
    const quantityNum = parseInt(quantity);
    const newStock = actionType === 'tag-in' 
      ? product.current_stock + quantityNum
      : product.current_stock - quantityNum;

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Confirm Stock Update
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p><strong>Product:</strong> {product.product_code}</p>
              <p><strong>Action:</strong> {actionType === 'tag-in' ? 'Tag In (Add Stock)' : 'Tag Out (Remove Stock)'}</p>
              <p><strong>Quantity:</strong> {quantity}</p>
              <p><strong>Current Stock:</strong> {product.current_stock}</p>
              <p><strong>New Stock:</strong> {newStock}</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowConfirmation(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleConfirmUpdate}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Confirm Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Stock - {product.product_code}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p><strong>Current Stock:</strong> {product.current_stock}</p>
            <p><strong>Category:</strong> {product.product_config.category}</p>
          </div>

          {!actionType && (
            <div className="space-y-3">
              <Label>Choose Action:</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-16 flex flex-col gap-2"
                  onClick={() => handleActionSelect('tag-in')}
                >
                  <Plus className="h-5 w-5 text-green-600" />
                  <span>Tag In</span>
                  <span className="text-xs text-gray-500">Add Stock</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex flex-col gap-2"
                  onClick={() => handleActionSelect('tag-out')}
                >
                  <Minus className="h-5 w-5 text-red-600" />
                  <span>Tag Out</span>
                  <span className="text-xs text-gray-500">Remove Stock</span>
                </Button>
              </div>
            </div>
          )}

          {actionType && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {actionType === 'tag-in' ? (
                  <Plus className="h-4 w-4 text-green-600" />
                ) : (
                  <Minus className="h-4 w-4 text-red-600" />
                )}
                <Label>
                  {actionType === 'tag-in' ? 'Quantity to Add:' : 'Quantity to Remove:'}
                </Label>
              </div>
              <Input 
                type="number" 
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                min="1"
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setActionType('')}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleQuantitySubmit}
                  disabled={!quantity || parseInt(quantity) <= 0}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockUpdateDialog;
