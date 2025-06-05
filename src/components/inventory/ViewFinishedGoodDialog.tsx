
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  const getStockStatus = (available: number, required: number) => {
    if (available >= required) return { label: 'Available', variant: 'default' as const };
    if (available > 0) return { label: 'Insufficient', variant: 'secondary' as const };
    return { label: 'Out of Stock', variant: 'destructive' as const };
  };

  const getDisplaySize = (product: any) => {
    const sizeInInches = product.product_config?.size_value 
      ? (product.product_config.size_value * 39.3701).toFixed(2) 
      : 'N/A';
    const weightRange = product.product_config?.weight_range || 'N/A';
    return `${sizeInInches}" / ${weightRange}`;
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
              <Label className="text-sm font-medium">Required Quantity:</Label>
              <div className="text-sm">{product.required_quantity} units</div>
            </div>
          </div>

          {/* Raw Materials Requirements */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Raw Materials Required:</h4>
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
                      <TableHead className="text-xs py-1 px-2">Available Stock</TableHead>
                      <TableHead className="text-xs py-1 px-2">Minimum Stock</TableHead>
                      <TableHead className="text-xs py-1 px-2">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rawMaterials.map((material) => {
                      const status = getStockStatus(
                        material.raw_material.current_stock,
                        material.quantity_required
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewFinishedGoodDialog;
