
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { CalendarIcon, Plus, Check, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useProductConfigs } from '@/hooks/useProductConfigs';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AddToQueueDialogProps {
  onProductAdded: (newItem: any) => void;
}

const AddToQueueDialog = ({ onProductAdded }: AddToQueueDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [productConfigId, setProductConfigId] = useState('');
  const [quantityRequired, setQuantityRequired] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [estimatedCompletion, setEstimatedCompletion] = useState<Date>();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { productConfigs, loading: configsLoading } = useProductConfigs();
  const { rawMaterials } = useRawMaterials();

  const selectedConfig = productConfigs.find(config => config.id === productConfigId);
  const quantity = parseInt(quantityRequired) || 0;

  // Calculate material requirements based on quantity
  const materialRequirements = selectedConfig?.product_config_materials?.map(material => {
    const rawMaterial = rawMaterials.find(rm => rm.id === material.raw_material_id);
    const totalRequired = material.quantity_required * quantity;
    
    return {
      ...material,
      rawMaterial,
      totalRequired,
      currentStock: rawMaterial?.current_stock || 0,
      shortfall: Math.max(0, totalRequired - (rawMaterial?.current_stock || 0))
    };
  }) || [];

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
        order_numbers: [],
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Product to Manufacturing Queue</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Searchable Product Configuration */}
              <div>
                <Label className="text-sm font-medium">Product Configuration *</Label>
                <Popover open={configOpen} onOpenChange={setConfigOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={configOpen}
                      className="w-full justify-between mt-1"
                      disabled={configsLoading}
                    >
                      {selectedConfig ? selectedConfig.product_code : "Select product configuration..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search product configurations..." />
                      <CommandList>
                        <CommandEmpty>No product configuration found.</CommandEmpty>
                        <CommandGroup>
                          {productConfigs.map((config) => (
                            <CommandItem
                              key={config.id}
                              value={config.product_code}
                              onSelect={() => {
                                setProductConfigId(config.id);
                                setConfigOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  productConfigId === config.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div>
                                <div className="font-medium">{config.product_code}</div>
                                <div className="text-xs text-gray-600">
                                  {config.subcategory} • {config.category} • {config.size_value?.toFixed(2)}"
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Quantity and Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="quantity" className="text-sm font-medium">Quantity Required *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantityRequired}
                    onChange={(e) => setQuantityRequired(e.target.value)}
                    placeholder="50"
                    className="mt-1"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="priority" className="text-sm font-medium">Priority *</Label>
                  <Select value={priority} onValueChange={(value: 'High' | 'Medium' | 'Low') => setPriority(value)}>
                    <SelectTrigger className="mt-1">
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
                        "w-full justify-start text-left font-normal mt-1",
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

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Product Details */}
              {selectedConfig && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Product Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">Category</Label>
                        <div className="font-medium">{selectedConfig.category}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Subcategory</Label>
                        <div className="font-medium">{selectedConfig.subcategory}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Size</Label>
                        <div className="font-medium">{selectedConfig.size_value?.toFixed(2)}"</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Weight</Label>
                        <div className="font-medium">{selectedConfig.weight_range}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Current Stock</Label>
                        <div className="font-medium">{selectedConfig.finished_goods?.[0]?.threshold || 0}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Ordered Qty</Label>
                        <div className="font-medium">0</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Label className="text-xs text-muted-foreground">Status:</Label>
                      <Badge variant={selectedConfig.is_active ? "default" : "secondary"} className="text-xs">
                        {selectedConfig.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Raw Materials Requirements */}
              {selectedConfig && quantity > 0 && materialRequirements.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Raw Materials Required</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Material</TableHead>
                          <TableHead className="text-xs">Required</TableHead>
                          <TableHead className="text-xs">Available</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {materialRequirements.map((requirement, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-xs">
                              <div>
                                <div className="font-medium">{requirement.rawMaterial?.name || 'Unknown'}</div>
                                <div className="text-muted-foreground">{requirement.rawMaterial?.type}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs">
                              {requirement.totalRequired.toFixed(2)} {requirement.unit}
                            </TableCell>
                            <TableCell className="text-xs">
                              {requirement.currentStock.toFixed(2)} {requirement.unit}
                            </TableCell>
                            <TableCell className="text-xs">
                              {requirement.shortfall > 0 ? (
                                <Badge variant="destructive" className="text-xs">
                                  Short: {requirement.shortfall.toFixed(2)}
                                </Badge>
                              ) : (
                                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                  Sufficient
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" className="flex-1" disabled={loading || !productConfigId}>
              {loading ? 'Adding...' : 'Add to Queue'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="px-6">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddToQueueDialog;
