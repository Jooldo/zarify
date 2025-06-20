
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RawMaterial } from '@/hooks/useRawMaterials';
import { Package, User, Calendar, DollarSign, Truck, Factory, Eye } from 'lucide-react';
import MaterialReservationsDialog from './MaterialReservationsDialog';

interface ViewRawMaterialDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  material: RawMaterial | null;
}

const ViewRawMaterialDialog = ({ isOpen, onOpenChange, material }: ViewRawMaterialDialogProps) => {
  const [isReservationsOpen, setIsReservationsOpen] = useState(false);

  if (!material) return null;

  const getStatusColor = () => {
    if (material.shortfall > 0) return 'text-red-600';
    if (material.current_stock <= material.minimum_stock) return 'text-orange-600';
    return 'text-green-600';
  };

  const getStatusBadge = () => {
    if (material.shortfall > 0) {
      return <Badge variant="destructive">Critical</Badge>;
    } else if (material.current_stock <= material.minimum_stock) {
      return <Badge variant="secondary">Low Stock</Badge>;
    }
    return <Badge variant="default">Good</Badge>;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {material.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Type</label>
                <div className="mt-1">
                  <Badge variant="outline">{material.type}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Unit</label>
                <div className="mt-1 text-sm">{material.unit}</div>
              </div>
            </div>

            <Separator />

            {/* Stock Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Stock Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Current Stock</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {material.current_stock} {material.unit}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">In Procurement</span>
                    </div>
                    <span className="text-lg font-bold text-orange-600">
                      {material.in_procurement} {material.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Factory className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">In Manufacturing</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">
                      {material.in_manufacturing} {material.unit}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Minimum Stock</span>
                    <span className="text-lg font-bold">
                      {material.minimum_stock} {material.unit}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Required</span>
                    <span className="text-lg font-bold text-green-600">
                      {material.required} {material.unit}
                    </span>
                  </div>
                  
                  <div className={`flex items-center justify-between p-3 rounded-lg ${
                    material.shortfall > 0 ? 'bg-red-50' : 'bg-green-50'
                  }`}>
                    <span className="text-sm font-medium">Shortfall</span>
                    <span className={`text-lg font-bold ${getStatusColor()}`}>
                      {material.shortfall > 0 ? '+' : ''}{material.shortfall} {material.unit}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Supplier Information */}
            {material.supplier_name && (
              <>
                <div>
                  <h3 className="text-lg font-medium mb-4">Supplier Information</h3>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{material.supplier_name}</span>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Additional Information */}
            <div className="grid grid-cols-2 gap-4">
              {material.cost_per_unit && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium">Cost per Unit: </span>
                    <span className="text-sm">₹{material.cost_per_unit}</span>
                  </div>
                </div>
              )}
              
              {material.last_updated && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium">Last Updated: </span>
                    <span className="text-sm">{new Date(material.last_updated).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Current Status</span>
              {getStatusBadge()}
            </div>
          </div>

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setIsReservationsOpen(true)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Reservations
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MaterialReservationsDialog
        isOpen={isReservationsOpen}
        onOpenChange={setIsReservationsOpen}
        material={material}
      />
    </>
  );
};

export default ViewRawMaterialDialog;
