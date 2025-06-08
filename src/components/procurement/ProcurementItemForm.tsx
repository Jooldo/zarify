
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import RawMaterialSelector from './RawMaterialSelector';
import type { RawMaterial } from '@/hooks/useRawMaterials';
import type { Supplier } from '@/hooks/useSuppliers';

interface ProcurementItem {
  id: string;
  rawMaterialId: string;
  quantity: string;
  notes: string;
  supplierId: string;
  deliveryDate: string;
}

interface ProcurementItemFormProps {
  item: ProcurementItem;
  index: number;
  canRemove: boolean;
  rawMaterials: RawMaterial[];
  rawMaterialsLoading: boolean;
  suppliers: Supplier[];
  suppliersLoading: boolean;
  useGlobalDeliveryDate: boolean;
  openComboboxes: Record<string, boolean>;
  onUpdateItem: (id: string, field: keyof ProcurementItem, value: string) => void;
  onRemoveItem: (id: string) => void;
  onToggleCombobox: (itemId: string, isOpen: boolean) => void;
}

const ProcurementItemForm = ({
  item,
  index,
  canRemove,
  rawMaterials,
  rawMaterialsLoading,
  suppliers,
  suppliersLoading,
  useGlobalDeliveryDate,
  openComboboxes,
  onUpdateItem,
  onRemoveItem,
  onToggleCombobox
}: ProcurementItemFormProps) => {
  const selectedMaterial = rawMaterials.find(material => material.id === item.rawMaterialId);
  console.log(`Item ${index + 1}: rawMaterialId=${item.rawMaterialId}, selectedMaterial=`, selectedMaterial);

  const getFilteredSuppliersForMaterial = (materialId: string) => {
    if (!materialId) return [];
    
    return suppliers.filter(supplier => {
      if (!supplier.materials_supplied || supplier.materials_supplied.length === 0) {
        return false;
      }
      return supplier.materials_supplied.includes(materialId);
    });
  };

  const filteredSuppliers = getFilteredSuppliersForMaterial(item.rawMaterialId);

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Item #{index + 1}</span>
        {canRemove && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRemoveItem(item.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Raw Material Selection */}
        <RawMaterialSelector
          rawMaterials={rawMaterials}
          rawMaterialsLoading={rawMaterialsLoading}
          selectedMaterialId={item.rawMaterialId}
          onMaterialSelect={(materialId) => {
            onUpdateItem(item.id, 'rawMaterialId', materialId);
            onUpdateItem(item.id, 'supplierId', ''); // Reset supplier when material changes
          }}
          isOpen={openComboboxes[item.id] || false}
          onOpenChange={(open) => onToggleCombobox(item.id, open)}
        />

        {/* Quantity */}
        <div>
          <Label>Quantity *</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) => onUpdateItem(item.id, 'quantity', e.target.value)}
              placeholder="Enter quantity"
              min="1"
              className="flex-1"
            />
            {selectedMaterial && (
              <Input
                value={selectedMaterial.unit}
                disabled
                className="w-20 bg-gray-50"
              />
            )}
          </div>
        </div>

        {/* Supplier */}
        <div>
          <Label>Supplier *</Label>
          {suppliersLoading ? (
            <div className="text-sm text-gray-500">Loading suppliers...</div>
          ) : (
            <Select 
              value={item.supplierId} 
              onValueChange={(value) => onUpdateItem(item.id, 'supplierId', value)}
              disabled={!item.rawMaterialId}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !item.rawMaterialId
                    ? "Select material first"
                    : filteredSuppliers.length === 0
                    ? "No suppliers for this material"
                    : "Select supplier"
                } />
              </SelectTrigger>
              <SelectContent>
                {filteredSuppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {item.rawMaterialId && filteredSuppliers.length === 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              No suppliers configured for this material
            </p>
          )}
        </div>

        {/* Individual Delivery Date (if not using global) */}
        {!useGlobalDeliveryDate && (
          <div>
            <Label>Expected Delivery Date</Label>
            <Input
              type="date"
              value={item.deliveryDate}
              onChange={(e) => onUpdateItem(item.id, 'deliveryDate', e.target.value)}
            />
          </div>
        )}

        {/* Notes */}
        <div className={`${useGlobalDeliveryDate ? 'md:col-span-2 lg:col-span-3' : 'md:col-span-2'}`}>
          <Label>Notes</Label>
          <Textarea
            value={item.notes}
            onChange={(e) => onUpdateItem(item.id, 'notes', e.target.value)}
            placeholder="Add notes for this item"
            rows={2}
          />
        </div>
      </div>
    </div>
  );
};

export default ProcurementItemForm;
