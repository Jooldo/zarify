
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Package2, Calculator } from 'lucide-react';
import { useProductConfigs } from '@/hooks/useProductConfigs';
import { useManufacturingOrders } from '@/hooks/useManufacturingOrders';

interface CreateManufacturingOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateManufacturingOrderDialog = ({ open, onOpenChange }: CreateManufacturingOrderDialogProps) => {
  const [productName, setProductName] = useState('');
  const [productType, setProductType] = useState('');
  const [productConfigId, setProductConfigId] = useState('');
  const [quantityRequired, setQuantityRequired] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const { productConfigs, loading: configsLoading } = useProductConfigs();
  const { createOrder, isCreating } = useManufacturingOrders();

  const selectedConfig = productConfigs.find(config => config.id === productConfigId);
  const quantity = parseInt(quantityRequired) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName || !quantityRequired) {
      return;
    }

    createOrder({
      product_name: productName,
      product_type: productType,
      product_config_id: productConfigId || undefined,
      quantity_required: quantity,
      priority,
      due_date: dueDate || undefined,
      special_instructions: specialInstructions || undefined,
    });

    // Reset form
    setProductName('');
    setProductType('');
    setProductConfigId('');
    setQuantityRequired('');
    setPriority('medium');
    setDueDate('');
    setSpecialInstructions('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Create Manufacturing Order
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Product Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="productType">Product Type</Label>
                <Input
                  id="productType"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  placeholder="e.g., Necklace, Ring, Bracelet"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productConfig">Product Configuration (Optional)</Label>
              <Select value={productConfigId} onValueChange={setProductConfigId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select existing product configuration" />
                </SelectTrigger>
                <SelectContent>
                  {configsLoading ? (
                    <SelectItem value="" disabled>Loading configurations...</SelectItem>
                  ) : (
                    productConfigs.map((config) => (
                      <SelectItem key={config.id} value={config.id}>
                        {config.product_code} - {config.category} {config.subcategory}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Order Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity Required *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantityRequired}
                  onChange={(e) => setQuantityRequired(e.target.value)}
                  placeholder="0"
                  min="1"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Special Instructions</Label>
              <Textarea
                id="instructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special instructions for this manufacturing order..."
                rows={3}
              />
            </div>
          </div>

          {/* Raw Material Requirements (Auto-calculated from Product Config) */}
          {selectedConfig && selectedConfig.product_config_materials && selectedConfig.product_config_materials.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                <h3 className="font-semibold text-lg">Raw Material Requirements</h3>
                <Badge variant="outline" className="text-xs">
                  Auto-calculated from Product Config
                </Badge>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Material</TableHead>
                      <TableHead className="font-semibold text-center">Per Unit</TableHead>
                      <TableHead className="font-semibold text-center">Total Required</TableHead>
                      <TableHead className="font-semibold text-center">Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedConfig.product_config_materials.map((material, index) => {
                      const totalRequired = material.quantity_required * quantity;
                      
                      return (
                        <TableRow key={material.id || index}>
                          <TableCell className="font-medium">
                            {material.raw_materials?.name || `Material #${material.raw_material_id.slice(-6)}`}
                            <div className="text-xs text-gray-500">
                              {material.raw_materials?.type || 'Unknown Type'}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {material.quantity_required}
                          </TableCell>
                          <TableCell className="text-center font-semibold text-blue-600">
                            {totalRequired.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            {material.unit}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" className="flex-1" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Manufacturing Order'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateManufacturingOrderDialog;
