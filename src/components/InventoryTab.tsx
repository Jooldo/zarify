
import { useState } from 'react';

const InventoryTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
        <p className="text-muted-foreground">
          Monitor and manage your raw materials and finished goods inventory.
        </p>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Inventory Overview</h3>
          <p>
            Use the sidebar navigation to access detailed inventory sections:
          </p>
          <ul className="list-disc ml-6 mt-2">
            <li className="mb-1"><strong>Raw Materials</strong> - Track raw materials and manage procurement requests</li>
            <li className="mb-1"><strong>Finished Goods</strong> - Monitor finished product inventory and stock levels</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InventoryTab;
