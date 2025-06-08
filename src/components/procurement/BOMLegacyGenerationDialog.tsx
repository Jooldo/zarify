
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ProcurementRequest } from '@/hooks/useProcurementRequests';

interface BOMItem {
  material_name: string;
  material_type: string;
  quantity: number;
  unit: string;
  unit_cost: string;
  total_cost: string;
  supplier: string;
  notes: string;
}

interface BOMLegacyGenerationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  request: ProcurementRequest | null;
}

const BOMLegacyGenerationDialog = ({ isOpen, onOpenChange, request }: BOMLegacyGenerationDialogProps) => {
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [bomTitle, setBomTitle] = useState('');
  const [bomDescription, setBomDescription] = useState('');
  const [bomDate, setBomDate] = useState('');
  const { toast } = useToast();

  const parseMultiItemMaterials = (notes?: string) => {
    if (!notes || !notes.includes('Materials in this request:')) return null;
    
    const materialsSection = notes.split('Materials in this request:')[1];
    if (!materialsSection) return null;

    const materialLines = materialsSection.trim().split('\n').filter(line => line.trim());
    
    return materialLines.map(line => {
      const match = line.match(/^\d+\.\s*(.+?)\s*\((.+?)\)\s*-\s*(\d+)\s*(\w+)(?:\s*-\s*(.+))?$/);
      if (match) {
        return {
          name: match[1].trim(),
          type: match[2].trim(),
          quantity: parseInt(match[3]),
          unit: match[4].trim(),
          notes: match[5]?.trim() || ''
        };
      }
      return null;
    }).filter(Boolean);
  };

  const getRequestOrigin = (notes?: string) => {
    if (!notes) return 'procurement';
    if (notes.includes('Source: Inventory Alert')) return 'inventory';
    if (notes.includes('Source: Multi-Item Procurement Request')) return 'multi-item';
    return 'procurement';
  };

  const extractSupplierFromNotes = (notes?: string) => {
    if (!notes) return '';
    const supplierMatch = notes.match(/Supplier:\s*([^\n]+)/);
    return supplierMatch ? supplierMatch[1].trim() : '';
  };

  useEffect(() => {
    if (request && isOpen) {
      setBomTitle(`BOM for ${request.request_number}`);
      setBomDescription(`Bill of Materials for procurement request ${request.request_number}`);
      setBomDate(new Date().toISOString().split('T')[0]);

      const origin = getRequestOrigin(request.notes);
      const supplier = extractSupplierFromNotes(request.notes);

      if (origin === 'multi-item') {
        const materials = parseMultiItemMaterials(request.notes);
        if (materials) {
          const items: BOMItem[] = materials.map(material => ({
            material_name: material.name,
            material_type: material.type,
            quantity: material.quantity,
            unit: material.unit,
            unit_cost: '0.00',
            total_cost: '0.00',
            supplier: supplier,
            notes: material.notes
          }));
          setBomItems(items);
        }
      } else {
        const items: BOMItem[] = [{
          material_name: request.raw_material?.name || '',
          material_type: request.raw_material?.type || '',
          quantity: request.quantity_requested,
          unit: request.unit,
          unit_cost: '0.00',
          total_cost: '0.00',
          supplier: supplier,
          notes: request.notes || ''
        }];
        setBomItems(items);
      }
    }
  }, [request, isOpen]);

  const updateBOMItem = (index: number, field: keyof BOMItem, value: string) => {
    setBomItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Auto-calculate total cost when unit cost or quantity changes
      if (field === 'unit_cost') {
        const unitCost = parseFloat(value) || 0;
        const quantity = updated[index].quantity || 0;
        updated[index].total_cost = (unitCost * quantity).toFixed(2);
      }
      
      return updated;
    });
  };

  const calculateGrandTotal = () => {
    return bomItems.reduce((total, item) => total + (parseFloat(item.total_cost) || 0), 0).toFixed(2);
  };

  const handleGenerateBOM = () => {
    // In a real implementation, this would generate a PDF or export the BOM
    toast({
      title: 'BOM Generated',
      description: `Bill of Materials for ${request?.request_number} has been generated successfully.`,
    });
    
    console.log('Generated BOM:', {
      title: bomTitle,
      description: bomDescription,
      date: bomDate,
      items: bomItems,
      grandTotal: calculateGrandTotal()
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Bill of Materials (BOM)
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* BOM Header Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bom-title">BOM Title</Label>
              <Input
                id="bom-title"
                value={bomTitle}
                onChange={(e) => setBomTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bom-date">Date</Label>
              <Input
                id="bom-date"
                type="date"
                value={bomDate}
                onChange={(e) => setBomDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="bom-description">Description</Label>
            <Textarea
              id="bom-description"
              value={bomDescription}
              onChange={(e) => setBomDescription(e.target.value)}
              className="mt-1"
              rows={2}
            />
          </div>

          <Separator />

          {/* BOM Items */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Materials</h3>
            <div className="space-y-4">
              {bomItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      Item {index + 1}
                    </Badge>
                    <span className="font-medium">{item.material_name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {item.material_type}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-3">
                    <div>
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateBOMItem(index, 'quantity', e.target.value)}
                        className="text-xs"
                        disabled
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Unit</Label>
                      <Input
                        value={item.unit}
                        className="text-xs"
                        disabled
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Unit Cost</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_cost}
                        onChange={(e) => updateBOMItem(index, 'unit_cost', e.target.value)}
                        className="text-xs"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Total Cost</Label>
                      <Input
                        value={item.total_cost}
                        className="text-xs bg-gray-50"
                        disabled
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Supplier</Label>
                      <Input
                        value={item.supplier}
                        onChange={(e) => updateBOMItem(index, 'supplier', e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Notes</Label>
                      <Input
                        value={item.notes}
                        onChange={(e) => updateBOMItem(index, 'notes', e.target.value)}
                        className="text-xs"
                        placeholder="Additional notes"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* BOM Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Grand Total:</span>
              <span className="text-lg font-bold">${calculateGrandTotal()}</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Total items: {bomItems.length}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateBOM} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Generate BOM
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BOMLegacyGenerationDialog;
