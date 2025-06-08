import { useState } from 'react';
import { useProcurementRequests } from '@/hooks/useProcurementRequests';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Users, TrendingUp } from 'lucide-react';
import ProcurementRequestsTable from '../inventory/ProcurementRequestsTable';
import ViewRequestDialog from '../inventory/ViewRequestDialog';
import RaiseRequestDialog from '../inventory/RaiseRequestDialog';
import MultiItemProcurementDialog from './MultiItemProcurementDialog';
import BOMLegacyGenerationDialog from './BOMLegacyGenerationDialog';
import DeleteRequestDialog from './DeleteRequestDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { ProcurementRequest } from '@/hooks/useProcurementRequests';
import type { RawMaterial } from '@/hooks/useRawMaterials';

const RMProcurementTab = () => {
  const { requests, loading, updateRequestStatus, refetch, deleteRequest } = useProcurementRequests();
  const { rawMaterials } = useRawMaterials();
  const [selectedRequest, setSelectedRequest] = useState<ProcurementRequest | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [raiseRequestOpen, setRaiseRequestOpen] = useState(false);
  const [multiItemDialogOpen, setMultiItemDialogOpen] = useState(false);
  const [bomDialogOpen, setBomDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [materialForRequest, setMaterialForRequest] = useState<string>('');
  const [activeTab, setActiveTab] = useState("requests");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleViewRequest = (request: ProcurementRequest) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const handleDeleteRequest = (request: ProcurementRequest) => {
    setSelectedRequest(request);
    setDeleteDialogOpen(true);
  };

  const handleGenerateBOM = (request: ProcurementRequest) => {
    setSelectedRequest(request);
    setBomDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRequest) return;
    
    setDeleteLoading(true);
    try {
      await deleteRequest(selectedRequest.id);
      setDeleteDialogOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: string) => {
    await updateRequestStatus(requestId, newStatus as 'Pending' | 'Approved' | 'Received');
    refetch();
  };

  const handleRequestUpdated = () => {
    refetch(); // Refresh the table when request is updated
  };

  const handleRaiseRequest = () => {
    setSelectedMaterial(null);
    setMaterialForRequest('');
    setRaiseRequestOpen(true);
  };

  const handleRaiseMultiItemRequest = () => {
    setMultiItemDialogOpen(true);
  };

  const handleMaterialSelect = (materialId: string) => {
    const material = rawMaterials.find(m => m.id === materialId);
    setSelectedMaterial(material || null);
    setMaterialForRequest(materialId);
  };

  const handleRequestCreated = () => {
    refetch();
    setRaiseRequestOpen(false);
    setMultiItemDialogOpen(false);
    setSelectedMaterial(null);
    setMaterialForRequest('');
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Procurement Requests
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Supplier Management
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Procurement Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests" className="space-y-4 mt-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">Raw Material Procurement Requests</h3>
            {loading ? (
              <div className="text-center py-8">Loading procurement requests...</div>
            ) : (
              <ProcurementRequestsTable 
                requests={requests} 
                onViewRequest={handleViewRequest}
                onDeleteRequest={handleDeleteRequest}
                onGenerateBOM={handleGenerateBOM}
                onRaiseRequest={handleRaiseRequest}
                onRaiseMultiItemRequest={handleRaiseMultiItemRequest}
              />
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="suppliers" className="space-y-4 mt-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Supplier Management</h3>
            <p className="text-muted-foreground">
              Manage your raw material suppliers, contracts, and relationships.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                🚧 Supplier management features will be available soon. You can currently manage suppliers through the Raw Material Config section.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4 mt-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Procurement Analytics</h3>
            <p className="text-muted-foreground">
              View insights and analytics for raw material procurement performance.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                📊 Procurement analytics dashboard coming soon. Track spending, delivery times, and supplier performance.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ViewRequestDialog
        isOpen={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        selectedRequest={selectedRequest}
        onUpdateRequestStatus={handleUpdateRequestStatus}
        onRequestUpdated={handleRequestUpdated}
      />

      <BOMLegacyGenerationDialog
        isOpen={bomDialogOpen}
        onOpenChange={setBomDialogOpen}
        request={selectedRequest}
      />

      <DeleteRequestDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        request={selectedRequest}
        onConfirmDelete={handleConfirmDelete}
        loading={deleteLoading}
      />

      <MultiItemProcurementDialog
        isOpen={multiItemDialogOpen}
        onOpenChange={setMultiItemDialogOpen}
        onRequestCreated={handleRequestCreated}
      />

      {raiseRequestOpen && (
        <>
          {!selectedMaterial ? (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Select Raw Material</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="material">Raw Material</Label>
                    <Select value={materialForRequest} onValueChange={handleMaterialSelect}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a raw material" />
                      </SelectTrigger>
                      <SelectContent>
                        {rawMaterials.map((material) => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.name} ({material.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setRaiseRequestOpen(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <RaiseRequestDialog
              isOpen={raiseRequestOpen}
              onOpenChange={setRaiseRequestOpen}
              material={selectedMaterial}
              onRequestCreated={handleRequestCreated}
              mode="procurement"
            />
          )}
        </>
      )}
    </div>
  );
};

export default RMProcurementTab;
