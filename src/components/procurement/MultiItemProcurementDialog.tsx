
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivityLog } from '@/hooks/useActivityLog';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import type { RawMaterial } from '@/hooks/useRawMaterials';

interface Supplier {
  id: string;
  company_name: string;
  contact_person: string;
}

interface ProcurementItem {
  id: string;
  rawMaterialId: string;
  quantity: string;
  notes: string;
  supplierId: string;
  deliveryDate: string;
}

interface MultiItemProcurementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestCreated: () => void;
}

// Dummy supplier data with proper UUIDs - for display only
const DUMMY_SUPPLIERS: Supplier[] = [
  { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', company_name: 'Global Materials Inc', contact_person: 'John Smith' },
  { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480', company_name: 'Premium Supply Co', contact_person: 'Sarah Johnson' },
  { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481', company_name: 'EcoFriendly Resources', contact_person: 'Mike Chen' },
  { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d482', company_name: 'Industrial Solutions Ltd', contact_person: 'Emily Davis' },
  { id: 'f47ac10b-58cc-4372-a567-0e02b2c3d483', company_name: 'Quality Raw Materials', contact_person: 'Robert Wilson' },
];

const MultiItemProcurementDialog = ({ isOpen, onOpenChange, onRequestCreated }: MultiItemProcurementDialogProps) => {
  const [items, setItems] = useState<ProcurementItem[]>([
    { id: '1', rawMaterialId: '', quantity: '', notes: '', supplierId: '', deliveryDate: '' }
  ]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalDeliveryDate, setGlobalDeliveryDate] = useState('');
  const [useGlobalDeliveryDate, setUseGlobalDeliveryDate] = useState(true);
  
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const { profile } = useUserProfile();
  const { rawMaterials } = useRawMaterials();

  // Load suppliers when dialog opens
  useEffect(() => {
    if (isOpen) {
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
            setSuppliers([...(data || []), ...DUMMY_SUPPLIERS]);
          }
        } catch (error) {
          console.error('Error fetching suppliers:', error);
          setSuppliers(DUMMY_SUPPLIERS);
        }
      };

      fetchSuppliers();
    }
  }, [isOpen]);

  const addItem = () => {
    const newItem: ProcurementItem = {
      id: Date.now().toString(),
      rawMaterialId: '',
      quantity: '',
      notes: '',
      supplierId: '',
      deliveryDate: ''
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof ProcurementItem, value: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const getRawMaterialById = (id: string) => {
    return rawMaterials.find(material => material.id === id);
  };

  const getSupplierById = (id: string) => {
    return suppliers.find(supplier => supplier.id === id);
  };

  const isFormValid = () => {
    return items.every(item => 
      item.rawMaterialId && 
      item.quantity && 
      parseInt(item.quantity) > 0 && 
      item.supplierId
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setLoading(true);
    try {
      const { data: merchantId, error: merchantError } = await supabase.rpc('get_user_merchant_id');
      if (merchantError) throw merchantError;

      // Group items by supplier
      const itemsBySupplier = items.reduce((acc, item) => {
        if (!acc[item.supplierId]) {
          acc[item.supplierId] = [];
        }
        acc[item.supplierId].push(item);
        return acc;
      }, {} as Record<string, ProcurementItem[]>);

      const createdRequests = [];

      // Create a procurement request for each supplier
      for (const [supplierId, supplierItems] of Object.entries(itemsBySupplier)) {
        for (const item of supplierItems) {
          const timestamp = Date.now();
          const requestNumber = `REQ-${timestamp}-${Math.random().toString(36).substr(2, 4)}`;
          
          const rawMaterial = getRawMaterialById(item.rawMaterialId);
          const supplier = getSupplierById(supplierId);
          
          if (!rawMaterial) continue;

          // Determine if this is a real supplier or dummy
          const isDummySupplier = DUMMY_SUPPLIERS.some(dummy => dummy.id === supplierId);
          const validSupplierId = isDummySupplier ? null : supplierId;

          // Prepare supplier info for notes
          const supplierNotes = supplier ? `Supplier: ${supplier.company_name}` : '';
          const finalNotes = [
            'Source: Multi-Item Procurement Request',
            supplierNotes,
            item.notes
          ].filter(Boolean).join('\n');

          // Use global delivery date if enabled, otherwise use item-specific date
          const deliveryDate = useGlobalDeliveryDate ? globalDeliveryDate : item.deliveryDate;

          const { error } = await supabase
            .from('procurement_requests')
            .insert({
              request_number: requestNumber,
              raw_material_id: item.rawMaterialId,
              quantity_requested: parseInt(item.quantity),
              unit: rawMaterial.unit,
              supplier_id: validSupplierId,
              eta: deliveryDate || null,
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
              in_procurement: (rawMaterial.in_procurement || 0) + parseInt(item.quantity),
              request_status: 'Pending'
            })
            .eq('id', item.rawMaterialId);

          if (updateError) throw updateError;

          createdRequests.push({
            requestNumber,
            materialName: rawMaterial.name,
            quantity: item.quantity,
            unit: rawMaterial.unit,
            supplier: supplier?.company_name || 'Unknown'
          });
        }
      }

      // Log activity for the batch creation
      await logActivity(
        'Created',
        'Multi-Item Procurement Request',
        'BATCH',
        `Created ${createdRequests.length} procurement requests across ${Object.keys(itemsBySupplier).length} suppliers`
      );

      toast({
        title: 'Success',
        description: `Created ${createdRequests.length} procurement requests across ${Object.keys(itemsBySupplier).length} suppliers`,
      });

      onRequestCreated();
      onOpenChange(false);
      
      // Reset form
      setItems([{ id: '1', rawMaterialId: '', quantity: '', notes: '', supplierId: '', deliveryDate: '' }]);
      setGlobalDeliveryDate('');
      setUseGlobalDeliveryDate(true);
    } catch (error) {
      console.error('Error creating procurement requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to create procurement requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Multi-Item Procurement Request
            <Badge variant="default" className="text-xs">
              Enhanced
            </Badge>
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Create procurement requests for multiple materials. The system will automatically group items by supplier.
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Global Delivery Date Option */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useGlobalDeliveryDate"
                checked={useGlobalDeliveryDate}
                onChange={(e) => setUseGlobalDeliveryDate(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="useGlobalDeliveryDate">Use same delivery date for all items</Label>
            </div>
            
            {useGlobalDeliveryDate && (
              <div>
                <Label htmlFor="globalDeliveryDate">Expected Delivery Date (All Items)</Label>
                <Input
                  id="globalDeliveryDate"
                  type="date"
                  value={globalDeliveryDate}
                  onChange={(e) => setGlobalDeliveryDate(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Procurement Items</Label>
              <Button type="button" onClick={addItem} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={item.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Item #{index + 1}</span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Raw Material Selection */}
                  <div>
                    <Label>Raw Material *</Label>
                    <Select 
                      value={item.rawMaterialId} 
                      onValueChange={(value) => updateItem(item.id, 'rawMaterialId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {rawMaterials.map((material) => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.name} ({material.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <Label>Quantity *</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                        placeholder="Enter quantity"
                        min="1"
                        className="flex-1"
                      />
                      {item.rawMaterialId && (
                        <Input
                          value={getRawMaterialById(item.rawMaterialId)?.unit || ''}
                          disabled
                          className="w-20 bg-gray-50"
                        />
                      )}
                    </div>
                  </div>

                  {/* Supplier */}
                  <div>
                    <Label>Supplier *</Label>
                    <Select 
                      value={item.supplierId} 
                      onValueChange={(value) => updateItem(item.id, 'supplierId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
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

                  {/* Individual Delivery Date (if not using global) */}
                  {!useGlobalDeliveryDate && (
                    <div>
                      <Label>Expected Delivery Date</Label>
                      <Input
                        type="date"
                        value={item.deliveryDate}
                        onChange={(e) => updateItem(item.id, 'deliveryDate', e.target.value)}
                      />
                    </div>
                  )}

                  {/* Notes */}
                  <div className={`${useGlobalDeliveryDate ? 'md:col-span-2 lg:col-span-3' : 'md:col-span-2'}`}>
                    <Label>Notes</Label>
                    <Textarea
                      value={item.notes}
                      onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                      placeholder="Add notes for this item"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
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
              disabled={loading || !isFormValid()}
              className="flex-1"
            >
              {loading ? 'Creating Requests...' : 'Create Procurement Requests'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MultiItemProcurementDialog;
