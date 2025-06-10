
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInventoryTags } from '@/hooks/useInventoryTags';
import { useFinishedGoods } from '@/hooks/useFinishedGoods';
import { Printer, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TagPrintFormProps {
  onTagGenerated?: (tagData: any) => void;
}

const TagPrintForm = ({ onTagGenerated }: TagPrintFormProps) => {
  const [productId, setProductId] = useState('');
  const [netWeight, setNetWeight] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { generateTag } = useInventoryTags();
  const { finishedGoods } = useFinishedGoods();
  const { toast } = useToast();

  const handlePrintTag = async () => {
    if (!productId || !netWeight || !grossWeight || !quantity) {
      toast({
        title: 'Error',
        description: 'All fields are required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const tagData = await generateTag(
        productId, 
        parseInt(quantity), 
        parseFloat(netWeight), 
        parseFloat(grossWeight)
      );
      
      toast({
        title: 'Success',
        description: 'Tag generated successfully! Ready to print.',
      });

      // Reset form
      setProductId('');
      setNetWeight('');
      setGrossWeight('');
      setQuantity('');

      if (onTagGenerated) {
        onTagGenerated(tagData);
      }
    } catch (error) {
      console.error('Error generating tag:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="h-5 w-5" />
          Print Tag (Tag In)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="productCode">Product Code</Label>
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger>
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

        <div className="space-y-2">
          <Label htmlFor="netWeight">Net Weight (kg)</Label>
          <Input
            id="netWeight"
            type="number"
            step="0.01"
            value={netWeight}
            onChange={(e) => setNetWeight(e.target.value)}
            placeholder="Enter net weight..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="grossWeight">Gross Weight (kg)</Label>
          <Input
            id="grossWeight"
            type="number"
            step="0.01"
            value={grossWeight}
            onChange={(e) => setGrossWeight(e.target.value)}
            placeholder="Enter gross weight..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity..."
          />
        </div>

        <Button 
          onClick={handlePrintTag} 
          disabled={loading || !productId || !netWeight || !grossWeight || !quantity}
          className="w-full"
        >
          {loading ? 'Generating...' : (
            <>
              <QrCode className="h-4 w-4 mr-2" />
              Generate & Print Tag
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground">
          <p>After printing, scan the barcode to tag in the product to stock</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TagPrintForm;
