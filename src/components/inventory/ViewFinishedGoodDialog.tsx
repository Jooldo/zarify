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

  const calculateShortfall = (currentStock: number, inManufacturing: number, requiredQuantity: number, threshold: number) => {
    const totalAvailable = currentStock + inManufacturing;
    const totalNeeded = requiredQuantity + threshold;
    return totalNeeded - totalAvailable;
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

  const shortfall = calculateShortfall(
    product.current_stock,
    product.in_manufacturing,
    product.required_quantity,
    product.threshold
  );

  // Use shortfall quantity for raw material calculations - only if shortfall is positive (actual shortage)
  const quantityForMaterialCalculation = Math.max(0, shortfall);

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
              <div className="text-sm font-bold text-blue-600">{product.current_stock} units</div>
            </div>
            <div>
              <Label className="text-sm font-medium">In Manufacturing:</Label>
              <div className="text-sm">{product.in_manufacturing} units</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Required Quantity Based On Live Orders:</Label>
              <div className="text-sm">{product.required_quantity} units</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Shortfall Quantity:</Label>
              <div className="flex items-center gap-2 mt-1">
                <div className={`px-4 py-2 rounded-lg border-2 ${
                  shortfall > 0 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${
                      shortfall > 0 ? 'text-red-700' : 'text-green-700'
                    }`}>
                      {formatIndianNumber(Math.abs(shortfall))} units
                    </span>
                    {shortfall > 0 ? (
                      <ArrowDown className="h-5 w-5 text-red-600" />
                    ) : (
                      <ArrowUp className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div className={`text-xs mt-1 ${
                    shortfall > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {shortfall > 0 ? 'Production Required' : 'Stock Sufficient'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prominent Shortfall Summary Card */}
          {shortfall > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500 text-white rounded-full p-2">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-800">Production Required</h3>
                    <p className="text-sm text-red-700">
                      Current supply cannot meet demand + safety stock requirements
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-700">
                    {formatIndianNumber(shortfall)} units
                  </div>
                  <div className="text-xs text-red-600">shortage</div>
                </div>
              </div>
            </div>
          )}

          {shortfall <= 0 && (
            <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 text-white rounded-full p-2">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-green-800">Stock Sufficient</h3>
                    <p className="text-sm text-green-700">
                      Current supply meets demand + safety stock requirements
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-700">
                    +{formatIndianNumber(Math.abs(shortfall))} units
                  </div>
                  <div className="text-xs text-green-600">surplus</div>
                </div>
              </div>
            </div>
          )}

          {/* Raw Materials Requirements */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">
              Raw Materials Required 
              {quantityForMaterialCalculation > 0 
                ? ` (Based on Shortfall: ${quantityForMaterialCalculation} units):`
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
                      // Calculate total required based on shortfall quantity
                      const totalRequired = material.quantity_required * quantityForMaterialCalculation;
                      const status = getStockStatus(
                        material.raw_material.current_stock,
                        totalRequired
                      );
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
                            {totalRequired} {material.raw_material.unit}
                          </TableCell>
                          <TableCell className="text-xs py-1 px-2 font-medium">
                            {material.raw_material.current_stock} {material.raw_material.unit}
                          </TableCell>
                          <TableCell className="text-xs py-1 px-2">
                            {material.raw_material.minimum_stock} {material.raw_material.unit}
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
              <div className="text-center py-4 text-green-600 font-medium">
                ✅ No production required - current stock and manufacturing capacity is sufficient to meet demand.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewFinishedGoodDialog;
