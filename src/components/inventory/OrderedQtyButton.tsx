
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrderedQtyDetails } from '@/hooks/useOrderedQtyDetails';
import OrderedQtyDetailsDialog from './OrderedQtyDetailsDialog';

interface OrderedQtyButtonProps {
  productCode?: string;
  materialId?: string;
  materialName?: string;
  orderedQuantity: number;
  type: 'finished-good' | 'raw-material';
}

const OrderedQtyButton = ({ 
  productCode, 
  materialId, 
  materialName, 
  orderedQuantity, 
  type 
}: OrderedQtyButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const { loading, fetchFinishedGoodOrderDetails, fetchRawMaterialOrderDetails } = useOrderedQtyDetails();

  const handleClick = async () => {
    if (orderedQuantity <= 0) return;
    
    let details = [];
    if (type === 'finished-good' && productCode) {
      details = await fetchFinishedGoodOrderDetails(productCode);
    } else if (type === 'raw-material' && materialId) {
      details = await fetchRawMaterialOrderDetails(materialId);
    }
    
    setOrderDetails(details);
    setIsDialogOpen(true);
  };

  if (orderedQuantity <= 0) {
    return (
      <Badge variant="outline" className="text-xs">
        0
      </Badge>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className="h-6 px-2 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50"
      >
        {orderedQuantity}
      </Button>
      
      <OrderedQtyDetailsDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        productCode={productCode}
        materialName={materialName}
        orderDetails={orderDetails}
        totalQuantity={orderedQuantity}
        loading={loading}
      />
    </>
  );
};

export default OrderedQtyButton;
