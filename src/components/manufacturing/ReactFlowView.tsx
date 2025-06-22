
import React from 'react';
import MultiBranchReactFlowView from './MultiBranchReactFlowView';

interface ReactFlowViewProps {
  manufacturingOrders: any[];
  onViewDetails: (order: any) => void;
}

const ReactFlowView: React.FC<ReactFlowViewProps> = ({ manufacturingOrders, onViewDetails }) => {
  return <MultiBranchReactFlowView manufacturingOrders={manufacturingOrders} onViewDetails={onViewDetails} />;
};

export default ReactFlowView;
