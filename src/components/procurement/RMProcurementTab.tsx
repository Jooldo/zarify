import { useState, useMemo } from 'react';
import { useProcurementRequests } from '@/hooks/useProcurementRequests';
import { useSuppliers } from '@/hooks/useSuppliers';
import ProcurementRequestsTable from '@/components/inventory/ProcurementRequestsTable';
import ViewRequestDialog from '@/components/inventory/ViewRequestDialog';
import DeleteRequestDialog from '@/components/procurement/DeleteRequestDialog';
import MultiItemProcurementDialog from '@/components/procurement/MultiItemProcurementDialog';
import BOMLegacyGenerationDialog from '@/components/procurement/BOMLegacyGenerationDialog';
import ProcurementHeader from '@/components/procurement/headers/ProcurementHeader';

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

  // Calculate request stats
  const requestStats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(req => req.status === 'Pending').length;
    const completed = requests.filter(req => req.status === 'Received').length;
    return { total, pending, completed };
  }, [requests]);

  // Filter requests based on search term
  const filteredRequests = useMemo(() => {
    if (!searchTerm) return requests;
    
    return requests.filter(request => {
      const materialName = request.raw_material?.name?.toLowerCase() || '';
      const materialType = request.raw_material?.type?.toLowerCase() || '';
      const requestNumber = request.request_number.toLowerCase();
      const raisedBy = request.raised_by?.toLowerCase() || '';
      const searchLower = searchTerm.toLowerCase();
      
      return materialName.includes(searchLower) ||
             materialType.includes(searchLower) ||
             requestNumber.includes(searchLower) ||
             raisedBy.includes(searchLower);
    });
  }, [requests, searchTerm]);

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
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

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
