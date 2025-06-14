
import React from 'react';
import { ManufacturingOrder } from '@/types/manufacturing';
import ManufacturingOrderCard from './ManufacturingOrderCard';

interface ProductionFlowViewProps {
  manufacturingOrders: ManufacturingOrder[];
  onViewDetails: (order: ManufacturingOrder) => void;
}

const ProductionFlowView = ({ manufacturingOrders, onViewDetails }: ProductionFlowViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {manufacturingOrders.map((order) => (
        <ManufacturingOrderCard
          key={order.id}
          order={order}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default ProductionFlowView;
