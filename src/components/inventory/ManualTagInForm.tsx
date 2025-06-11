import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInventoryTags } from '@/hooks/useInventoryTags';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createErrorFromCode } from '@/utils/errorUtils';

interface ManualTagInFormProps {
  onOperationComplete?: () => void;
}

const ManualTagInForm = ({ onOperationComplete }: ManualTagInFormProps) => {
  const [productId, setProductId] = useState('');
  const [netWeight, setNetWeight] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { manualTagIn } = useInventoryTags();
  const { finishedGoods } = useFinishedGoods();
  const { toast } = useToast();

  const handleManualTagIn = async () => {
    if (!productId || !quantity) {
      const error = await createErrorFromCode('VAL_001', 'Product and quantity are required');
      const errorEvent = new CustomEvent('show-error-dialog', {
        detail: { error }
      });
      window.dispatchEvent(errorEvent);
      return;
    }

    setLoading(true);
    try {
      await manualTagIn(
        productId, 
        parseInt(quantity), 
        netWeight ? parseFloat(netWeight) : undefined, 
        grossWeight ? parseFloat(grossWeight) : undefined
      );
      
      // Reset form
      setProductId('');
      setNetWeight('');
      setGrossWeight('');
      setQuantity('');

      if (onOperationComplete) {
        onOperationComplete();
      }
    } catch (error) {
      console.error('Error processing manual tag in:', error);
      
      // Create appropriate error based on the error message
      let errorCode = 'SYS_001'; // Default system error
      if (error instanceof Error) {
        if (error.message.includes('Insufficient stock')) {
          errorCode = 'INV_001';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorCode = 'NET_001';
        }
      }
      
      const errorDetails = await createErrorFromCode(errorCode, error instanceof Error ? error.message : 'Failed to process manual tag in');
      const errorEvent = new CustomEvent('show-error-dialog', {
        detail: { error: errorDetails }
      });
      window.dispatchEvent(errorEvent);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="productCode" className="text-xs">Product Code</Label>
        <Select value={productId} onValueChange={setProductId}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Select product..." />
          </SelectTrigger>
          <SelectContent>
            {finishedGoods.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.product_code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="netWeight" className="text-xs">Net Weight (kg)</Label>
          <Input
            id="netWeight"
            type="number"
            step="0.01"
            value={netWeight}
            onChange={(e) => setNetWeight(e.target.value)}
            placeholder="0.00"
            className="h-8"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="grossWeight" className="text-xs">Gross Weight (kg)</Label>
          <Input
            id="grossWeight"
            type="number"
            step="0.01"
            value={grossWeight}
            onChange={(e) => setGrossWeight(e.target.value)}
            placeholder="0.00"
            className="h-8"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="quantity" className="text-xs">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Enter quantity..."
          className="h-8"
        />
      </div>

      <Button 
        onClick={handleManualTagIn} 
        disabled={loading || !productId || !quantity}
        className="w-full h-8 text-xs"
      >
        {loading ? 'Processing...' : (
          <>
            <Plus className="h-3 w-3 mr-1" />
            Manual Tag In
          </>
        )}
      </Button>

      <div className="text-xs text-muted-foreground">
        <p>Directly add stock to inventory without creating physical tags</p>
      </div>
    </div>
  );
};

export default ManualTagInForm;
