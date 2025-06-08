import { useState, useMemo } from 'react';
import { useProcurementRequests } from '@/hooks/useProcurementRequests';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import ProcurementRequestsTable from '@/components/inventory/ProcurementRequestsTable';
import ViewRequestDialog from '@/components/inventory/ViewRequestDialog';
import DeleteRequestDialog from '@/components/procurement/DeleteRequestDialog';
import MultiItemProcurementDialog from '@/components/procurement/MultiItemProcurementDialog';
import BOMLegacyGenerationDialog from '@/components/procurement/BOMLegacyGenerationDialog';
import ProcurementHeader from '@/components/procurement/headers/ProcurementHeader';
import RMProcurementFilter from '@/components/procurement/RMProcurementFilter';

const RMProcurementTab = () => {
  const { requests, loading, refetch, updateRequestStatus, deleteRequest } = useProcurementRequests();
  const { suppliers } = useSuppliers();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMultiItemDialogOpen, setIsMultiItemDialogOpen] = useState(false);
  const [isBOMDialogOpen, setIsBOMDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});

  const applyFilters = (requestsData: any[], appliedFilters: any) => {
    return requestsData.filter(request => {
      // Search term filter
      const materialName = request.raw_material?.name?.toLowerCase() || '';
      const materialType = request.raw_material?.type?.toLowerCase() || '';
      const requestNumber = request.request_number.toLowerCase();
      const raisedBy = request.raised_by?.toLowerCase() || '';
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = materialName.includes(searchLower) ||
                           materialType.includes(searchLower) ||
                           requestNumber.includes(searchLower) ||
                           raisedBy.includes(searchLower);
      
      if (!matchesSearch) return false;

      // Status filter
      if (appliedFilters.status && request.status !== appliedFilters.status) return false;
      
      // Material type filter
      if (appliedFilters.materialType && request.raw_material?.type !== appliedFilters.materialType) return false;
      
      // Supplier filter
      if (appliedFilters.supplier && request.supplier?.company_name !== appliedFilters.supplier) return false;
      
      // Raised by filter
      if (appliedFilters.raisedBy && !request.raised_by?.toLowerCase().includes(appliedFilters.raisedBy.toLowerCase())) return false;
      
      // Date range filters
      if (appliedFilters.dateFrom && new Date(request.date_requested) < new Date(appliedFilters.dateFrom)) return false;
      if (appliedFilters.dateTo && new Date(request.date_requested) > new Date(appliedFilters.dateTo)) return false;
      
      // Quantity range filters
      if (appliedFilters.quantityMin && request.quantity_requested < parseInt(appliedFilters.quantityMin)) return false;
      if (appliedFilters.quantityMax && request.quantity_requested > parseInt(appliedFilters.quantityMax)) return false;
      
      // Quick filters
      if (appliedFilters.hasETA && !request.eta) return false;
      if (appliedFilters.isUrgent && !request.notes?.toLowerCase().includes('urgent')) return false;
      if (appliedFilters.pendingOnly && request.status !== 'Pending') return false;
      
      return true;
    });
  };

  const filteredRequests = applyFilters(requests, filters);

  // Calculate request stats
  const requestStats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(req => req.status === 'Pending').length;
    const completed = requests.filter(req => req.status === 'Received').length;
    return { total, pending, completed };
  }, [requests]);

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const handleDeleteRequest = (request) => {
    setSelectedRequest(request);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRequest) return;
    
    setDeleteLoading(true);
    try {
      await deleteRequest(selectedRequest.id);
      setIsDeleteDialogOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error deleting request:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleGenerateBOM = (request) => {
    setSelectedRequest(request);
    setIsBOMDialogOpen(true);
  };

  const handleRequestCreated = () => {
    refetch();
    setIsMultiItemDialogOpen(false);
  };

  const handleRequestDeleted = () => {
    refetch();
    setIsDeleteDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleRequestUpdated = () => {
    refetch();
  };

  const materialTypes = [...new Set(requests.map(req => req.raw_material?.type).filter(Boolean))];
  const supplierNames = [...new Set(suppliers.map(supplier => supplier.company_name))].filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-card rounded-lg">
        <div className="text-muted-foreground">Loading procurement requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProcurementHeader 
        requestStats={requestStats}
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search procurement requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-8"
          />
        </div>
        <RMProcurementFilter
          onFiltersChange={setFilters}
          materialTypes={materialTypes}
          suppliers={supplierNames}
        />
      </div>

      <div className="bg-card rounded-lg border border-border min-h-[400px]">
        <ProcurementRequestsTable
          requests={filteredRequests}
          onViewRequest={handleViewRequest}
          onDeleteRequest={handleDeleteRequest}
          onGenerateBOM={handleGenerateBOM}
          onRaiseMultiItemRequest={() => setIsMultiItemDialogOpen(true)}
        />
      </div>

      <ViewRequestDialog
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        selectedRequest={selectedRequest}
        onUpdateRequestStatus={updateRequestStatus}
        onRequestUpdated={handleRequestUpdated}
      />

      <DeleteRequestDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        request={selectedRequest}
        onConfirmDelete={handleConfirmDelete}
        loading={deleteLoading}
      />

      <MultiItemProcurementDialog
        isOpen={isMultiItemDialogOpen}
        onOpenChange={setIsMultiItemDialogOpen}
        onRequestCreated={handleRequestCreated}
      />

      <BOMLegacyGenerationDialog
        isOpen={isBOMDialogOpen}
        onOpenChange={setIsBOMDialogOpen}
        request={selectedRequest}
      />
    </div>
  );
};

export default RMProcurementTab;
