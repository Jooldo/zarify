
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RawMaterialInventory from './RawMaterialInventory';
import FinishedGoodsInventory from './FinishedGoodsInventory';
import ProcurementRequestsTable from './inventory/ProcurementRequestsTable';
import ViewRequestDialog from './inventory/ViewRequestDialog';
import { useProcurementRequests } from '@/hooks/useProcurementRequests';
import type { ProcurementRequest } from '@/hooks/useProcurementRequests';

const InventoryTab = () => {
  const { requests, loading, refetch, updateRequestStatus } = useProcurementRequests();
  const [activeTab, setActiveTab] = useState("raw-materials");
  const [selectedRequest, setSelectedRequest] = useState<ProcurementRequest | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const handleRequestCreated = () => {
    refetch();
  };

  const handleViewRequest = (request: ProcurementRequest) => {
    console.log('View request:', request);
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: string) => {
    await updateRequestStatus(requestId, newStatus as 'Pending' | 'Approved' | 'Received');
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
        <p className="text-muted-foreground">
          Monitor and manage your raw materials, finished goods, and procurement requests.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="raw-materials">Raw Materials</TabsTrigger>
          <TabsTrigger value="finished-goods">Finished Goods</TabsTrigger>
          <TabsTrigger value="procurement">Procurement Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="raw-materials" className="space-y-6">
          <RawMaterialInventory onRequestCreated={handleRequestCreated} />
        </TabsContent>

        <TabsContent value="finished-goods" className="space-y-6">
          <FinishedGoodsInventory />
        </TabsContent>

        <TabsContent value="procurement" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Procurement Requests</h3>
            {loading ? (
              <div className="text-center py-8">Loading procurement requests...</div>
            ) : (
              <ProcurementRequestsTable 
                requests={requests} 
                onViewRequest={handleViewRequest}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <ViewRequestDialog
        isOpen={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        selectedRequest={selectedRequest}
        onUpdateRequestStatus={handleUpdateRequestStatus}
      />
    </div>
  );
};

export default InventoryTab;
