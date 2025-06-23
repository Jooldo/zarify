
import React from 'react';
import ManufacturingWorkflowConfig from './ManufacturingWorkflowConfig';

const ManufacturingConfigPanel = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manufacturing Configuration</h1>
        <p className="text-muted-foreground">
          Set up your manufacturing workflow, configure steps, and manage field visibility.
        </p>
      </div>

      <ManufacturingWorkflowConfig />
    </div>
  );
};

export default ManufacturingConfigPanel;
