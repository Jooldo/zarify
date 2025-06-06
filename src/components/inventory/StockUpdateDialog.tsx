
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package } from 'lucide-react';
import type { FinishedGood } from '@/hooks/useFinishedGoods';
import TagScanInterface from './TagScanInterface';

interface StockUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: FinishedGood | null;
  onProductUpdated: () => void;
}

const StockUpdateDialog = ({ isOpen, onOpenChange, product, onProductUpdated }: StockUpdateDialogProps) => {
  const handleTagOperationComplete = () => {
    onProductUpdated();
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Update Stock - {product.product_code}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Context Card */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Product Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Category:</span>
                <p className="font-medium">{product.product_config.category}</p>
              </div>
              <div>
                <span className="text-gray-600">Subcategory:</span>
                <p className="font-medium">{product.product_config.subcategory}</p>
              </div>
              <div>
                <span className="text-gray-600">Size:</span>
                <p className="font-medium">{product.product_config.size_value}" inches</p>
              </div>
              <div>
                <span className="text-gray-600">Weight Range:</span>
                <p className="font-medium">{product.product_config.weight_range || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Current Stock Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Current Stock Status</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600">Current Stock</p>
                <p className="text-lg font-bold text-blue-600">{product.current_stock}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Threshold</p>
                <p className="text-lg font-bold text-gray-700">{product.threshold}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">In Manufacturing</p>
                <p className="text-lg font-bold text-green-600">{product.in_manufacturing}</p>
              </div>
            </div>
          </div>

          {/* Tag Scanning Interface */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Scan Tag to Update Stock</h3>
            <TagScanInterface onOperationComplete={handleTagOperationComplete} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockUpdateDialog;
