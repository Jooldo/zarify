
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
          eta: null,
          notes: notes || null,
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Raise Procurement Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{material.name}</span>
              <Badge variant="outline" className="text-xs">{material.type}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Current:</span>
                <span className="ml-1 font-medium">{material.current_stock} {material.unit}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Minimum:</span>
                <span className="ml-1 font-medium">{material.minimum_stock} {material.unit}</span>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="requestQuantity" className="text-sm">Request Quantity ({material.unit}) *</Label>
            <Input 
              id="requestQuantity" 
              type="number" 
              value={requestQuantity}
              onChange={(e) => setRequestQuantity(e.target.value)}
              placeholder={shortfall.toString()}
              min="1"
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="notes" className="text-sm">Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Add any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 min-h-[60px]"
            />
          </div>
          
          <div className="flex gap-2 pt-2">
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
