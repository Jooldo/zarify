
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ProductCodeSelector from '@/components/orders/ProductCodeSelector';
import { useToast } from '@/hooks/use-toast';

interface AddProductionItemDialogProps {
  onAddItem: (item: {
    productCode: string;
    quantity: number;
    expectedDate: Date;
  }) => void;
}

const AddProductionItemDialog = ({ onAddItem }: AddProductionItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [productCode, setProductCode] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expectedDate, setExpectedDate] = useState<Date>();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!productCode) {
      toast({
        title: 'Error',
        description: 'Please select a product',
        variant: 'destructive',
      });
      return;
    }

    if (!quantity || parseInt(quantity) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid quantity',
        variant: 'destructive',
      });
      return;
    }

    if (!expectedDate) {
      toast({
        title: 'Error',
        description: 'Please select an expected date',
        variant: 'destructive',
      });
      return;
    }

    onAddItem({
      productCode,
      quantity: parseInt(quantity),
      expectedDate,
    });

    // Reset form
    setProductCode('');
    setQuantity('');
    setExpectedDate(undefined);
    setOpen(false);

    toast({
      title: 'Success',
      description: 'Production item added to queue',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Production Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <ProductCodeSelector
              value={productCode}
              onChange={setProductCode}
            />
          </div>

          <div>
            <Label htmlFor="quantity" className="text-xs font-medium">
              Quantity *
            </Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1"
              min="1"
            />
          </div>

          <div>
            <Label className="text-xs font-medium">Expected Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full mt-1 justify-start text-left font-normal",
                    !expectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expectedDate ? format(expectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expectedDate}
                  onSelect={setExpectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Add to Queue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductionItemDialog;
