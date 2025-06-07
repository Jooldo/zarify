
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivityLog } from '@/hooks/useActivityLog';
import { useUserProfile } from '@/hooks/useUserProfile';
import type { RawMaterial } from '@/hooks/useRawMaterials';

interface Supplier {
  id: string;
  company_name: string;
  contact_person: string;
}

interface RaiseRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  material: RawMaterial | null;
  onRequestCreated: () => void;
  mode: 'inventory' | 'procurement';
}

// Dummy supplier data with proper UUIDs - for display only
const DUMMY_SUPPLIERS: Supplier[] = [
  { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', company_name: 'Global Materials Inc', contact_person: 'John Smith' },
  { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480', company_name: 'Premium Supply Co', contact_person: 'Sarah Johnson' },
  { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481', company_name: 'EcoFriendly Resources', contact_person: 'Mike Chen' },
  { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d482', company_name: 'Industrial Solutions Ltd', contact_person: 'Emily Davis' },
  { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d483', company_name: 'Quality Raw Materials', contact_person: 'Robert Wilson' },
];

const RaiseRequestDialog = ({ isOpen, onOpenChange, material, onRequestCreated, mode }: RaiseRequestDialogProps) => {
  const [quantity, setQuantity] = useState('');
  const [eta, setEta] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const { profile } = useUserProfile();

  // Don't render if material is null
  if (!material) {
    return null;
  }

  const isInventoryMode = mode === 'inventory';
  const isProcurementMode = mode === 'procurement';

  const getDialogTitle = () => {
    if (isInventoryMode) {
      return 'Quick Stock Alert Request';
    }
    return 'Raise Procurement Request';
  };

  const getDialogDescription = () => {
    if (isInventoryMode) {
      return 'Submit a quick request for stock replenishment. Procurement team will handle supplier selection and delivery scheduling.';
    }
    return 'Create a detailed procurement request with supplier and delivery information.';
  };

  // Load suppliers when dialog opens
  React.useEffect(() => {
    if (isOpen && isProcurementMode) {
      const fetchSuppliers = async () => {
        try {
          const { data: merchantId, error: merchantError } = await supabase.rpc('get_user_merchant_id');
          if (merchantError) throw merchantError;

          const { data, error } = await supabase
            .from('suppliers')
            .select('id, company_name, contact_person')
            .eq('merchant_id', merchantId);

          if (error) {
            console.log('Error fetching suppliers, using dummy data:', error);
            setSuppliers(DUMMY_SUPPLIERS);
          } else {
            // Combine real suppliers with dummy data for display
            setSuppliers([...(data || []), ...DUMMY_SUPPLIERS]);
          }
        } catch (error) {
          console.error('Error fetching suppliers:', error);
          setSuppliers(DUMMY_SUPPLIERS);
        }
      };

      fetchSuppliers();
    }
  }, [isOpen, isProcurementMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || !material) return;

    setLoading(true);
    try {
      const { data: merchantId, error: merchantError } = await supabase.rpc('get_user_merchant_id');
      if (merchantError) throw merchantError;

      // Generate request number
      const timestamp = Date.now();
      const requestNumber = `REQ-${timestamp}`;

      // Get the selected supplier info (only for procurement mode)
      let supplierNotes = '';
      let validSupplierId = null;

      if (isProcurementMode && selectedSupplierId) {
        const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
        if (selectedSupplier) {
          // Check if this is a dummy supplier by checking if it's in our dummy list
          const isDummySupplier = DUMMY_SUPPLIERS.some(dummy => dummy.id === selectedSupplierId);
          
          if (!isDummySupplier) {
            // Only set supplier_id for real suppliers from database
            validSupplierId = selectedSupplierId;
          }
          
          // Always add supplier info to notes for tracking
          supplierNotes = `Supplier: ${selectedSupplier.company_name}`;
        }
      }

      // Add mode indicator to notes
      const modeNote = isInventoryMode ? 'Source: Inventory Alert' : 'Source: Procurement Request';
      const finalNotes = [modeNote, supplierNotes, notes].filter(Boolean).join('\n');

      const { error } = await supabase
        .from('procurement_requests')
        .insert({
          request_number: requestNumber,
          raw_material_id: material.id,
          quantity_requested: parseInt(quantity),
          unit: material.unit,
          supplier_id: validSupplierId, // Only set if it's a real supplier
          eta: isProcurementMode ? (eta || null) : null,
          notes: finalNotes || null,
          status: 'Pending',
          date_requested: new Date().toISOString().split('T')[0],
          merchant_id: merchantId,
          first_name: profile?.firstName || null,
          last_name: profile?.lastName || null
        });

      if (error) throw error;

      // Update raw material in_procurement
      const { error: updateError } = await supabase
        .from('raw_materials')
        .update({ 
          in_procurement: (material.in_procurement || 0) + parseInt(quantity),
          request_status: 'Pending'
        })
        .eq('id', material.id);

      if (updateError) throw updateError;

      const activityDescription = isInventoryMode 
        ? `Stock alert created for ${material.name} - ${quantity} ${material.unit}`
        : `Procurement request created for ${material.name} - ${quantity} ${material.unit}`;

      await logActivity(
        'Created',
        isInventoryMode ? 'Stock Alert' : 'Procurement Request',
        requestNumber,
        activityDescription
      );

      toast({
        title: 'Success',
        description: isInventoryMode 
          ? 'Stock alert submitted successfully. Procurement team will handle the details.'
          : 'Procurement request created successfully',
      });

      onRequestCreated();
      onOpenChange(false);
      setQuantity('');
      setEta('');
      setNotes('');
      setSelectedSupplierId('');
    } catch (error) {
      console.error('Error creating procurement request:', error);
      toast({
        title: 'Error',
        description: `Failed to create ${isInventoryMode ? 'stock alert' : 'procurement request'}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getDialogTitle()}
            <Badge variant={isInventoryMode ? "secondary" : "default"} className="text-xs">
              {isInventoryMode ? "Quick" : "Detailed"}
            </Badge>
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {getDialogDescription()}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Material</Label>
            <Input 
              value={`${material.name} (${material.type})`} 
              disabled 
              className="bg-gray-50"
            />
          </div>
          
          <div>
            <Label htmlFor="quantity">Quantity Required *</Label>
            <div className="flex gap-2">
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                required
                min="1"
                className="flex-1"
              />
              <Input
                value={material.unit}
                disabled
                className="w-20 bg-gray-50"
              />
            </div>
          </div>

          {isProcurementMode && (
            <>
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.company_name}
                      </SelectItem>
                    ))}
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
            </>
          )}

          <div>
            <Label htmlFor="notes">
              {isInventoryMode ? 'Additional Notes' : 'Notes'}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about the request"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !quantity}
              className="flex-1"
            >
              {loading 
                ? (isInventoryMode ? 'Submitting...' : 'Creating...') 
                : (isInventoryMode ? 'Submit Alert' : 'Create Request')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RaiseRequestDialog;
