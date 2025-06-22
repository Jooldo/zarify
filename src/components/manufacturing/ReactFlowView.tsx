
import React from 'react';
import ManufacturingFlowView from './ManufacturingFlowView';

interface ReactFlowViewProps {
  manufacturingOrders: any[];
  onViewDetails: (order: any) => void;
}

const ReactFlowView: React.FC<ReactFlowViewProps> = ({ manufacturingOrders, onViewDetails }) => {
  return <ManufacturingFlowView manufacturingOrders={manufacturingOrders} onViewDetails={onViewDetails} />;
};

export default ReactFlowView;
