
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowUp, ArrowDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface RawMaterialRequirement {
  id: string;
  quantity_required: number;
  unit: string;
  raw_material: {
    id: string;
    name: string;
    type: string;
    current_stock: number;
    minimum_stock: number;
    unit: string;
  };
}

interface ViewFinishedGoodDialogProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

const ViewFinishedGoodDialog = ({ product, isOpen, onClose }: ViewFinishedGoodDialogProps) => {
  const [rawMaterials, setRawMaterials] = useState<RawMaterialRequirement[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (product && isOpen) {
      fetchRawMaterials();
    }
  }, [product, isOpen]);

  const fetchRawMaterials = async () => {
    if (!product?.product_config_id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_config_materials')
        .select(`
          id,
          quantity_required,
          unit,
          raw_material:raw_materials(
            id,
            name,
            type,
            current_stock,
            minimum_stock,
            unit
          )
        `)
        .eq('product_config_id', product.product_config_id);

      if (error) throw error;
      setRawMaterials(data || []);
    } catch (error) {
      console.error('Error fetching raw materials:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch raw material requirements',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatIndianNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  const getStockStatus = (available: number, totalRequired: number) => {
    if (available >= totalRequired) return { label: 'Available', variant: 'default' as const };
    if (available > 0) return { label: 'Insufficient', variant: 'secondary' as const };
    return { label: 'Out of Stock', variant: 'destructive' as const };
  };

  const getDisplaySize = (product: any) => {
    // Display size_value directly as inches (no conversion needed)
    const sizeInInches = product.product_config?.size_value?.toFixed(2) || 'N/A';
    const weightRange = product.product_config?.weight_range || 'N/A';
    return `${sizeInInches}" / ${weightRange}`;
  };

  if (!product) return null;

  // Calculate shortfall correctly - include in_manufacturing in available quantity
  const currentStock = product.current_stock || 0;
  const inManufacturing = product.in_manufacturing || 0;
  const requiredQuantity = product.required_quantity || 0;
  const threshold = product.threshold || 0;
  
  const totalAvailable = currentStock + inManufacturing;
  const totalNeeded = requiredQuantity + threshold;
  const shortfall = Math.max(0, totalNeeded - totalAvailable);

  console.log('🔍 CORRECTED shortfall calculation for:', product.product_code);
  console.log(`   Current stock: ${currentStock}`);
  console.log(`   In manufacturing: ${inManufacturing}`);
  console.log(`   Total available: ${totalAvailable}`);
  console.log(`   Required quantity: ${requiredQuantity}`);
  console.log(`   Threshold: ${threshold}`);
  console.log(`   Total needed: ${totalNeeded}`);
  console.log(`   FINAL shortfall: ${shortfall}`);

  // Use the CORRECT shortfall for raw material calculations
  const quantityForMaterialCalculation = shortfall;

  console.log(`🔍 Raw material calculation will use quantity: ${quantityForMaterialCalculation}`);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Product Details - {product.product_code}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Product Information */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium">Category:</Label>
              <div className="text-sm">{product.product_config?.category || 'N/A'}</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Subcategory:</Label>
              <div className="text-sm">{product.product_config?.subcategory || 'N/A'}</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Size & Weight:</Label>
              <div className="text-sm">{getDisplaySize(product)}</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Current Stock:</Label>
              <div className="text-sm font-bold text-blue-600">{currentStock} units</div>
            </div>
            <div>
              <Label className="text-sm font-medium">In Manufacturing:</Label>
              <div className="text-sm font-bold text-orange-600">{inManufacturing} units</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Required Quantity Based On Live Orders:</Label>
              <div className="text-sm">{requiredQuantity} units</div>
            </div>
          </div>

          {/* Prominent Shortfall Summary Card */}
          {shortfall > 0 ? (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-red-500 text-white rounded-full p-3">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-800">Production Required</h3>
                    <p className="text-sm text-red-700 mt-1">
                      Current supply cannot meet demand + safety stock requirements
                    </p>
                    <p className="text-xs text-red-600 mt-2">
                      Available: {formatIndianNumber(totalAvailable)} | Needed: {formatIndianNumber(totalNeeded)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-red-700">
                    {formatIndianNumber(shortfall)} units
                  </div>
                  <div className="text-sm text-red-600 font-medium">shortage</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-green-500 text-white rounded-full p-3">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800">Stock Sufficient</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Current supply meets demand + safety stock requirements
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      Available: {formatIndianNumber(totalAvailable)} | Needed: {formatIndianNumber(totalNeeded)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-700">
                    +{formatIndianNumber(Math.abs(shortfall))} units
                  </div>
                  <div className="text-sm text-green-600 font-medium">surplus</div>
                </div>
              </div>
            </div>
          )}

          {/* Raw Materials Requirements */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">
              Raw Materials Required 
              {quantityForMaterialCalculation > 0 
                ? ` (Based on Shortfall: ${formatIndianNumber(quantityForMaterialCalculation)} units):`
                : ' (No Production Required - Stock Sufficient):'
              }
            </h4>
            {loading ? (
              <div className="text-center py-4">Loading raw materials...</div>
            ) : rawMaterials.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="h-8">
                      <TableHead className="text-xs py-1 px-2">Material Name</TableHead>
                      <TableHead className="text-xs py-1 px-2">Type</TableHead>
                      <TableHead className="text-xs py-1 px-2">Required per Unit</TableHead>
                      <TableHead className="text-xs py-1 px-2">Total Required</TableHead>
                      <TableHead className="text-xs py-1 px-2">Available Stock</TableHead>
                      <TableHead className="text-xs py-1 px-2">Minimum Stock</TableHead>
                      <TableHead className="text-xs py-1 px-2">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rawMaterials.map((material) => {
                      // CRITICAL FIX: Use the corrected shortfall quantity directly
                      const totalRequired = material.quantity_required * quantityForMaterialCalculation;
                      const status = getStockStatus(
                        material.raw_material.current_stock,
                        totalRequired
                      );
                      
                      console.log(`🔍 Raw material ${material.raw_material.name}:`);
                      console.log(`   Required per unit: ${material.quantity_required}`);
                      console.log(`   Shortfall quantity used: ${quantityForMaterialCalculation}`);
                      console.log(`   Total required calculated: ${totalRequired}`);
                      
                      return (
                        <TableRow key={material.id} className="h-8">
                          <TableCell className="text-xs py-1 px-2 font-medium">
                            {material.raw_material.name}
                          </TableCell>
                          <TableCell className="text-xs py-1 px-2">
                            {material.raw_material.type}
                          </TableCell>
                          <TableCell className="text-xs py-1 px-2">
                            {material.quantity_required} {material.unit}
                          </TableCell>
                          <TableCell className="text-xs py-1 px-2 font-bold text-purple-600">
                            {formatIndianNumber(totalRequired)} {material.raw_material.unit}
                          </TableCell>
                          <TableCell className="text-xs py-1 px-2 font-medium">
                            {formatIndianNumber(material.raw_material.current_stock)} {material.raw_material.unit}
                          </TableCell>
                          <TableCell className="text-xs py-1 px-2">
                            {formatIndianNumber(material.raw_material.minimum_stock)} {material.raw_material.unit}
                          </TableCell>
                          <TableCell className="text-xs py-1 px-2">
                            <Badge variant={status.variant} className="text-xs px-1 py-0">
                              {status.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No raw material requirements found for this product.
              </div>
            )}
            
            {quantityForMaterialCalculation === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-green-700 font-medium text-sm">
                  ✅ No production required - current stock and manufacturing capacity is sufficient to meet demand.
                </div>
                <div className="text-green-600 text-xs mt-1">
                  All raw material requirements are 0 because there is no shortfall.
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewFinishedGoodDialog;
