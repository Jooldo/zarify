
import { useState } from 'react';
import { useProcurementRequests } from '@/hooks/useProcurementRequests';
import ProcurementRequestsTable from '@/components/inventory/ProcurementRequestsTable';
import ViewRequestDialog from '@/components/inventory/ViewRequestDialog';
import DeleteRequestDialog from '@/components/procurement/DeleteRequestDialog';
import MultiItemProcurementDialog from '@/components/procurement/MultiItemProcurementDialog';
import BOMLegacyGenerationDialog from '@/components/procurement/BOMLegacyGenerationDialog';

const RMProcurementTab = () => {
  const { requests, loading, refetch } = useProcurementRequests();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMultiItemDialogOpen, setIsMultiItemDialogOpen] = useState(false);
  const [isBOMDialogOpen, setIsBOMDialogOpen] = useState(false);

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const handleDeleteRequest = (request) => {
    setSelectedRequest(request);
    setIsDeleteDialogOpen(true);
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

  if (loading) {
    return <div>Loading procurement requests...</div>;
  }

  return (
    <div className="space-y-6">
      <ProcurementRequestsTable
        requests={requests}
        onViewRequest={handleViewRequest}
        onDeleteRequest={handleDeleteRequest}
        onGenerateBOM={handleGenerateBOM}
        onRaiseMultiItemRequest={() => setIsMultiItemDialogOpen(true)}
      />

      <ViewRequestDialog
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        request={selectedRequest}
      />

      <DeleteRequestDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        request={selectedRequest}
        onRequestDeleted={handleRequestDeleted}
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
