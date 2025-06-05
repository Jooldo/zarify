
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { RawMaterial } from '@/hooks/useRawMaterials';

interface RaiseRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  material: RawMaterial | null;
  onRequestCreated: () => void;
}

const RaiseRequestDialog = ({ isOpen, onOpenChange, material, onRequestCreated }: RaiseRequestDialogProps) => {
  const [requestQuantity, setRequestQuantity] = useState('');
  const [supplier, setSupplier] = useState('');
  const [eta, setEta] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!material) return;

    setLoading(true);
    try {
      // Get merchant ID
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      // Generate request number
      const requestNumber = `PR-${Date.now().toString().slice(-6)}`;

      const { error } = await supabase
        .from('procurement_requests')
        .insert({
          request_number: requestNumber,
          raw_material_id: material.id,
          quantity_requested: parseInt(requestQuantity),
          unit: material.unit,
          supplier_id: null,
          eta: eta || null,
          notes: supplier ? `Supplier: ${supplier}${notes ? '\n' + notes : ''}` : notes || null,
          merchant_id: merchantId,
          status: 'Pending'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Procurement request created successfully',
      });

      // Reset form
      setRequestQuantity('');
      setSupplier('');
      setEta('');
      setNotes('');
      onRequestCreated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating procurement request:', error);
      toast({
        title: 'Error',
        description: 'Failed to create procurement request',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!material) return null;

  const shortfall = Math.max(0, material.minimum_stock - material.current_stock);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Raise Procurement Request - {material.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Current Stock</Label>
              <Input value={`${material.current_stock} ${material.unit}`} disabled />
            </div>
            <div>
              <Label>Minimum Stock</Label>
              <Input value={`${material.minimum_stock} ${material.unit}`} disabled />
            </div>
          </div>
          <div>
            <Label htmlFor="requestQuantity">Request Quantity *</Label>
            <Input 
              id="requestQuantity" 
              type="number" 
              value={requestQuantity}
              onChange={(e) => setRequestQuantity(e.target.value)}
              placeholder={shortfall.toString()}
              min="1"
              required
            />
          </div>
          <div>
            <Label htmlFor="supplier">Supplier</Label>
            <Select value={supplier} onValueChange={setSupplier}>
              <SelectTrigger>
                <SelectValue placeholder="Select supplier (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mumbai Silver Co.">Mumbai Silver Co.</SelectItem>
                <SelectItem value="Rajasthan Crafts">Rajasthan Crafts</SelectItem>
                <SelectItem value="Delhi Accessories">Delhi Accessories</SelectItem>
                <SelectItem value="Local Supplier">Local Supplier</SelectItem>
                <SelectItem value="Artisan Supplies">Artisan Supplies</SelectItem>
                <SelectItem value="Textile Hub">Textile Hub</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="eta">Expected Delivery Date</Label>
            <Input 
              id="eta" 
              type="date" 
              value={eta}
              onChange={(e) => setEta(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Add any additional notes or requirements..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Creating...' : 'Submit Request'}
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

export default RaiseRequestDialog;
