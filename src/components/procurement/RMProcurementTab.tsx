
import { useState, useMemo } from 'react';
import { useProcurementRequests } from '@/hooks/useProcurementRequests';
import { useSuppliers } from '@/hooks/useSuppliers';
import ProcurementRequestsTable from '@/components/inventory/ProcurementRequestsTable';
import ViewRequestDialog from '@/components/inventory/ViewRequestDialog';
import DeleteRequestDialog from '@/components/procurement/DeleteRequestDialog';
import MultiItemProcurementDialog from '@/components/procurement/MultiItemProcurementDialog';
import BOMLegacyGenerationDialog from '@/components/procurement/BOMLegacyGenerationDialog';
import ProcurementFilters from '@/components/procurement/ProcurementFilters';

const RMProcurementTab = () => {
  const { requests, loading, refetch, updateRequestStatus, deleteRequest } = useProcurementRequests();
  const { suppliers } = useSuppliers();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMultiItemDialogOpen, setIsMultiItemDialogOpen] = useState(false);
  const [isBOMDialogOpen, setIsBOMDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    status: 'all',
    supplier: 'all',
    materialType: 'all',
    raisedBy: 'all',
    dateFrom: '',
    dateTo: ''
  });

  // Extract filter options from data
  const filterOptions = useMemo(() => {
    const supplierNames = [...new Set(
      requests
        .map(req => suppliers.find(s => s.id === req.supplier_id)?.company_name)
        .filter(Boolean)
    )].sort();

    const materialTypes = [...new Set(
      requests
        .map(req => req.raw_material?.type)
        .filter(Boolean)
    )].sort();

    const raisedByOptions = [...new Set(
      requests
        .map(req => req.raised_by)
        .filter(Boolean)
    )].sort();

    return { supplierNames, materialTypes, raisedByOptions };
  }, [requests, suppliers]);

  // Filter requests based on current filters
  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      // Status filter
      if (filters.status !== 'all' && request.status !== filters.status) {
        return false;
      }

      // Supplier filter
      if (filters.supplier !== 'all') {
        const supplier = suppliers.find(s => s.id === request.supplier_id);
        if (!supplier || supplier.company_name !== filters.supplier) {
          return false;
        }
      }

      // Material type filter
      if (filters.materialType !== 'all' && request.raw_material?.type !== filters.materialType) {
        return false;
      }

      // Raised by filter
      if (filters.raisedBy !== 'all' && request.raised_by !== filters.raisedBy) {
        return false;
      }

      // Date filters
      if (filters.dateFrom && new Date(request.date_requested) < new Date(filters.dateFrom)) {
        return false;
      }

      if (filters.dateTo && new Date(request.date_requested) > new Date(filters.dateTo)) {
        return false;
      }

      return true;
    });
  }, [requests, filters, suppliers]);

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

  if (loading) {
    return <div>Loading procurement requests...</div>;
  }

  return (
    <div className="space-y-6">
      <ProcurementFilters
        filters={filters}
        onFiltersChange={setFilters}
        suppliers={filterOptions.supplierNames}
        materialTypes={filterOptions.materialTypes}
        raisedByOptions={filterOptions.raisedByOptions}
      />

      <ProcurementRequestsTable
        requests={filteredRequests}
        onViewRequest={handleViewRequest}
        onDeleteRequest={handleDeleteRequest}
        onGenerateBOM={handleGenerateBOM}
        onRaiseMultiItemRequest={() => setIsMultiItemDialogOpen(true)}
      />

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
