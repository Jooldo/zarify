
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Plus, Minus, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { RawMaterial } from '@/hooks/useRawMaterials';

interface RawMaterialStockUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  material: RawMaterial | null;
  onStockUpdated: () => void;
}

const RawMaterialStockUpdateDialog = ({ isOpen, onOpenChange, material, onStockUpdated }: RawMaterialStockUpdateDialogProps) => {
  const [actionType, setActionType] = useState<'add' | 'subtract' | ''>('');
  const [quantity, setQuantity] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatIndianNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  const getInventoryStatus = (currentStock: number, inProcurement: number, requiredQuantity: number, minimumStock: number) => {
    const shortfall = (Math.max(requiredQuantity, minimumStock)) - (currentStock + inProcurement);
    
    if (shortfall > 0) {
      return { status: 'Critical', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (currentStock <= minimumStock) {
      return { status: 'Low', icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    } else {
      return { status: 'Good', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' };
    }
  };

  const handleActionSelect = (action: 'add' | 'subtract') => {
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
    if (!material || !actionType || !quantity) return;

    setLoading(true);
    try {
      const quantityNum = parseInt(quantity);
      const newStock = actionType === 'add' 
        ? material.current_stock + quantityNum
        : material.current_stock - quantityNum;

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
        .from('raw_materials')
        .update({
          current_stock: newStock,
          last_updated: new Date().toISOString()
        })
        .eq('id', material.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Stock ${actionType === 'add' ? 'added' : 'subtracted'} successfully`,
      });

      onStockUpdated();
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

  if (!material) return null;

  const statusInfo = getInventoryStatus(
    material.current_stock,
    material.in_procurement,
    material.required_quantity || 0,
    material.minimum_stock
  );

  const StatusIcon = statusInfo.icon;

  if (showConfirmation) {
    const quantityNum = parseInt(quantity);
    const newStock = actionType === 'add' 
      ? material.current_stock + quantityNum
      : material.current_stock - quantityNum;

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
              <p><strong>Material:</strong> {material.name}</p>
              <p><strong>Action:</strong> {actionType === 'add' ? 'Add Quantity' : 'Subtract Quantity'}</p>
              <p><strong>Quantity:</strong> {formatIndianNumber(parseInt(quantity))} {material.unit}</p>
              <p><strong>Current Stock:</strong> {formatIndianNumber(material.current_stock)} {material.unit}</p>
              <p><strong>New Stock:</strong> {formatIndianNumber(newStock)} {material.unit}</p>
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
          <DialogTitle>Update Stock - {material.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Read-only Material Context */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium text-sm text-gray-700">Material Information</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Type:</span>
                <p className="font-medium">{material.type}</p>
              </div>
              <div>
                <span className="text-gray-500">Unit:</span>
                <p className="font-medium">{material.unit}</p>
              </div>
              <div>
                <span className="text-gray-500">Current Stock:</span>
                <p className="font-medium">{formatIndianNumber(material.current_stock)} {material.unit}</p>
              </div>
              <div>
                <span className="text-gray-500">Minimum Stock:</span>
                <p className="font-medium">{formatIndianNumber(material.minimum_stock)} {material.unit}</p>
              </div>
            </div>
            
            {/* Current Status */}
            <div className="pt-2 border-t border-gray-200">
              <span className="text-gray-500 text-xs">Current Status:</span>
              <div className={`flex items-center gap-2 mt-1 px-2 py-1 rounded-full ${statusInfo.bgColor} w-fit`}>
                <StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
                <span className={`text-xs font-medium ${statusInfo.color}`}>
                  {statusInfo.status}
                </span>
              </div>
            </div>
          </div>

          {!actionType && (
            <div className="space-y-3">
              <Label>Choose Action:</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-16 flex flex-col gap-2"
                  onClick={() => handleActionSelect('add')}
                >
                  <Plus className="h-5 w-5 text-green-600" />
                  <span>Add Quantity</span>
                  <span className="text-xs text-gray-500">Increase Stock</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex flex-col gap-2"
                  onClick={() => handleActionSelect('subtract')}
                >
                  <Minus className="h-5 w-5 text-red-600" />
                  <span>Subtract Quantity</span>
                  <span className="text-xs text-gray-500">Decrease Stock</span>
                </Button>
              </div>
            </div>
          )}

          {actionType && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {actionType === 'add' ? (
                  <Plus className="h-4 w-4 text-green-600" />
                ) : (
                  <Minus className="h-4 w-4 text-red-600" />
                )}
                <Label>
                  {actionType === 'add' ? 'Quantity to Add:' : 'Quantity to Subtract:'} ({material.unit})
                </Label>
              </div>
              <Input 
                type="number" 
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={`Enter quantity in ${material.unit}`}
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

export default RawMaterialStockUpdateDialog;
