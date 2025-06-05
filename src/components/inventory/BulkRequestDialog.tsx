
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSuppliers } from '@/hooks/useSuppliers';
import type { RawMaterial } from '@/hooks/useRawMaterials';

interface BulkRequestItem {
  material: RawMaterial;
  quantity: number;
  supplierId: string;
  eta: string;
  notes: string;
}

interface BulkRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  materials: RawMaterial[];
  onRequestsCreated: () => void;
}

const BulkRequestDialog = ({ isOpen, onOpenChange, materials, onRequestsCreated }: BulkRequestDialogProps) => {
  const { suppliers, loading: suppliersLoading } = useSuppliers();
  const [loading, setLoading] = useState(false);
  const [bulkEta, setBulkEta] = useState('');
  const [bulkSupplierId, setBulkSupplierId] = useState('');
  const { toast } = useToast();

  const [requestItems, setRequestItems] = useState<BulkRequestItem[]>(() =>
    materials.map(material => ({
      material,
      quantity: Math.max(0, material.minimum_stock - material.current_stock),
      supplierId: '',
      eta: '',
      notes: ''
    }))
  );

  const updateRequestItem = (index: number, field: keyof BulkRequestItem, value: string | number) => {
    setRequestItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const applyBulkSupplier = () => {
    if (!bulkSupplierId) return;
    setRequestItems(prev => prev.map(item => ({ ...item, supplierId: bulkSupplierId })));
  };

  const applyBulkEta = () => {
    if (!bulkEta) return;
    setRequestItems(prev => prev.map(item => ({ ...item, eta: bulkEta })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: merchantId, error: merchantError } = await supabase
        .rpc('get_user_merchant_id');

      if (merchantError) throw merchantError;

      const requests = requestItems
        .filter(item => item.quantity > 0)
        .map(item => ({
          request_number: `PR-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3)}`,
          raw_material_id: item.material.id,
          quantity_requested: item.quantity,
          unit: item.material.unit,
          supplier_id: item.supplierId || null,
          eta: item.eta || null,
          notes: item.notes || null,
          merchant_id: merchantId,
          status: 'Pending' as const
        }));

      if (requests.length === 0) {
        toast({
          title: 'Error',
          description: 'No valid requests to submit',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('procurement_requests')
        .insert(requests);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${requests.length} procurement requests created successfully`,
      });

      onRequestsCreated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating bulk procurement requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to create procurement requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.company_name : 'Select supplier';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Procurement Request - {materials.length} Materials</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bulk Actions */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium mb-3">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor="bulkSupplier">Apply Same Supplier to All</Label>
                  <Select value={bulkSupplierId} onValueChange={setBulkSupplierId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.company_name}
                          {supplier.contact_person && ` (${supplier.contact_person})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" onClick={applyBulkSupplier} variant="outline" size="sm">
                  Apply
                </Button>
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor="bulkEta">Apply Same ETA to All</Label>
                  <Input 
                    id="bulkEta"
                    type="date" 
                    value={bulkEta}
                    onChange={(e) => setBulkEta(e.target.value)}
                  />
                </div>
                <Button type="button" onClick={applyBulkEta} variant="outline" size="sm">
                  Apply
                </Button>
              </div>
            </div>
          </div>

          {/* Request Items Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Material</TableHead>
                  <TableHead className="w-24">Current</TableHead>
                  <TableHead className="w-24">Shortfall</TableHead>
                  <TableHead className="w-32">Request Qty</TableHead>
                  <TableHead className="w-48">Supplier</TableHead>
                  <TableHead className="w-32">ETA</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requestItems.map((item, index) => (
                  <TableRow key={item.material.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.material.name}</div>
                        <div className="text-xs text-gray-500">{item.material.type}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.material.current_stock} {item.material.unit}
                    </TableCell>
                    <TableCell className="text-sm text-red-600">
                      {Math.max(0, item.material.minimum_stock - item.material.current_stock)} {item.material.unit}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => updateRequestItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={item.supplierId} 
                        onValueChange={(value) => updateRequestItem(index, 'supplierId', value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.company_name}
                              {supplier.contact_person && ` (${supplier.contact_person})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={item.eta}
                        onChange={(e) => updateRequestItem(index, 'eta', e.target.value)}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Optional notes..."
                        value={item.notes}
                        onChange={(e) => updateRequestItem(index, 'notes', e.target.value)}
                        className="h-8"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={loading || suppliersLoading}>
              {loading ? 'Creating Requests...' : `Submit ${requestItems.filter(item => item.quantity > 0).length} Requests`}
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

export default BulkRequestDialog;
