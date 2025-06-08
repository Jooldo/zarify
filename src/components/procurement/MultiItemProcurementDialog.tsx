import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivityLog } from '@/hooks/useActivityLog';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { useSuppliers, type Supplier } from '@/hooks/useSuppliers';
import GlobalDeliveryDateSection from './GlobalDeliveryDateSection';
import ProcurementItemForm from './ProcurementItemForm';

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

const MultiItemProcurementDialog = ({ isOpen, onOpenChange, onRequestCreated }: MultiItemProcurementDialogProps) => {
  const [items, setItems] = useState<ProcurementItem[]>([
    { id: '1', rawMaterialId: '', quantity: '', notes: '', supplierId: '', deliveryDate: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [globalDeliveryDate, setGlobalDeliveryDate] = useState('');
  const [useGlobalDeliveryDate, setUseGlobalDeliveryDate] = useState(true);
  const [openComboboxes, setOpenComboboxes] = useState<Record<string, boolean>>({});
  
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const { profile } = useUserProfile();
  const { rawMaterials, loading: rawMaterialsLoading } = useRawMaterials();
  const { suppliers, loading: suppliersLoading, refetch: refetchSuppliers } = useSuppliers();

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
    console.log('MultiItemProcurementDialog: updateItem called');
    console.log('- id:', id);
    console.log('- field:', field);
    console.log('- value:', value);
    console.log('- current items:', items);
    
    setItems(prevItems => {
      const updatedItems = prevItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      );
      console.log('- updated items:', updatedItems);
      return updatedItems;
    });
  };

  const getRawMaterialById = (id: string) => {
    console.log('Looking for material with ID:', id, 'in materials:', rawMaterials);
    const material = rawMaterials.find(material => material.id === id);
    console.log('Found material:', material);
    return material;
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

  const toggleCombobox = (itemId: string, isOpen: boolean) => {
    setOpenComboboxes(prev => ({
      ...prev,
      [itemId]: isOpen
    }));
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
      const baseTimestamp = Date.now();

      // Create one procurement request per supplier
      let requestIndex = 0;
      for (const [supplierId, supplierItems] of Object.entries(itemsBySupplier)) {
        const supplier = getSupplierById(supplierId);
        const requestNumber = `REQ-${baseTimestamp}-${String(requestIndex + 1).padStart(3, '0')}`;

        // Prepare supplier info for notes
        const supplierNotes = supplier ? `Supplier: ${supplier.company_name}` : '';
        
        // Create detailed list of all materials for this supplier
        const materialsList = supplierItems.map((item, index) => {
          const rawMaterial = getRawMaterialById(item.rawMaterialId);
          return `${index + 1}. ${rawMaterial?.name || 'Unknown'} (${rawMaterial?.type || 'Unknown'}) - ${item.quantity} ${rawMaterial?.unit || 'units'}${item.notes ? ` - ${item.notes}` : ''}`;
        }).join('\n');
        
        const groupInfo = `Multi-Item Request: ${supplierItems.length} materials for ${supplier?.company_name || 'Unknown Supplier'}`;
        
        const finalNotes = [
          'Source: Multi-Item Procurement Request',
          groupInfo,
          supplierNotes,
          'Materials in this request:',
          materialsList
        ].filter(Boolean).join('\n');

        // Use global delivery date if enabled, otherwise use the first item's date
        const deliveryDate = useGlobalDeliveryDate ? globalDeliveryDate : supplierItems[0].deliveryDate;

        // For display purposes, we'll use the first material as the "primary" material
        const primaryItem = supplierItems[0];
        const primaryMaterial = getRawMaterialById(primaryItem.rawMaterialId);

        if (!primaryMaterial) continue;

        const { error } = await supabase
          .from('procurement_requests')
          .insert({
            request_number: requestNumber,
            raw_material_id: primaryItem.rawMaterialId,
            quantity_requested: parseInt(primaryItem.quantity),
            unit: primaryMaterial.unit,
            supplier_id: supplierId,
            eta: deliveryDate || null,
            notes: finalNotes || null,
            status: 'Pending',
            date_requested: new Date().toISOString().split('T')[0],
            merchant_id: merchantId,
            first_name: profile?.firstName || null,
            last_name: profile?.lastName || null
          });

        if (error) throw error;

        // Update raw materials procurement quantities for all items
        for (const item of supplierItems) {
          const rawMaterial = getRawMaterialById(item.rawMaterialId);
          if (rawMaterial) {
            const { error: updateError } = await supabase
              .from('raw_materials')
              .update({ 
                in_procurement: (rawMaterial.in_procurement || 0) + parseInt(item.quantity),
                request_status: 'Pending'
              })
              .eq('id', item.rawMaterialId);

            if (updateError) throw updateError;
          }
        }

        createdRequests.push({
          requestNumber,
          supplierName: supplier?.company_name || 'Unknown',
          materialCount: supplierItems.length,
          primaryMaterial: primaryMaterial.name
        });

        requestIndex++;
      }

      // Log activity for the batch creation
      await logActivity(
        'Created',
        'Multi-Item Procurement Request',
        'BATCH',
        `Created ${createdRequests.length} procurement requests grouped by ${Object.keys(itemsBySupplier).length} suppliers`
      );

      toast({
        title: 'Success',
        description: `Created ${createdRequests.length} procurement requests grouped by ${Object.keys(itemsBySupplier).length} suppliers`,
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
              Supplier Grouped
            </Badge>
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Create procurement requests for multiple materials. Items will be automatically grouped by supplier for efficient processing.
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Global Delivery Date Option */}
          <GlobalDeliveryDateSection
            useGlobalDeliveryDate={useGlobalDeliveryDate}
            setUseGlobalDeliveryDate={setUseGlobalDeliveryDate}
            globalDeliveryDate={globalDeliveryDate}
            setGlobalDeliveryDate={setGlobalDeliveryDate}
          />

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
              <ProcurementItemForm
                key={item.id}
                item={item}
                index={index}
                canRemove={items.length > 1}
                rawMaterials={rawMaterials}
                rawMaterialsLoading={rawMaterialsLoading}
                suppliers={suppliers}
                suppliersLoading={suppliersLoading}
                useGlobalDeliveryDate={useGlobalDeliveryDate}
                openComboboxes={openComboboxes}
                onUpdateItem={updateItem}
                onRemoveItem={removeItem}
                onToggleCombobox={toggleCombobox}
              />
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
