
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useProductConfigs } from '@/hooks/useProductConfigs';

interface AddToQueueDialogProps {
  onProductAdded: (newItem: any) => void;
}

const AddToQueueDialog = ({ onProductAdded }: AddToQueueDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [productConfigId, setProductConfigId] = useState('');
  const [quantityRequired, setQuantityRequired] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [estimatedCompletion, setEstimatedCompletion] = useState<Date>();
  const [orderNumbers, setOrderNumbers] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { productConfigs, loading: configsLoading } = useProductConfigs();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!productConfigId || !quantityRequired || !estimatedCompletion) {
        toast({
          title: 'Missing Information',
          description: 'Please fill in all required fields.',
          variant: 'destructive',
        });
        return;
      }

      const selectedConfig = productConfigs.find(config => config.id === productConfigId);
      if (!selectedConfig) {
        throw new Error('Product configuration not found');
      }

      // Create new production item
      const newProductionItem = {
        id: `prod-${Date.now()}`,
        product_code: selectedConfig.product_code,
        category: selectedConfig.category,
        subcategory: selectedConfig.subcategory,
        size: `${selectedConfig.size_value}"`,
        quantity_required: parseInt(quantityRequired),
        quantity_in_progress: 0,
        priority,
        status: 'Queued' as const,
        estimated_completion: format(estimatedCompletion, 'yyyy-MM-dd'),
        order_numbers: orderNumbers.split(',').map(n => n.trim()).filter(n => n),
        created_date: format(new Date(), 'yyyy-MM-dd'),
        current_step: 1,
        manufacturing_steps: [
          { step: 1, name: 'Jalhai', status: 'Pending' as const, completed_quantity: 0 },
          { step: 2, name: 'Cutting & Shaping', status: 'Pending' as const, completed_quantity: 0 },
          { step: 3, name: 'Assembly', status: 'Pending' as const, completed_quantity: 0 },
          { step: 4, name: 'Finishing', status: 'Pending' as const, completed_quantity: 0 },
          { step: 5, name: 'Quality Control', status: 'Pending' as const, completed_quantity: 0 }
        ]
      };

      console.log('Creating new production item:', newProductionItem);

      toast({
        title: 'Product Added to Queue',
        description: `${selectedConfig.product_code} has been added to the manufacturing queue.`,
      });

      onProductAdded(newProductionItem);
      
      // Reset form
      setProductConfigId('');
      setQuantityRequired('');
      setPriority('Medium');
      setEstimatedCompletion(undefined);
      setOrderNumbers('');
      setNotes('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding product to queue:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product to manufacturing queue.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add to Queue
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Product to Manufacturing Queue</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Configuration Selection */}
          <div>
            <Label htmlFor="productConfig" className="text-sm font-medium">Product Configuration *</Label>
            <Select 
              value={productConfigId} 
              onValueChange={setProductConfigId}
              disabled={configsLoading}
            >
              <SelectTrigger className="h-10 text-sm mt-2">
                <SelectValue placeholder={configsLoading ? "Loading..." : "Select product configuration"} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {productConfigs.map((config) => (
                  <SelectItem key={config.id} value={config.id} className="text-sm py-3">
                    <div className="space-y-1">
                      <div className="font-medium">{config.product_code}</div>
                      <div className="text-xs text-gray-600">
                        {config.subcategory} • {config.category} • {config.size_value?.toFixed(2)}" • {config.weight_range}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity" className="text-sm font-medium">Quantity Required *</Label>
              <Input
                id="quantity"
                type="number"
                value={quantityRequired}
                onChange={(e) => setQuantityRequired(e.target.value)}
                placeholder="50"
                className="h-10 text-sm mt-2"
                min="1"
                required
              />
            </div>

            <div>
              <Label htmlFor="priority" className="text-sm font-medium">Priority *</Label>
              <Select value={priority} onValueChange={(value: 'High' | 'Medium' | 'Low') => setPriority(value)}>
                <SelectTrigger className="h-10 text-sm mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estimated Completion Date */}
          <div>
            <Label className="text-sm font-medium">Estimated Completion Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10 text-sm mt-2",
                    !estimatedCompletion && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {estimatedCompletion ? format(estimatedCompletion, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={estimatedCompletion}
                  onSelect={setEstimatedCompletion}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Order Numbers */}
          <div>
            <Label htmlFor="orderNumbers" className="text-sm font-medium">Related Order Numbers</Label>
            <Input
              id="orderNumbers"
              value={orderNumbers}
              onChange={(e) => setOrderNumbers(e.target.value)}
              placeholder="ORD-001, ORD-002 (comma separated)"
              className="h-10 text-sm mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">Enter order numbers separated by commas</p>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions or requirements..."
              rows={3}
              className="text-sm mt-2"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <Button type="submit" className="flex-1 h-10 text-sm" disabled={loading || !productConfigId}>
              {loading ? 'Adding...' : 'Add to Queue'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="h-10 text-sm px-6">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddToQueueDialog;
