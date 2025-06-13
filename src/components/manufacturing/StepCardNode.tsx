
import React from 'react';
import { NodeProps } from '@xyflow/react';
import ManufacturingStepCard, { StepCardData } from './ManufacturingStepCard';

export const StepCardNode: React.FC<NodeProps<StepCardData>> = ({ data }) => {
  return (
    <div>
      <ManufacturingStepCard 
        data={data}
        manufacturingSteps={[]}
        orderSteps={[]}
      />
    </div>
  );
};
