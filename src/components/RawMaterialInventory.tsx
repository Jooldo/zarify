
import { useState } from 'react';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import RawMaterialsTable from '@/components/inventory/RawMaterialsTable';
import ProcurementRequestsTable from '@/components/inventory/ProcurementRequestsTable';
import RaiseRequestDialog from '@/components/inventory/RaiseRequestDialog';
import ViewRequestDialog from '@/components/inventory/ViewRequestDialog';
import AddMaterialDialog from '@/components/inventory/AddMaterialDialog';
import InventorySearchAndFilters from '@/components/inventory/InventorySearchAndFilters';

const RawMaterialInventory = () => {
  const { rawMaterials, loading } = useRawMaterials();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isRaiseRequestOpen, setIsRaiseRequestOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [isViewRequestOpen, setIsViewRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const materialTypes = ["all", "Chain", "Kunda", "Ghungroo", "Thread", "Beads"];

  const filteredMaterials = rawMaterials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || material.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleRaiseRequest = (material: any) => {
    setSelectedMaterial(material);
    setIsRaiseRequestOpen(true);
  };

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
    setIsViewRequestOpen(true);
  };

  const handleUpdateRequestStatus = (requestId: string, newStatus: string) => {
    // This will be implemented when we add procurement requests functionality
    setIsViewRequestOpen(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <InventorySearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterType={filterType}
          onFilterChange={setFilterType}
          materialTypes={materialTypes}
        />
        <AddMaterialDialog />
      </div>

      {/* Combined Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Raw Materials Inventory & Requirements - Takes 2 columns */}
        <div className="xl:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold">Raw Materials Inventory & Requirements</h3>
          <RawMaterialsTable
            materials={filteredMaterials}
            onRaiseRequest={handleRaiseRequest}
          />
        </div>

        {/* Active Procurement Requests - Takes 1 column */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Procurement Requests</h3>
          <ProcurementRequestsTable
            requests={[]} // Will be populated when procurement requests are implemented
            onViewRequest={handleViewRequest}
          />
        </div>
      </div>

      {/* Dialogs */}
      <RaiseRequestDialog
        isOpen={isRaiseRequestOpen}
        onOpenChange={setIsRaiseRequestOpen}
        selectedMaterial={selectedMaterial}
      />

      <ViewRequestDialog
        isOpen={isViewRequestOpen}
        onOpenChange={setIsViewRequestOpen}
        selectedRequest={selectedRequest}
        onUpdateRequestStatus={handleUpdateRequestStatus}
      />
    </div>
  );
};

export default RawMaterialInventory;
