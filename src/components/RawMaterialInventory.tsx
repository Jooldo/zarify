import { useState } from 'react';
import RawMaterialsTable from '@/components/inventory/RawMaterialsTable';
import ProcurementRequestsTable from '@/components/inventory/ProcurementRequestsTable';
import RaiseRequestDialog from '@/components/inventory/RaiseRequestDialog';
import ViewRequestDialog from '@/components/inventory/ViewRequestDialog';
import AddMaterialDialog from '@/components/inventory/AddMaterialDialog';
import InventorySearchAndFilters from '@/components/inventory/InventorySearchAndFilters';

interface RawMaterial {
  id: number;
  name: string;
  type: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  lastUpdated: string;
  supplier: string;
  costPerUnit: number;
  required: number;
  inProcurement: number;
  requestStatus: string;
}

interface ProcurementRequest {
  id: string;
  materialName: string;
  materialId: number;
  quantityRequested: number;
  unit: string;
  dateRequested: string;
  status: string;
  supplier: string;
  eta?: string;
  notes?: string;
}

const RawMaterialInventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isRaiseRequestOpen, setIsRaiseRequestOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [isViewRequestOpen, setIsViewRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ProcurementRequest | null>(null);

  // Combined raw materials data with requirements
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([
    {
      id: 1,
      name: "Silver Chain",
      type: "Chain",
      currentStock: 15,
      minimumStock: 50,
      unit: "meters",
      lastUpdated: "2024-06-01",
      supplier: "Mumbai Silver Co.",
      costPerUnit: 120,
      required: 120,
      inProcurement: 100,
      requestStatus: "Approved"
    },
    {
      id: 2,
      name: "Gold Kunda",
      type: "Kunda",
      currentStock: 8,
      minimumStock: 20,
      unit: "pieces",
      lastUpdated: "2024-05-30",
      supplier: "Rajasthan Crafts",
      costPerUnit: 25,
      required: 50,
      inProcurement: 0,
      requestStatus: "None"
    },
    {
      id: 3,
      name: "Small Ghungroo",
      type: "Ghungroo",
      currentStock: 25,
      minimumStock: 100,
      unit: "pieces",
      lastUpdated: "2024-06-02",
      supplier: "Delhi Accessories",
      costPerUnit: 5,
      required: 200,
      inProcurement: 0,
      requestStatus: "None"
    },
    {
      id: 4,
      name: "Cotton Thread",
      type: "Thread",
      currentStock: 5,
      minimumStock: 10,
      unit: "rolls",
      lastUpdated: "2024-05-29",
      supplier: "Local Supplier",
      costPerUnit: 15,
      required: 30,
      inProcurement: 50,
      requestStatus: "Pending"
    },
    {
      id: 5,
      name: "Brass Beads",
      type: "Beads",
      currentStock: 150,
      minimumStock: 100,
      unit: "pieces",
      lastUpdated: "2024-06-01",
      supplier: "Artisan Supplies",
      costPerUnit: 2,
      required: 100,
      inProcurement: 0,
      requestStatus: "None"
    },
    {
      id: 6,
      name: "Silk Thread",
      type: "Thread",
      currentStock: 12,
      minimumStock: 15,
      unit: "rolls",
      lastUpdated: "2024-05-31",
      supplier: "Textile Hub",
      costPerUnit: 30,
      required: 25,
      inProcurement: 0,
      requestStatus: "None"
    }
  ]);

  const [procurementRequests, setProcurementRequests] = useState<ProcurementRequest[]>([
    {
      id: "PR-001",
      materialName: "Cotton Thread",
      materialId: 4,
      quantityRequested: 50,
      unit: "rolls",
      dateRequested: "2024-06-01",
      status: "Pending",
      supplier: "Local Supplier",
      eta: "2024-06-10",
      notes: "Urgent requirement for large orders"
    },
    {
      id: "PR-002",
      materialName: "Silver Chain",
      materialId: 1,
      quantityRequested: 100,
      unit: "meters",
      dateRequested: "2024-05-30",
      status: "Approved",
      supplier: "Mumbai Silver Co.",
      eta: "2024-06-05"
    }
  ]);

  const materialTypes = ["all", "Chain", "Kunda", "Ghungroo", "Thread", "Beads"];

  const filteredMaterials = rawMaterials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || material.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleRaiseRequest = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setIsRaiseRequestOpen(true);
  };

  const handleViewRequest = (request: ProcurementRequest) => {
    setSelectedRequest(request);
    setIsViewRequestOpen(true);
  };

  const handleUpdateRequestStatus = (requestId: string, newStatus: string) => {
    setProcurementRequests(prev => prev.map(request => {
      if (request.id === requestId && newStatus === 'Received') {
        // Update the corresponding raw material stock
        setRawMaterials(materials => materials.map(material => {
          if (material.id === request.materialId) {
            return {
              ...material,
              currentStock: material.currentStock + request.quantityRequested,
              inProcurement: Math.max(0, material.inProcurement - request.quantityRequested)
            };
          }
          return material;
        }));
      }
      return { ...request, status: newStatus };
    }));
    setIsViewRequestOpen(false);
  };

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
        {/* Combined Raw Materials Inventory & Requirements - Takes 2 columns */}
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
            requests={procurementRequests}
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
